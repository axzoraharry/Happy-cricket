from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class BetType(str, Enum):
    MATCH_WINNER = "match_winner"
    TOTAL_RUNS = "total_runs"
    TOTAL_WICKETS = "total_wickets"
    HIGHEST_SCORER = "highest_scorer"
    MOST_WICKETS = "most_wickets"
    FIRST_INNINGS_RUNS = "first_innings_runs"
    SECOND_INNINGS_RUNS = "second_innings_runs"
    TOSS_WINNER = "toss_winner"
    PLAYER_RUNS = "player_runs"
    PLAYER_WICKETS = "player_wickets"

class BetStatus(str, Enum):
    ACTIVE = "active"
    WON = "won"
    LOST = "lost"
    CANCELLED = "cancelled"
    PENDING_SETTLEMENT = "pending_settlement"

class MarketStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    SETTLED = "settled"
    CANCELLED = "cancelled"

class BettingMarket(BaseModel):
    market_id: str
    match_id: str
    market_name: str
    market_type: BetType
    description: str
    status: MarketStatus
    min_bet: float
    max_bet: float
    created_at: datetime
    updated_at: datetime
    settlement_time: Optional[datetime] = None

class BettingOdds(BaseModel):
    odds_id: str
    market_id: str
    selection_name: str
    odds_value: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

class BetCreate(BaseModel):
    match_id: str
    market_id: str
    selection_name: str
    bet_type: BetType
    stake_amount: float
    odds_value: float
    currency: str = "HC"  # Happy Coin
    
    @validator('stake_amount')
    def validate_stake(cls, v):
        if v <= 0:
            raise ValueError('Stake amount must be greater than 0')
        if v < 0.1:  # Minimum bet 0.1 HC
            raise ValueError('Minimum bet amount is 0.1 Happy Coin')
        return v

class Bet(BaseModel):
    bet_id: str
    user_id: str
    match_id: str
    market_id: str
    selection_name: str
    bet_type: BetType
    stake_amount: float
    odds_value: float
    potential_winnings: float
    actual_winnings: float
    currency: str
    status: BetStatus
    placed_at: datetime
    settled_at: Optional[datetime] = None
    settlement_reason: Optional[str] = None

class BetSlip(BaseModel):
    bets: List[BetCreate]
    total_stake: float
    potential_total_winnings: float
    
class BetResponse(BaseModel):
    bet_id: str
    match_id: str
    match_title: str
    selection_name: str
    bet_type: BetType
    stake_amount: float
    odds_value: float
    potential_winnings: float
    status: BetStatus
    placed_at: datetime
    
class BettingHistory(BaseModel):
    bets: List[BetResponse]
    total_bets: int
    total_stake: float
    total_winnings: float
    win_rate: float

class LiveOddsUpdate(BaseModel):
    market_id: str
    match_id: str
    odds: List[BettingOdds]
    timestamp: datetime

class MatchBettingInfo(BaseModel):
    match_id: str
    match_title: str
    match_status: str
    markets: List[BettingMarket]
    featured_odds: List[BettingOdds]
    
class MarketCreate(BaseModel):
    match_id: str
    market_name: str
    market_type: BetType
    description: str
    min_bet: float = 0.1
    max_bet: float = 100.0
    
class OddsCreate(BaseModel):
    market_id: str
    selection_name: str
    odds_value: float
    
    @validator('odds_value')
    def validate_odds(cls, v):
        if v <= 1.0:
            raise ValueError('Odds must be greater than 1.0')
        return v