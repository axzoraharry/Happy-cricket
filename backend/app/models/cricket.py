from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MatchStatus(str, Enum):
    UPCOMING = "1"
    RESULT = "2"
    LIVE = "3"

class MatchFormat(str, Enum):
    TEST = "test"
    ODI = "odi"
    T20 = "t20"
    T10 = "t10"

class Competition(BaseModel):
    cid: str
    title: str
    abbr: str
    type: str
    category: str
    match_format: str
    season: str
    status: str
    datestart: str
    dateend: str
    total_matches: Optional[int] = None
    total_rounds: Optional[int] = None
    total_teams: Optional[int] = None

class Team(BaseModel):
    tid: str
    title: str
    abbr: str
    type: str
    thumb_url: Optional[str] = None
    logo_url: Optional[str] = None
    country: Optional[str] = None

class Player(BaseModel):
    pid: str
    title: str
    short_name: str
    first_name: str
    last_name: str
    birthdate: Optional[str] = None
    birthplace: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    playing_role: Optional[str] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None

class Match(BaseModel):
    match_id: str
    title: str
    short_title: str
    subtitle: str
    match_number: Optional[int] = None
    format: str
    format_str: str
    status: str
    status_str: str
    status_note: Optional[str] = None
    verified: bool
    pre_squad: bool
    odds_available: bool
    payment_available: bool
    date_start: str
    date_end: Optional[str] = None
    timestamp_start: int
    timestamp_end: Optional[int] = None
    competition: Competition
    teama: Team
    teamb: Team
    venue: Optional[Dict[str, Any]] = None

class LiveScore(BaseModel):
    match_id: str
    title: str
    status: str
    status_str: str
    status_note: Optional[str] = None
    day: Optional[str] = None
    date_start: str
    teama: Dict[str, Any]
    teamb: Dict[str, Any]
    live: Optional[Dict[str, Any]] = None
    
class MatchStats(BaseModel):
    match_id: str
    batting: List[Dict[str, Any]]
    bowling: List[Dict[str, Any]]
    fielding: List[Dict[str, Any]]
    extras: Dict[str, Any]
    
class Commentary(BaseModel):
    match_id: str
    inning: str
    commentary: List[Dict[str, Any]]
    
class FantasyPoints(BaseModel):
    match_id: str
    teams: Dict[str, Any]
    players: List[Dict[str, Any]]

# API Response Models
class CricketAPIResponse(BaseModel):
    status: str
    response: Dict[str, Any]
    etag: Optional[str] = None

class MatchesResponse(BaseModel):
    status: str
    response: Dict[str, Any]
    etag: Optional[str] = None
    
class CompetitionsResponse(BaseModel):
    status: str
    response: Dict[str, Any]
    etag: Optional[str] = None