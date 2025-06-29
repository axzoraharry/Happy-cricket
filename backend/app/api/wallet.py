from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.wallet import (
    WalletResponse, DepositRequest, WithdrawalRequest, 
    ConversionRequest, TransactionResponse, Transaction
)
from ..services.wallet_service import wallet_service
from ..api.auth import get_current_user
from ..models.user import UserResponse

router = APIRouter()

@router.get("/balance", response_model=WalletResponse)
async def get_wallet_balance(current_user: UserResponse = Depends(get_current_user)):
    """Get user wallet balance"""
    try:
        wallet = await wallet_service.get_wallet(current_user.user_id)
        
        if not wallet:
            # Create wallet if not exists
            wallet = await wallet_service.create_wallet(current_user.user_id)
        
        return WalletResponse(
            wallet_id=wallet.wallet_id,
            user_id=wallet.user_id,
            happy_coin_balance=wallet.happy_coin_balance,
            inr_balance=wallet.inr_balance,
            total_deposited=wallet.total_deposited,
            total_withdrawn=wallet.total_withdrawn,
            total_bet_amount=wallet.total_bet_amount,
            total_winnings=wallet.total_winnings
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch wallet balance"
        )

@router.post("/deposit")
async def deposit_funds(
    deposit_data: DepositRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Deposit funds to wallet"""
    try:
        transaction = await wallet_service.process_deposit(current_user.user_id, deposit_data)
        
        return {
            "message": "Deposit processed successfully",
            "transaction_id": transaction.transaction_id,
            "amount": transaction.amount,
            "currency": transaction.currency,
            "status": transaction.status
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/withdraw")
async def withdraw_funds(
    withdrawal_data: WithdrawalRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Withdraw funds from wallet"""
    try:
        transaction = await wallet_service.process_withdrawal(current_user.user_id, withdrawal_data)
        
        return {
            "message": "Withdrawal processed successfully",
            "transaction_id": transaction.transaction_id,
            "amount": abs(transaction.amount),
            "currency": transaction.currency,
            "status": transaction.status
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/convert")
async def convert_currency(
    conversion_data: ConversionRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Convert between INR and Happy Coin"""
    try:
        transaction = await wallet_service.convert_currency(current_user.user_id, conversion_data)
        
        return {
            "message": "Currency conversion completed successfully",
            "transaction_id": transaction.transaction_id,
            "description": transaction.description,
            "status": transaction.status
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transaction_history(
    skip: int = 0,
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get transaction history"""
    try:
        transactions = await wallet_service.get_transactions(current_user.user_id, skip, limit)
        
        transaction_responses = []
        for transaction in transactions:
            transaction_responses.append(TransactionResponse(
                transaction_id=transaction.transaction_id,
                transaction_type=transaction.transaction_type,
                amount=transaction.amount,
                currency=transaction.currency,
                status=transaction.status,
                description=transaction.description,
                created_at=transaction.created_at
            ))
        
        return transaction_responses
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transaction history"
        )

@router.get("/conversion-rate")
async def get_conversion_rate():
    """Get current INR to Happy Coin conversion rate"""
    return {
        "conversion_rate": wallet_service.conversion_rate,
        "description": f"1 Happy Coin = ₹{wallet_service.conversion_rate} INR"
    }