import httpx
import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
from ..core.config import settings
from ..core.database import get_database

class CricketService:
    """Service to interact with EntitySport Cricket API and fallback to mock data"""
    
    def __init__(self):
        self.base_url = settings.ENTITYSPORT_BASE_URL
        self.access_key = settings.ENTITYSPORT_ACCESS_KEY
        self.secret_key = settings.ENTITYSPORT_SECRET_KEY
        self.token = settings.ENTITYSPORT_TOKEN
        self.use_mock_data = False  # Will be set if API fails
        
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """Make HTTP request to EntitySport API with fallback to mock data"""
        if params is None:
            params = {}
            
        # Add authentication token
        params['token'] = self.token
        
        url = f"{self.base_url}{endpoint}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                
                # If unauthorized, try to refresh token
                if response.status_code == 401:
                    print("🔄 API token expired, attempting to refresh...")
                    token_refreshed = await self._refresh_token()
                    if token_refreshed:
                        params['token'] = self.token
                        response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == 'ok':
                        return data
                    else:
                        print(f"⚠️ API returned error: {data.get('message', 'Unknown error')}")
                        # Fall back to mock data
                        return await self._get_mock_data(endpoint, params)
                else:
                    print(f"⚠️ API request failed with status {response.status_code}")
                    # Fall back to mock data  
                    return await self._get_mock_data(endpoint, params)
                    
            except httpx.HTTPError as e:
                print(f"⚠️ HTTP Error: {e}")
                # Fall back to mock data
                return await self._get_mock_data(endpoint, params)
            except Exception as e:
                print(f"⚠️ Unexpected error: {e}")
                # Fall back to mock data
                return await self._get_mock_data(endpoint, params)
    
    async def _refresh_token(self) -> bool:
        """Try to refresh the EntitySport API token"""
        try:
            auth_url = f"{self.base_url}auth"
            params = {
                'access_key': self.access_key,
                'secret_key': self.secret_key
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(auth_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == 'ok':
                        self.token = data.get('response', {}).get('token', '')
                        print("✅ Token refreshed successfully")
                        return True
                        
            print("❌ Failed to refresh token")
            return False
            
        except Exception as e:
            print(f"❌ Error refreshing token: {e}")
            return False
    
    async def _get_mock_data(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """Get mock data from database when API is unavailable"""
        try:
            # Ensure database connection
            from ..core.database import connect_to_mongo
            try:
                db = await get_database()
                if db is None:
                    await connect_to_mongo()
                    db = await get_database()
            except:
                await connect_to_mongo()
                db = await get_database()
            
            if endpoint == "matches":
                collection = db["cricket_matches"]
                
                # Check for status filter
                status = params.get('status') if params else None
                query = {}
                if status:
                    query['status'] = status
                
                matches = []
                async for match in collection.find(query).limit(50):
                    # Remove MongoDB ObjectId
                    match.pop('_id', None)
                    matches.append(match)
                
                return {
                    'status': 'ok',
                    'response': {
                        'items': matches,
                        'total_items': len(matches)
                    }
                }
            
            elif endpoint == "competitions":
                collection = db["cricket_competitions"]
                competitions = []
                async for comp in collection.find().limit(20):
                    comp.pop('_id', None)
                    competitions.append(comp)
                
                return {
                    'status': 'ok',
                    'response': {
                        'items': competitions,
                        'total_items': len(competitions)
                    }
                }
            
            elif endpoint == "teams":
                collection = db["cricket_teams"]
                teams = []
                async for team in collection.find().limit(20):
                    team.pop('_id', None)
                    teams.append(team)
                
                return {
                    'status': 'ok',
                    'response': {
                        'items': teams,
                        'total_items': len(teams)
                    }
                }
            
            elif endpoint.startswith("matches/") and "/info" in endpoint:
                # Get specific match info
                match_id = endpoint.split('/')[1]
                collection = db["cricket_matches"]
                match = await collection.find_one({"match_id": match_id})
                
                if match:
                    match.pop('_id', None)
                    return {
                        'status': 'ok',
                        'response': match
                    }
            
            # Default empty response
            return {
                'status': 'ok',
                'response': {
                    'items': [],
                    'total_items': 0
                }
            }
            
        except Exception as e:
            print(f"❌ Error getting mock data: {e}")
            return {
                'status': 'error',
                'message': 'Failed to get mock data'
            }
    
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