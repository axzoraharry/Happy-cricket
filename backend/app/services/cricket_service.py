import httpx
import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
from ..core.config import settings

class CricketService:
    """Service to interact with EntitySport Cricket API"""
    
    def __init__(self):
        self.base_url = settings.ENTITYSPORT_BASE_URL
        self.access_key = settings.ENTITYSPORT_ACCESS_KEY
        self.secret_key = settings.ENTITYSPORT_SECRET_KEY
        self.token = settings.ENTITYSPORT_TOKEN
        
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """Make HTTP request to EntitySport API"""
        if params is None:
            params = {}
            
        # Add authentication token
        params['token'] = self.token
        
        url = f"{self.base_url}{endpoint}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"HTTP Error: {e}")
                raise Exception(f"API request failed: {str(e)}")
            except Exception as e:
                print(f"Unexpected error: {e}")
                raise Exception(f"Unexpected error: {str(e)}")
    
    async def update_token(self) -> Dict[str, Any]:
        """Update authentication token when expired"""
        endpoint = "auth"
        params = {
            'access_key': self.access_key,
            'secret_key': self.secret_key
        }
        
        result = await self._make_request(endpoint, params)
        if result.get('status') == 'ok':
            # Update token in environment/config
            self.token = result.get('response', {}).get('token', '')
            # TODO: Update .env file or database with new token
        
        return result
    
    # Seasons
    async def get_seasons(self, season_id: Optional[str] = None, args: Dict = None) -> Dict[str, Any]:
        """Get cricket seasons data"""
        if season_id:
            endpoint = f"seasons/{season_id}/competitions"
        else:
            endpoint = "seasons"
        
        return await self._make_request(endpoint, args)
    
    # Competitions
    async def get_competitions(self, competition_id: Optional[str] = None, args: Dict = None) -> Dict[str, Any]:
        """Get cricket competitions data"""
        if competition_id:
            endpoint = f"competitions/{competition_id}"
        else:
            endpoint = "competitions"
        
        return await self._make_request(endpoint, args)
    
    async def get_competition_squads(self, competition_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get competition squad details"""
        endpoint = f"competitions/{competition_id}/squads"
        return await self._make_request(endpoint, args)
    
    async def get_competition_teams(self, competition_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get competition teams"""
        endpoint = f"competitions/{competition_id}/teams"
        return await self._make_request(endpoint, args)
    
    async def get_competition_matches(self, competition_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get competition matches"""
        endpoint = f"competitions/{competition_id}/matches"
        return await self._make_request(endpoint, args)
    
    async def get_competition_standings(self, competition_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get competition standings/points table"""
        endpoint = f"competitions/{competition_id}/standings"
        return await self._make_request(endpoint, args)
    
    async def get_competition_stats(self, competition_id: str, stats_type: str = "", args: Dict = None) -> Dict[str, Any]:
        """Get competition statistics"""
        if stats_type:
            endpoint = f"competitions/{competition_id}/stats/{stats_type}"
        else:
            endpoint = f"competitions/{competition_id}/stats"
        
        return await self._make_request(endpoint, args)
    
    # Matches
    async def get_matches(self, match_id: Optional[str] = None, args: Dict = None) -> Dict[str, Any]:
        """Get matches data"""
        if match_id:
            endpoint = f"matches/{match_id}/info"
        else:
            endpoint = "matches"
        
        return await self._make_request(endpoint, args)
    
    async def get_live_matches(self, args: Dict = None) -> Dict[str, Any]:
        """Get live matches"""
        if args is None:
            args = {}
        args['status'] = '3'  # Live matches
        return await self.get_matches(args=args)
    
    async def get_upcoming_matches(self, args: Dict = None) -> Dict[str, Any]:
        """Get upcoming matches"""
        if args is None:
            args = {}
        args['status'] = '1'  # Upcoming matches
        return await self.get_matches(args=args)
    
    async def get_match_scorecard(self, match_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get match scorecard"""
        endpoint = f"matches/{match_id}/scorecard"
        return await self._make_request(endpoint, args)
    
    async def get_match_live_data(self, match_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get live match data"""
        endpoint = f"matches/{match_id}/live"
        return await self._make_request(endpoint, args)
    
    async def get_match_squads(self, match_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get match squads"""
        endpoint = f"matches/{match_id}/squads"
        return await self._make_request(endpoint, args)
    
    async def get_match_statistics(self, match_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get match statistics"""
        endpoint = f"matches/{match_id}/statistics"
        return await self._make_request(endpoint, args)
    
    async def get_match_fantasy(self, match_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get match fantasy points"""
        endpoint = f"matches/{match_id}/point"
        return await self._make_request(endpoint, args)
    
    async def get_match_commentary(self, match_id: str, inning_number: int, args: Dict = None) -> Dict[str, Any]:
        """Get match innings commentary"""
        endpoint = f"matches/{match_id}/innings/{inning_number}/commentary"
        return await self._make_request(endpoint, args)
    
    # Teams
    async def get_teams(self, team_id: Optional[str] = None, args: Dict = None) -> Dict[str, Any]:
        """Get teams data"""
        if team_id:
            endpoint = f"teams/{team_id}"
        else:
            endpoint = "teams"
        
        return await self._make_request(endpoint, args)
    
    async def get_team_matches(self, team_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get team matches"""
        endpoint = f"teams/{team_id}/matches"
        return await self._make_request(endpoint, args)
    
    # Players
    async def get_players(self, player_id: Optional[str] = None, args: Dict = None) -> Dict[str, Any]:
        """Get players data"""
        if player_id:
            endpoint = f"players/{player_id}"
        else:
            endpoint = "players"
        
        return await self._make_request(endpoint, args)
    
    async def get_player_stats(self, player_id: str, args: Dict = None) -> Dict[str, Any]:
        """Get player statistics"""
        endpoint = f"players/{player_id}/stats"
        return await self._make_request(endpoint, args)
    
    # ICC Rankings
    async def get_icc_rankings(self, args: Dict = None) -> Dict[str, Any]:
        """Get ICC rankings"""
        endpoint = "iccranks"
        return await self._make_request(endpoint, args)
    
    # Utility methods for betting platform
    async def get_betting_matches(self) -> List[Dict[str, Any]]:
        """Get matches suitable for betting (live + upcoming)"""
        try:
            # Get live matches
            live_matches = await self.get_live_matches()
            # Get upcoming matches
            upcoming_matches = await self.get_upcoming_matches()
            
            betting_matches = []
            
            # Process live matches
            if live_matches.get('status') == 'ok':
                for match in live_matches.get('response', {}).get('items', []):
                    if match.get('verified') and match.get('odds_available'):
                        betting_matches.append({
                            **match,
                            'betting_category': 'live'
                        })
            
            # Process upcoming matches
            if upcoming_matches.get('status') == 'ok':
                for match in upcoming_matches.get('response', {}).get('items', []):
                    if match.get('verified') and match.get('odds_available'):
                        betting_matches.append({
                            **match,
                            'betting_category': 'upcoming'
                        })
            
            return betting_matches
            
        except Exception as e:
            print(f"Error fetching betting matches: {e}")
            return []
    
    async def get_match_for_betting(self, match_id: str) -> Optional[Dict[str, Any]]:
        """Get specific match data for betting purposes"""
        try:
            match_info = await self.get_matches(match_id=match_id)
            if match_info.get('status') == 'ok':
                match_data = match_info.get('response')
                if match_data and match_data.get('verified') and match_data.get('odds_available'):
                    return match_data
            return None
        except Exception as e:
            print(f"Error fetching match for betting: {e}")
            return None

# Global cricket service instance
cricket_service = CricketService()