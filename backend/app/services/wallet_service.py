from typing import Optional, List
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import get_database
from ..core.config import settings
from ..models.wallet import (
    Wallet, Transaction, TransactionCreate, TransactionType, 
    TransactionStatus, DepositRequest, WithdrawalRequest, ConversionRequest
)
from fastapi import HTTPException, status

class WalletService:
    """Service for wallet and transaction management"""
    
    def __init__(self):
        self.wallets_collection = "wallets"
        self.transactions_collection = "transactions"
        self.conversion_rate = settings.HAPPY_COIN_CONVERSION_RATE  # 1 HC = 1000 INR
    
    async def create_wallet(self, user_id: str) -> Wallet:
        """Create a new wallet for user"""
        db = await get_database()
        collection = db[self.wallets_collection]
        
        # Check if wallet already exists
        existing_wallet = await collection.find_one({"user_id": user_id})
        if existing_wallet:
            return Wallet(**existing_wallet)
        
        wallet_id = str(uuid.uuid4())
        
        wallet_doc = {
            "wallet_id": wallet_id,
            "user_id": user_id,
            "happy_coin_balance": 0.0,
            "inr_balance": 0.0,
            "total_deposited": 0.0,
            "total_withdrawn": 0.0,
            "total_bet_amount": 0.0,
            "total_winnings": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await collection.insert_one(wallet_doc)
        
        if result.inserted_id:
            return Wallet(**wallet_doc)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create wallet"
            )
    
    async def get_wallet(self, user_id: str) -> Optional[Wallet]:
        """Get user wallet"""
        db = await get_database()
        collection = db[self.wallets_collection]
        
        wallet = await collection.find_one({"user_id": user_id})
        if wallet:
            return Wallet(**wallet)
        return None
    
    async def get_wallet_by_id(self, wallet_id: str) -> Optional[Wallet]:
        """Get wallet by wallet ID"""
        db = await get_database()
        collection = db[self.wallets_collection]
        
        wallet = await collection.find_one({"wallet_id": wallet_id})
        if wallet:
            return Wallet(**wallet)
        return None
    
    async def update_balance(self, user_id: str, amount: float, currency: str, transaction_type: TransactionType) -> bool:
        """Update wallet balance"""
        db = await get_database()
        collection = db[self.wallets_collection]
        
        wallet = await self.get_wallet(user_id)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found"
            )
        
        update_fields = {"updated_at": datetime.utcnow()}
        
        if currency == "HC":  # Happy Coin
            new_balance = wallet.happy_coin_balance + amount
            if new_balance < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient Happy Coin balance"
                )
            update_fields["happy_coin_balance"] = new_balance
        
        elif currency == "INR":
            new_balance = wallet.inr_balance + amount
            if new_balance < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient INR balance"
                )
            update_fields["inr_balance"] = new_balance
        
        # Update totals based on transaction type
        if transaction_type == TransactionType.DEPOSIT:
            update_fields["total_deposited"] = wallet.total_deposited + abs(amount)
        elif transaction_type == TransactionType.WITHDRAWAL:
            update_fields["total_withdrawn"] = wallet.total_withdrawn + abs(amount)
        elif transaction_type in [TransactionType.BET_PLACED]:
            update_fields["total_bet_amount"] = wallet.total_bet_amount + abs(amount)
        elif transaction_type in [TransactionType.BET_WON]:
            update_fields["total_winnings"] = wallet.total_winnings + abs(amount)
        
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": update_fields}
        )
        
        return result.modified_count > 0
    
    async def create_transaction(self, transaction_data: TransactionCreate) -> Transaction:
        """Create a new transaction"""
        db = await get_database()
        transactions = db[self.transactions_collection]
        
        wallet = await self.get_wallet(transaction_data.user_id)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found"
            )
        
        # Get balance before transaction
        if transaction_data.currency == "HC":
            balance_before = wallet.happy_coin_balance
        else:
            balance_before = wallet.inr_balance
        
        transaction_id = str(uuid.uuid4())
        
        transaction_doc = {
            "transaction_id": transaction_id,
            "user_id": transaction_data.user_id,
            "wallet_id": wallet.wallet_id,
            "transaction_type": transaction_data.transaction_type,
            "amount": transaction_data.amount,
            "currency": transaction_data.currency,
            "description": transaction_data.description,
            "status": TransactionStatus.PENDING,
            "payment_method": transaction_data.payment_method,
            "external_transaction_id": transaction_data.external_transaction_id,
            "balance_before": balance_before,
            "balance_after": balance_before,  # Will be updated after balance update
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await transactions.insert_one(transaction_doc)
        
        if result.inserted_id:
            return Transaction(**transaction_doc)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create transaction"
            )
    
    async def process_deposit(self, user_id: str, deposit_data: DepositRequest) -> Transaction:
        """Process deposit transaction"""
        # Create transaction record
        transaction_create = TransactionCreate(
            user_id=user_id,
            transaction_type=TransactionType.DEPOSIT,
            amount=deposit_data.amount,
            currency=deposit_data.currency,
            description=f"Deposit via {deposit_data.payment_method}",
            payment_method=deposit_data.payment_method
        )
        
        transaction = await self.create_transaction(transaction_create)
        
        try:
            # Update wallet balance
            await self.update_balance(user_id, deposit_data.amount, deposit_data.currency, TransactionType.DEPOSIT)
            
            # Update transaction status and balance_after
            await self.update_transaction_status(transaction.transaction_id, TransactionStatus.COMPLETED)
            
            # Give welcome bonus for first deposit
            await self._check_and_give_welcome_bonus(user_id)
            
            return transaction
            
        except Exception as e:
            # Mark transaction as failed
            await self.update_transaction_status(transaction.transaction_id, TransactionStatus.FAILED)
            raise e
    
    async def process_withdrawal(self, user_id: str, withdrawal_data: WithdrawalRequest) -> Transaction:
        """Process withdrawal transaction"""
        wallet = await self.get_wallet(user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Check sufficient balance
        current_balance = wallet.happy_coin_balance if withdrawal_data.currency == "HC" else wallet.inr_balance
        if current_balance < withdrawal_data.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )
        
        # Create transaction record
        transaction_create = TransactionCreate(
            user_id=user_id,
            transaction_type=TransactionType.WITHDRAWAL,
            amount=-withdrawal_data.amount,  # Negative for withdrawal
            currency=withdrawal_data.currency,
            description=f"Withdrawal to bank account",
        )
        
        transaction = await self.create_transaction(transaction_create)
        
        try:
            # Update wallet balance
            await self.update_balance(user_id, -withdrawal_data.amount, withdrawal_data.currency, TransactionType.WITHDRAWAL)
            
            # Update transaction status
            await self.update_transaction_status(transaction.transaction_id, TransactionStatus.COMPLETED)
            
            return transaction
            
        except Exception as e:
            await self.update_transaction_status(transaction.transaction_id, TransactionStatus.FAILED)
            raise e
    
    async def convert_currency(self, user_id: str, conversion_data: ConversionRequest) -> Transaction:
        """Convert between INR and Happy Coin"""
        wallet = await self.get_wallet(user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Calculate conversion
        if conversion_data.from_currency == "INR" and conversion_data.to_currency == "HC":
            # INR to Happy Coin
            happy_coins = conversion_data.amount / self.conversion_rate
            
            if wallet.inr_balance < conversion_data.amount:
                raise HTTPException(status_code=400, detail="Insufficient INR balance")
            
            # Update balances
            await self.update_balance(user_id, -conversion_data.amount, "INR", TransactionType.CONVERSION_INR_TO_HC)
            await self.update_balance(user_id, happy_coins, "HC", TransactionType.CONVERSION_INR_TO_HC)
            
            description = f"Converted ₹{conversion_data.amount} to {happy_coins} HC"
            
        elif conversion_data.from_currency == "HC" and conversion_data.to_currency == "INR":
            # Happy Coin to INR
            inr_amount = conversion_data.amount * self.conversion_rate
            
            if wallet.happy_coin_balance < conversion_data.amount:
                raise HTTPException(status_code=400, detail="Insufficient Happy Coin balance")
            
            # Update balances
            await self.update_balance(user_id, -conversion_data.amount, "HC", TransactionType.CONVERSION_HC_TO_INR)
            await self.update_balance(user_id, inr_amount, "INR", TransactionType.CONVERSION_HC_TO_INR)
            
            description = f"Converted {conversion_data.amount} HC to ₹{inr_amount}"
        
        else:
            raise HTTPException(status_code=400, detail="Invalid currency conversion")
        
        # Create transaction record
        transaction_create = TransactionCreate(
            user_id=user_id,
            transaction_type=TransactionType.CONVERSION_INR_TO_HC if conversion_data.from_currency == "INR" else TransactionType.CONVERSION_HC_TO_INR,
            amount=conversion_data.amount,
            currency=conversion_data.from_currency,
            description=description
        )
        
        transaction = await self.create_transaction(transaction_create)
        await self.update_transaction_status(transaction.transaction_id, TransactionStatus.COMPLETED)
        
        return transaction
    
    async def update_transaction_status(self, transaction_id: str, status: TransactionStatus) -> bool:
        """Update transaction status"""
        db = await get_database()
        collection = db[self.transactions_collection]
        
        result = await collection.update_one(
            {"transaction_id": transaction_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    
    async def get_transactions(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Transaction]:
        """Get user transactions with pagination"""
        db = await get_database()
        collection = db[self.transactions_collection]
        
        cursor = collection.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        transactions = []
        
        async for transaction_doc in cursor:
            transactions.append(Transaction(**transaction_doc))
        
        return transactions
    
    async def _check_and_give_welcome_bonus(self, user_id: str):
        """Give welcome bonus for first deposit"""
        transactions = await self.get_transactions(user_id)
        
        # Check if this is the first successful deposit
        deposit_count = len([t for t in transactions if t.transaction_type == TransactionType.DEPOSIT and t.status == TransactionStatus.COMPLETED])
        
        if deposit_count == 1:  # First deposit
            # Give 1 Happy Coin as welcome bonus
            bonus_transaction = TransactionCreate(
                user_id=user_id,
                transaction_type=TransactionType.WELCOME_BONUS,
                amount=1.0,
                currency="HC",
                description="Welcome bonus - 1 Happy Coin"
            )
            
            await self.create_transaction(bonus_transaction)
            await self.update_balance(user_id, 1.0, "HC", TransactionType.WELCOME_BONUS)

# Global wallet service instance
wallet_service = WalletService()