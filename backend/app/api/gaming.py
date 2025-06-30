from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from ..models.user import UserResponse
from ..models.gaming import GameType, Game, GameSession, SlotMachineResult, CrashGameResult, DiceResult
from ..api.auth import get_current_user
from ..services.gaming_service import gaming_service

router = APIRouter()

@router.get("/games", response_model=List[Game])
async def get_games(
    game_type: Optional[GameType] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all available games"""
    try:
        games = await gaming_service.get_games(game_type)
        return games
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch games"
        )

@router.get("/games/{game_id}")
async def get_game_details(
    game_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific game details"""
    try:
        game = await gaming_service.get_game_by_id(game_id)
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )
        return game
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch game details"
        )

@router.post("/sessions/start")
async def start_game_session(
    game_id: str,
    bet_amount: float,
    current_user: UserResponse = Depends(get_current_user)
):
    """Start a new gaming session"""
    try:
        if bet_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bet amount must be greater than 0"
            )
        
        session = await gaming_service.start_game_session(
            current_user.user_id, 
            game_id, 
            bet_amount
        )
        
        return {
            "success": True,
            "session": session,
            "message": "Game session started successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start game session: {str(e)}"
        )

@router.post("/slots/{session_id}/spin")
async def spin_slot_machine(
    session_id: str,
    bet_amount: float,
    current_user: UserResponse = Depends(get_current_user)
):
    """Spin slot machine"""
    try:
        if bet_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bet amount must be greater than 0"
            )
        
        result = await gaming_service.play_slot_machine(session_id, bet_amount)
        
        return {
            "success": True,
            "result": result,
            "message": "Slot spin completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Slot machine error: {str(e)}"
        )

@router.post("/crash/{session_id}/play")
async def play_crash_game(
    session_id: str,
    bet_amount: float,
    target_multiplier: Optional[float] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Play crash game"""
    try:
        if bet_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bet amount must be greater than 0"
            )
        
        if target_multiplier and target_multiplier < 1.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target multiplier must be at least 1.0"
            )
        
        result = await gaming_service.play_crash_game(session_id, bet_amount, target_multiplier)
        
        return {
            "success": True,
            "result": result,
            "message": "Crash game completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Crash game error: {str(e)}"
        )

@router.post("/dice/{session_id}/roll")
async def roll_dice(
    session_id: str,
    bet_amount: float,
    target_number: int,
    is_over: bool,
    current_user: UserResponse = Depends(get_current_user)
):
    """Roll dice game"""
    try:
        if bet_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bet amount must be greater than 0"
            )
        
        if target_number < 2 or target_number > 11:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target number must be between 2 and 11"
            )
        
        result = await gaming_service.play_dice_game(session_id, bet_amount, target_number, is_over)
        
        return {
            "success": True,
            "result": result,
            "message": "Dice game completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dice game error: {str(e)}"
        )

@router.get("/sessions/{session_id}")
async def get_game_session(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get game session details"""
    try:
        session = await gaming_service.get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        # Verify session belongs to user
        if session.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch session"
        )

@router.get("/stats")
async def get_gaming_stats(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user's gaming statistics"""
    try:
        # TODO: Implement comprehensive gaming stats
        return {
            "total_games_played": 0,
            "total_amount_bet": 0.0,
            "total_amount_won": 0.0,
            "net_result": 0.0,
            "win_rate": 0.0,
            "biggest_win": 0.0,
            "favorite_game": None,
            "total_sessions": 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch gaming stats"
        )

@router.get("/leaderboard")
async def get_gaming_leaderboard(
    game_type: Optional[GameType] = None,
    period: str = "daily"  # daily, weekly, monthly, all_time
):
    """Get gaming leaderboard"""
    try:
        # TODO: Implement leaderboard logic
        return {
            "leaderboard": [],
            "period": period,
            "game_type": game_type,
            "last_updated": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch leaderboard"
        )

@router.get("/jackpots")
async def get_jackpot_info():
    """Get current jackpot information"""
    try:
        # TODO: Implement jackpot system
        return {
            "jackpots": [
                {
                    "name": "Cricket Mega Jackpot",
                    "current_amount": 50000.0,
                    "currency": "HC",
                    "games": ["slot_machine", "crash_game"],
                    "last_won": "2024-01-01T00:00:00Z"
                }
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch jackpot info"
        )

# Demo/Test endpoints
@router.post("/demo/create-sample-games")
async def create_sample_games(current_user: UserResponse = Depends(get_current_user)):
    """Create sample games for testing (admin only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        sample_games = [
            {
                "name": "Cricket Slots",
                "description": "5-reel cricket-themed slot machine with exciting bonus features",
                "game_type": GameType.SLOT_MACHINE,
                "min_bet": 0.1,
                "max_bet": 50.0,
                "rtp_percentage": 96.5,
                "volatility": "medium",
                "theme": "cricket"
            },
            {
                "name": "Crash Cricket",
                "description": "Watch the multiplier rise and cash out before it crashes!",
                "game_type": GameType.CRASH_GAME,
                "min_bet": 0.1,
                "max_bet": 100.0,
                "rtp_percentage": 97.0,
                "volatility": "high",
                "theme": "cricket"
            },
            {
                "name": "Lucky Dice",
                "description": "Predict if the dice roll will be over or under your target number",
                "game_type": GameType.DICE,
                "min_bet": 0.1,
                "max_bet": 25.0,
                "rtp_percentage": 95.0,
                "volatility": "low",
                "theme": "classic"
            }
        ]
        
        created_games = []
        for game_data in sample_games:
            game = await gaming_service.create_game(game_data)
            created_games.append(game)
        
        return {
            "success": True,
            "message": f"Created {len(created_games)} sample games",
            "games": created_games
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sample games: {str(e)}"
        )