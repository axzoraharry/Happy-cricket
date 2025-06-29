from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    BET_PLACED = "bet_placed"
    BET_WON = "bet_won"
    BET_LOST = "bet_lost"
    REFERRAL_BONUS = "referral_bonus"
    WELCOME_BONUS = "welcome_bonus"
    CONVERSION_INR_TO_HC = "conversion_inr_to_hc"
    CONVERSION_HC_TO_INR = "conversion_hc_to_inr"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    UPI = "upi"
    BANK_TRANSFER = "bank_transfer"
    CRYPTO = "crypto"

class WalletBase(BaseModel):
    user_id: str
    
class Wallet(WalletBase):
    wallet_id: str
    happy_coin_balance: float = 0.0
    inr_balance: float = 0.0
    total_deposited: float = 0.0
    total_withdrawn: float = 0.0
    total_bet_amount: float = 0.0
    total_winnings: float = 0.0
    created_at: datetime
    updated_at: datetime

class TransactionBase(BaseModel):
    user_id: str
    transaction_type: TransactionType
    amount: float
    currency: str  # "INR" or "HC" (Happy Coin)
    description: str
    
class TransactionCreate(TransactionBase):
    payment_method: Optional[PaymentMethod] = None
    external_transaction_id: Optional[str] = None
    
class Transaction(TransactionBase):
    transaction_id: str
    wallet_id: str
    status: TransactionStatus
    payment_method: Optional[PaymentMethod] = None
    external_transaction_id: Optional[str] = None
    balance_before: float
    balance_after: float
    created_at: datetime
    updated_at: datetime

class DepositRequest(BaseModel):
    amount: float
    payment_method: PaymentMethod
    currency: str = "INR"
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        if v < 100:  # Minimum deposit 100 INR
            raise ValueError('Minimum deposit amount is 100 INR')
        return v

class WithdrawalRequest(BaseModel):
    amount: float
    currency: str = "INR"
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        if v < 500:  # Minimum withdrawal 500 INR
            raise ValueError('Minimum withdrawal amount is 500 INR')
        return v

class ConversionRequest(BaseModel):
    amount: float
    from_currency: str  # "INR" or "HC"
    to_currency: str    # "INR" or "HC"
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

class WalletResponse(BaseModel):
    wallet_id: str
    user_id: str
    happy_coin_balance: float
    inr_balance: float
    total_deposited: float
    total_withdrawn: float
    total_bet_amount: float
    total_winnings: float
    
class TransactionResponse(BaseModel):
    transaction_id: str
    transaction_type: TransactionType
    amount: float
    currency: str
    status: TransactionStatus
    description: str
    created_at: datetime