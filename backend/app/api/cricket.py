from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from ..services.cricket_service import cricket_service
from ..models.cricket import MatchesResponse, CompetitionsResponse

router = APIRouter()

@router.get("/matches")
async def get_matches(
    status: Optional[str] = Query(None, description="Match status: 1=upcoming, 2=result, 3=live"),
    per_page: int = Query(20, description="Number of matches per page"),
    paged: int = Query(1, description="Page number")
):
    """Get cricket matches"""
    try:
        args = {
            "per_page": per_page,
            "paged": paged
        }
        
        if status:
            args["status"] = status
        
        result = await cricket_service.get_matches(args=args)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch matches: {str(e)}"
        )

@router.get("/matches/live")
async def get_live_matches(
    per_page: int = Query(10, description="Number of matches per page"),
    paged: int = Query(1, description="Page number")
):
    """Get live cricket matches"""
    try:
        args = {
            "per_page": per_page,
            "paged": paged
        }
        
        result = await cricket_service.get_live_matches(args)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch live matches: {str(e)}"
        )

@router.get("/matches/upcoming")
async def get_upcoming_matches(
    per_page: int = Query(10, description="Number of matches per page"),
    paged: int = Query(1, description="Page number")
):
    """Get upcoming cricket matches"""
    try:
        args = {
            "per_page": per_page,
            "paged": paged
        }
        
        result = await cricket_service.get_upcoming_matches(args)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch upcoming matches: {str(e)}"
        )

@router.get("/matches/{match_id}")
async def get_match_details(match_id: str):
    """Get specific match details"""
    try:
        result = await cricket_service.get_matches(match_id=match_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch match details: {str(e)}"
        )

@router.get("/matches/{match_id}/live")
async def get_match_live_data(match_id: str):
    """Get live match data"""
    try:
        result = await cricket_service.get_match_live_data(match_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch live match data: {str(e)}"
        )

@router.get("/matches/{match_id}/scorecard")
async def get_match_scorecard(match_id: str):
    """Get match scorecard"""
    try:
        result = await cricket_service.get_match_scorecard(match_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch match scorecard: {str(e)}"
        )

@router.get("/matches/{match_id}/commentary/{inning}")
async def get_match_commentary(match_id: str, inning: int):
    """Get match commentary for specific inning"""
    try:
        result = await cricket_service.get_match_commentary(match_id, inning)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch match commentary: {str(e)}"
        )

@router.get("/matches/{match_id}/fantasy")
async def get_match_fantasy_points(match_id: str):
    """Get match fantasy points"""
    try:
        result = await cricket_service.get_match_fantasy(match_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch fantasy points: {str(e)}"
        )

@router.get("/competitions")
async def get_competitions(
    per_page: int = Query(20, description="Number of competitions per page"),
    paged: int = Query(1, description="Page number")
):
    """Get cricket competitions"""
    try:
        args = {
            "per_page": per_page,
            "paged": paged
        }
        
        result = await cricket_service.get_competitions(args=args)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch competitions: {str(e)}"
        )

@router.get("/competitions/{competition_id}")
async def get_competition_details(competition_id: str):
    """Get specific competition details"""
    try:
        result = await cricket_service.get_competitions(competition_id=competition_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch competition details: {str(e)}"
        )

@router.get("/competitions/{competition_id}/matches")
async def get_competition_matches(competition_id: str):
    """Get matches for specific competition"""
    try:
        result = await cricket_service.get_competition_matches(competition_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch competition matches: {str(e)}"
        )

@router.get("/teams/{team_id}")
async def get_team_details(team_id: str):
    """Get team details"""
    try:
        result = await cricket_service.get_teams(team_id=team_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch team details: {str(e)}"
        )

@router.get("/players/{player_id}")
async def get_player_details(player_id: str):
    """Get player details"""
    try:
        result = await cricket_service.get_players(player_id=player_id)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch player details: {str(e)}"
        )

@router.get("/icc-rankings")
async def get_icc_rankings():
    """Get ICC rankings"""
    try:
        result = await cricket_service.get_icc_rankings()
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ICC rankings: {str(e)}"
        )

@router.get("/betting/matches")
async def get_betting_matches():
    """Get matches available for betting"""
    try:
        matches = await cricket_service.get_betting_matches()
        return {
            "status": "ok",
            "matches": matches,
            "count": len(matches)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch betting matches: {str(e)}"
        )