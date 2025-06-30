from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class GameType(str, Enum):
    SLOT_MACHINE = "slot_machine"
    POKER = "poker"
    BLACKJACK = "blackjack"
    ROULETTE = "roulette"
    LIVE_CASINO = "live_casino"
    CRASH_GAME = "crash_game"
    DICE = "dice"
    WHEEL_OF_FORTUNE = "wheel_of_fortune"

class GameStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class GameSessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class SlotSymbol(str, Enum):
    CRICKET_BAT = "cricket_bat"
    CRICKET_BALL = "cricket_ball"
    STUMPS = "stumps"
    TROPHY = "trophy"
    HELMET = "helmet"
    GLOVES = "gloves"
    HAPPY_COIN = "happy_coin"
    SEVEN = "seven"
    CHERRY = "cherry"
    BELL = "bell"

class Game(BaseModel):
    game_id: str
    name: str
    description: str
    game_type: GameType
    min_bet: float
    max_bet: float
    rtp_percentage: float  # Return to Player percentage
    volatility: str  # low, medium, high
    theme: str
    thumbnail_url: Optional[str] = None
    status: GameStatus
    created_at: datetime
    updated_at: datetime
    popularity_score: float = 0.0
    total_plays: int = 0
    total_winnings: float = 0.0

class GameSession(BaseModel):
    session_id: str
    user_id: str
    game_id: str
    bet_amount: float
    currency: str = "HC"
    status: GameSessionStatus
    started_at: datetime
    ended_at: Optional[datetime] = None
    total_spins: int = 0
    total_winnings: float = 0.0
    total_bet: float = 0.0
    game_data: Dict[str, Any] = {}  # Game-specific data

class GameResult(BaseModel):
    result_id: str
    session_id: str
    user_id: str
    game_id: str
    bet_amount: float
    win_amount: float
    multiplier: float
    result_data: Dict[str, Any]  # Game-specific result data
    timestamp: datetime
    is_winning: bool

class SlotMachineResult(BaseModel):
    reels: List[List[SlotSymbol]]  # 5 reels, 3 symbols each
    win_lines: List[Dict[str, Any]]
    total_win: float
    multiplier: float
    bonus_triggered: bool = False
    free_spins_won: int = 0

class PokerHand(BaseModel):
    cards: List[str]  # ["AH", "KS", "QD", "JC", "10H"]
    hand_rank: str  # "royal_flush", "straight_flush", etc.
    hand_value: int

class PokerResult(BaseModel):
    player_hand: PokerHand
    dealer_hand: PokerHand
    community_cards: List[str]
    result: str  # "win", "lose", "tie"
    win_amount: float

class BlackjackResult(BaseModel):
    player_cards: List[str]
    dealer_cards: List[str]
    player_score: int
    dealer_score: int
    result: str  # "win", "lose", "tie", "blackjack"
    win_amount: float

class RouletteResult(BaseModel):
    winning_number: int
    winning_color: str  # "red", "black", "green"
    player_bets: List[Dict[str, Any]]
    win_amount: float

class CrashGameResult(BaseModel):
    crash_multiplier: float
    cash_out_multiplier: Optional[float] = None
    bet_amount: float
    win_amount: float
    crashed: bool

class DiceResult(BaseModel):
    dice_values: List[int]
    target_number: int
    is_over: bool  # True for over, False for under
    win_amount: float

class GameCreate(BaseModel):
    name: str
    description: str
    game_type: GameType
    min_bet: float = 0.1
    max_bet: float = 100.0
    rtp_percentage: float = 96.5
    volatility: str = "medium"
    theme: str = "cricket"
    
    @validator('rtp_percentage')
    def validate_rtp(cls, v):
        if v < 80 or v > 99:
            raise ValueError('RTP must be between 80% and 99%')
        return v

class GameSessionCreate(BaseModel):
    game_id: str
    bet_amount: float
    currency: str = "HC"
    
    @validator('bet_amount')
    def validate_bet_amount(cls, v):
        if v <= 0:
            raise ValueError('Bet amount must be greater than 0')
        return v

class SpinRequest(BaseModel):
    session_id: str
    bet_amount: float
    lines: int = 20  # Number of pay lines for slots
    
class CashOutRequest(BaseModel):
    session_id: str

class GameStats(BaseModel):
    total_games_played: int
    total_amount_bet: float
    total_amount_won: float
    net_result: float
    win_rate: float
    biggest_win: float
    favorite_game: Optional[str] = None
    total_sessions: int

class LiveCasinoTable(BaseModel):
    table_id: str
    game_type: GameType
    dealer_name: str
    min_bet: float
    max_bet: float
    current_players: int
    max_players: int
    status: str
    language: str = "en"

class JackpotPool(BaseModel):
    jackpot_id: str
    name: str
    current_amount: float
    contribution_rate: float  # Percentage of each bet that goes to jackpot
    last_won_at: Optional[datetime] = None
    last_winner: Optional[str] = None
    games: List[str]  # Game IDs that contribute to this jackpot

class TournamentEntry(BaseModel):
    tournament_id: str
    user_id: str
    entry_fee: float
    score: float = 0.0
    rank: int = 0
    prizes_won: float = 0.0
    games_played: int = 0

class Tournament(BaseModel):
    tournament_id: str
    name: str
    description: str
    game_type: GameType
    entry_fee: float
    max_participants: int
    current_participants: int
    prize_pool: float
    start_time: datetime
    end_time: datetime
    status: str
    prizes: List[Dict[str, Any]]  # Prize distribution

class VIPLevel(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    DIAMOND = "diamond"

class VIPReward(BaseModel):
    reward_id: str
    user_id: str
    vip_level: VIPLevel
    reward_type: str  # "bonus", "free_spins", "cashback"
    amount: float
    description: str
    claimed_at: Optional[datetime] = None
    expires_at: datetime