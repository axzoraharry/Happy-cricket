import random
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from ..core.database import get_database
from ..models.gaming import (
    Game, GameSession, GameResult, SlotMachineResult, SlotSymbol,
    GameType, GameSessionStatus, PokerResult, BlackjackResult,
    RouletteResult, CrashGameResult, DiceResult
)
from ..models.wallet import TransactionCreate, TransactionType
from ..services.wallet_service import wallet_service
from fastapi import HTTPException, status
import json

class GamingService:
    """Service for managing casino games and gaming sessions"""
    
    def __init__(self):
        self.games_collection = "games"
        self.sessions_collection = "game_sessions"
        self.results_collection = "game_results"
        
        # Slot machine configuration
        self.slot_symbols = {
            SlotSymbol.CRICKET_BAT: {"frequency": 8, "value": 2},
            SlotSymbol.CRICKET_BALL: {"frequency": 8, "value": 2},
            SlotSymbol.STUMPS: {"frequency": 6, "value": 3},
            SlotSymbol.TROPHY: {"frequency": 4, "value": 5},
            SlotSymbol.HELMET: {"frequency": 6, "value": 3},
            SlotSymbol.GLOVES: {"frequency": 8, "value": 2},
            SlotSymbol.HAPPY_COIN: {"frequency": 2, "value": 10},
            SlotSymbol.SEVEN: {"frequency": 1, "value": 25},
            SlotSymbol.CHERRY: {"frequency": 10, "value": 1.5},
            SlotSymbol.BELL: {"frequency": 5, "value": 4}
        }
    
    async def create_game(self, game_data: Dict[str, Any]) -> Game:
        """Create a new game"""
        db = await get_database()
        collection = db[self.games_collection]
        
        game_id = str(uuid.uuid4())
        game_doc = {
            "game_id": game_id,
            "name": game_data["name"],
            "description": game_data["description"],
            "game_type": game_data["game_type"],
            "min_bet": game_data.get("min_bet", 0.1),
            "max_bet": game_data.get("max_bet", 100.0),
            "rtp_percentage": game_data.get("rtp_percentage", 96.5),
            "volatility": game_data.get("volatility", "medium"),
            "theme": game_data.get("theme", "cricket"),
            "thumbnail_url": game_data.get("thumbnail_url"),
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "popularity_score": 0.0,
            "total_plays": 0,
            "total_winnings": 0.0
        }
        
        await collection.insert_one(game_doc)
        return Game(**game_doc)
    
    async def get_games(self, game_type: Optional[GameType] = None) -> List[Game]:
        """Get all available games"""
        db = await get_database()
        collection = db[self.games_collection]
        
        query = {"status": "active"}
        if game_type:
            query["game_type"] = game_type
        
        cursor = collection.find(query).sort("popularity_score", -1)
        games = []
        
        async for game_doc in cursor:
            games.append(Game(**game_doc))
        
        return games
    
    async def start_game_session(self, user_id: str, game_id: str, bet_amount: float) -> GameSession:
        """Start a new gaming session"""
        db = await get_database()
        
        # Verify game exists
        game = await self.get_game_by_id(game_id)
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )
        
        # Validate bet amount
        if bet_amount < game.min_bet or bet_amount > game.max_bet:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bet amount must be between {game.min_bet} and {game.max_bet} HC"
            )
        
        # Check user balance
        wallet = await wallet_service.get_wallet(user_id)
        if not wallet or wallet.happy_coin_balance < bet_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )
        
        # Create session
        session_id = str(uuid.uuid4())
        session_doc = {
            "session_id": session_id,
            "user_id": user_id,
            "game_id": game_id,
            "bet_amount": bet_amount,
            "currency": "HC",
            "status": GameSessionStatus.ACTIVE,
            "started_at": datetime.utcnow(),
            "ended_at": None,
            "total_spins": 0,
            "total_winnings": 0.0,
            "total_bet": bet_amount,
            "game_data": {}
        }
        
        collection = db[self.sessions_collection]
        await collection.insert_one(session_doc)
        
        return GameSession(**session_doc)
    
    async def play_slot_machine(self, session_id: str, bet_amount: float) -> SlotMachineResult:
        """Play slot machine and return result"""
        try:
            session = await self.get_session(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            # Generate slot result
            reels = self._generate_slot_reels()
            result = self._calculate_slot_winnings(reels, bet_amount)
            
            # Update session
            await self._update_session_stats(session_id, bet_amount, result.total_win)
            
            # Process transaction
            if result.total_win > 0:
                await self._process_game_win(session.user_id, result.total_win, "Slot Machine Win")
            
            await self._process_game_bet(session.user_id, bet_amount, "Slot Machine Bet")
            
            # Store result
            await self._store_game_result(session, bet_amount, result.total_win, result.dict())
            
            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Slot machine error: {str(e)}"
            )
    
    async def play_crash_game(self, session_id: str, bet_amount: float, target_multiplier: float = None) -> CrashGameResult:
        """Play crash game"""
        try:
            session = await self.get_session(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            # Generate crash multiplier (using exponential distribution for realistic crashes)
            crash_multiplier = round(random.expovariate(0.5) + 1, 2)
            
            # Determine if player cashed out before crash
            if target_multiplier and target_multiplier <= crash_multiplier:
                # Player won
                win_amount = bet_amount * target_multiplier
                crashed = False
                cash_out_multiplier = target_multiplier
            else:
                # Player lost (crashed before cash out)
                win_amount = 0.0
                crashed = True
                cash_out_multiplier = None
            
            result = CrashGameResult(
                crash_multiplier=crash_multiplier,
                cash_out_multiplier=cash_out_multiplier,
                bet_amount=bet_amount,
                win_amount=win_amount,
                crashed=crashed
            )
            
            # Update session and process transactions
            await self._update_session_stats(session_id, bet_amount, win_amount)
            
            if win_amount > 0:
                await self._process_game_win(session.user_id, win_amount, "Crash Game Win")
            
            await self._process_game_bet(session.user_id, bet_amount, "Crash Game Bet")
            await self._store_game_result(session, bet_amount, win_amount, result.dict())
            
            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Crash game error: {str(e)}"
            )
    
    async def play_dice_game(self, session_id: str, bet_amount: float, target_number: int, is_over: bool) -> DiceResult:
        """Play dice game"""
        try:
            session = await self.get_session(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            # Roll dice (1-6)
            dice_values = [random.randint(1, 6), random.randint(1, 6)]
            total = sum(dice_values)
            
            # Determine win
            won = (total > target_number) if is_over else (total < target_number)
            
            # Calculate win amount based on probability
            if won:
                if is_over:
                    probability = (21 - target_number) / 36  # Probability of rolling over target
                else:
                    probability = (target_number - 1) / 36  # Probability of rolling under target
                
                multiplier = 0.95 / probability  # 5% house edge
                win_amount = bet_amount * multiplier
            else:
                win_amount = 0.0
            
            result = DiceResult(
                dice_values=dice_values,
                target_number=target_number,
                is_over=is_over,
                win_amount=win_amount
            )
            
            # Update session and process transactions
            await self._update_session_stats(session_id, bet_amount, win_amount)
            
            if win_amount > 0:
                await self._process_game_win(session.user_id, win_amount, "Dice Game Win")
            
            await self._process_game_bet(session.user_id, bet_amount, "Dice Game Bet")
            await self._store_game_result(session, bet_amount, win_amount, result.dict())
            
            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Dice game error: {str(e)}"
            )
    
    def _generate_slot_reels(self) -> List[List[SlotSymbol]]:
        """Generate random slot machine reels"""
        reels = []
        
        for _ in range(5):  # 5 reels
            reel = []
            for _ in range(3):  # 3 symbols per reel
                # Weighted random selection based on symbol frequency
                symbols = []
                for symbol, config in self.slot_symbols.items():
                    symbols.extend([symbol] * config["frequency"])
                
                selected_symbol = random.choice(symbols)
                reel.append(selected_symbol)
            
            reels.append(reel)
        
        return reels
    
    def _calculate_slot_winnings(self, reels: List[List[SlotSymbol]], bet_amount: float) -> SlotMachineResult:
        """Calculate slot machine winnings based on reels"""
        total_win = 0.0
        win_lines = []
        multiplier = 0.0
        
        # Check horizontal lines (simplified - middle row only)
        middle_line = [reel[1] for reel in reels]  # Middle symbol from each reel
        
        # Count consecutive matching symbols from left
        if len(set(middle_line)) == 1:  # All 5 symbols match
            symbol = middle_line[0]
            symbol_value = self.slot_symbols[symbol]["value"]
            multiplier = symbol_value
            total_win = bet_amount * multiplier
            win_lines.append({
                "line": "middle",
                "symbols": middle_line,
                "count": 5,
                "multiplier": multiplier
            })
        elif len(set(middle_line[:3])) == 1:  # First 3 symbols match
            symbol = middle_line[0]
            symbol_value = self.slot_symbols[symbol]["value"]
            multiplier = symbol_value * 0.5  # Lower payout for 3 symbols
            total_win = bet_amount * multiplier
            win_lines.append({
                "line": "middle",
                "symbols": middle_line[:3],
                "count": 3,
                "multiplier": multiplier
            })
        
        # Bonus features (simplified)
        bonus_triggered = SlotSymbol.HAPPY_COIN in middle_line
        free_spins_won = middle_line.count(SlotSymbol.HAPPY_COIN) * 5 if bonus_triggered else 0
        
        return SlotMachineResult(
            reels=reels,
            win_lines=win_lines,
            total_win=total_win,
            multiplier=multiplier,
            bonus_triggered=bonus_triggered,
            free_spins_won=free_spins_won
        )
    
    async def get_session(self, session_id: str) -> Optional[GameSession]:
        """Get game session by ID"""
        db = await get_database()
        collection = db[self.sessions_collection]
        
        session_doc = await collection.find_one({"session_id": session_id})
        if session_doc:
            return GameSession(**session_doc)
        return None
    
    async def get_game_by_id(self, game_id: str) -> Optional[Game]:
        """Get game by ID"""
        db = await get_database()
        collection = db[self.games_collection]
        
        game_doc = await collection.find_one({"game_id": game_id})
        if game_doc:
            return Game(**game_doc)
        return None
    
    async def _update_session_stats(self, session_id: str, bet_amount: float, win_amount: float):
        """Update session statistics"""
        db = await get_database()
        collection = db[self.sessions_collection]
        
        await collection.update_one(
            {"session_id": session_id},
            {
                "$inc": {
                    "total_spins": 1,
                    "total_bet": bet_amount,
                    "total_winnings": win_amount
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    async def _process_game_bet(self, user_id: str, bet_amount: float, description: str):
        """Process game bet transaction"""
        transaction_data = TransactionCreate(
            user_id=user_id,
            transaction_type=TransactionType.BET_PLACED,
            amount=-bet_amount,
            currency="HC",
            description=description
        )
        
        await wallet_service.create_transaction(transaction_data)
        await wallet_service.update_balance(user_id, -bet_amount, "HC", TransactionType.BET_PLACED)
    
    async def _process_game_win(self, user_id: str, win_amount: float, description: str):
        """Process game win transaction"""
        transaction_data = TransactionCreate(
            user_id=user_id,
            transaction_type=TransactionType.BET_WON,
            amount=win_amount,
            currency="HC",
            description=description
        )
        
        await wallet_service.create_transaction(transaction_data)
        await wallet_service.update_balance(user_id, win_amount, "HC", TransactionType.BET_WON)
    
    async def _store_game_result(self, session: GameSession, bet_amount: float, win_amount: float, result_data: Dict):
        """Store game result"""
        db = await get_database()
        collection = db[self.results_collection]
        
        result_doc = {
            "result_id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "user_id": session.user_id,
            "game_id": session.game_id,
            "bet_amount": bet_amount,
            "win_amount": win_amount,
            "multiplier": win_amount / bet_amount if bet_amount > 0 else 0,
            "result_data": result_data,
            "timestamp": datetime.utcnow(),
            "is_winning": win_amount > 0
        }
        
        await collection.insert_one(result_doc)

# Global gaming service instance
gaming_service = GamingService()