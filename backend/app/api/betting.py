from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.betting import BetCreate, BetResponse, BettingHistory, MatchBettingInfo
from ..models.user import UserResponse
from ..api.auth import get_current_user
from ..services.wallet_service import wallet_service
from ..models.wallet import TransactionCreate, TransactionType

router = APIRouter()

@router.post("/place-bet")
async def place_bet(
    bet_data: dict,  # Use dict instead of BetCreate for flexibility
    current_user: UserResponse = Depends(get_current_user)
):
    """Place a new bet"""
    try:
        # Extract required fields
        stake_amount = bet_data.get("stake_amount", 0)
        currency = bet_data.get("currency", "HC")
        
        # Check if user has sufficient balance
        wallet = await wallet_service.get_wallet(current_user.user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        if currency == "HC":
            if wallet.happy_coin_balance < stake_amount:
                raise HTTPException(
                    status_code=400, 
                    detail="Insufficient Happy Coin balance"
                )
        else:
            if wallet.inr_balance < stake_amount:
                raise HTTPException(
                    status_code=400, 
                    detail="Insufficient INR balance"
                )
        
        # Create bet transaction
        transaction_data = TransactionCreate(
            user_id=current_user.user_id,
            transaction_type=TransactionType.BET_PLACED,
            amount=-stake_amount,  # Negative for bet placement
            currency=currency,
            description=f"Bet placed on {bet_data.get('selection_name', 'Unknown')} - {bet_data.get('bet_type', 'Unknown')}"
        )
        
        # Process transaction (deduct from wallet)
        transaction = await wallet_service.create_transaction(transaction_data)
        await wallet_service.update_balance(
            current_user.user_id, 
            -stake_amount, 
            currency, 
            TransactionType.BET_PLACED
        )
        
        # TODO: Create bet record in betting service
        # For now, return success response
        
        return {
            "message": "Bet placed successfully",
            "bet_id": f"bet_{transaction.transaction_id}",
            "stake_amount": stake_amount,
            "potential_winnings": stake_amount * bet_data.get('odds_value', 1.0),
            "odds": bet_data.get('odds_value', 1.0),
            "status": "active"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/history")
async def get_betting_history(
    skip: int = 0,
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user's betting history"""
    try:
        # Get betting transactions from wallet service
        transactions = await wallet_service.get_transactions(current_user.user_id, skip, limit)
        
        # Filter betting transactions
        betting_transactions = [
            t for t in transactions 
            if t.transaction_type in [TransactionType.BET_PLACED, TransactionType.BET_WON, TransactionType.BET_LOST]
        ]
        
        bet_history = []
        for transaction in betting_transactions:
            bet_history.append({
                "bet_id": f"bet_{transaction.transaction_id}",
                "amount": abs(transaction.amount),
                "currency": transaction.currency,
                "description": transaction.description,
                "status": transaction.status,
                "created_at": transaction.created_at
            })
        
        return {
            "bets": bet_history,
            "total_bets": len(bet_history),
            "total_pages": (len(bet_history) + limit - 1) // limit
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch betting history"
        )

@router.get("/active-bets")
async def get_active_bets(current_user: UserResponse = Depends(get_current_user)):
    """Get user's active bets"""
    try:
        # TODO: Implement active bets logic
        # For now, return empty list
        return {
            "active_bets": [],
            "count": 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch active bets"
        )

@router.get("/match/{match_id}/markets")
async def get_match_betting_markets(match_id: str):
    """Get betting markets for a specific match"""
    try:
        # TODO: Implement betting markets logic
        # For now, return mock data
        return {
            "match_id": match_id,
            "markets": [
                {
                    "market_id": f"market_{match_id}_winner",
                    "market_name": "Match Winner",
                    "market_type": "match_winner",
                    "selections": [
                        {"name": "Team A", "odds": 1.85},
                        {"name": "Team B", "odds": 1.95}
                    ]
                },
                {
                    "market_id": f"market_{match_id}_runs",
                    "market_name": "Total Runs Over/Under",
                    "market_type": "total_runs",
                    "selections": [
                        {"name": "Over 300.5", "odds": 1.90},
                        {"name": "Under 300.5", "odds": 1.90}
                    ]
                }
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch betting markets"
        )