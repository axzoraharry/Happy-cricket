#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from app.core.config import settings

async def check_config():
    """Check configuration loading"""
    print("🔍 Checking Configuration Loading")
    print("=" * 50)
    
    print("Environment Variables from .env:")
    print(f"ENTITYSPORT_ACCESS_KEY: {os.getenv('ENTITYSPORT_ACCESS_KEY', 'NOT SET')}")
    print(f"ENTITYSPORT_SECRET_KEY: {os.getenv('ENTITYSPORT_SECRET_KEY', 'NOT SET')[:10]}...")
    print(f"ENTITYSPORT_TOKEN: {os.getenv('ENTITYSPORT_TOKEN', 'NOT SET')[:10]}...")
    
    print("\nSettings object values:")
    print(f"settings.ENTITYSPORT_ACCESS_KEY: {settings.ENTITYSPORT_ACCESS_KEY}")
    print(f"settings.ENTITYSPORT_SECRET_KEY: {settings.ENTITYSPORT_SECRET_KEY[:10]}...")
    print(f"settings.ENTITYSPORT_TOKEN: {settings.ENTITYSPORT_TOKEN[:10]}...")
    
    # Test direct API call with proper credentials
    import httpx
    
    print("\n🧪 Testing direct API call with credentials from .env...")
    
    access_key = os.getenv('ENTITYSPORT_ACCESS_KEY')
    secret_key = os.getenv('ENTITYSPORT_SECRET_KEY')
    
    if access_key and secret_key:
        try:
            # Try to get new token
            auth_url = "https://rest.entitysport.com/v2/auth"
            params = {
                'access_key': access_key,
                'secret_key': secret_key
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(auth_url, params=params)
                print(f"Auth API Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"Auth API Response: {data}")
                    
                    if data.get('status') == 'ok':
                        new_token = data.get('response', {}).get('token', '')
                        print(f"✅ New token: {new_token[:20]}...")
                        
                        # Test with new token
                        matches_url = "https://rest.entitysport.com/v2/matches"
                        match_params = {'token': new_token, 'status': '1'}  # upcoming matches
                        
                        match_response = await client.get(matches_url, params=match_params)
                        print(f"Matches API Response Status: {match_response.status_code}")
                        
                        if match_response.status_code == 200:
                            match_data = match_response.json()
                            print(f"✅ Matches API working! Found {len(match_data.get('response', {}).get('items', []))} matches")
                        else:
                            print(f"❌ Matches API failed: {match_response.text}")
                    else:
                        print(f"❌ Auth failed: {data.get('message', 'Unknown error')}")
                else:
                    print(f"❌ Auth API failed: {response.text}")
                    
        except Exception as e:
            print(f"❌ Error testing direct API: {str(e)}")
    else:
        print("❌ Access key or secret key not found in environment")

if __name__ == "__main__":
    asyncio.run(check_config())