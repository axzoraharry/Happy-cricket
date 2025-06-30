#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

from app.services.cricket_service import cricket_service

async def refresh_entitysport_token():
    """Try to refresh EntitySport API token"""
    print("🔄 Attempting to refresh EntitySport API token...")
    print("=" * 50)
    
    print(f"Current credentials:")
    print(f"Access Key: {cricket_service.access_key}")
    print(f"Secret Key: {cricket_service.secret_key[:10]}...")
    print(f"Current Token: {cricket_service.token}")
    
    try:
        # Try to update token
        result = await cricket_service.update_token()
        
        print(f"\nToken update result:")
        print(f"Status: {result.get('status', 'unknown')}")
        print(f"Message: {result.get('message', 'No message')}")
        
        if result.get('status') == 'ok':
            new_token = result.get('response', {}).get('token', '')
            print(f"✅ New token received: {new_token[:20]}...")
            
            # Update the environment variable for this session
            os.environ['ENTITYSPORT_TOKEN'] = new_token
            cricket_service.token = new_token
            
            # Test with new token
            print("\n🧪 Testing with new token...")
            seasons = await cricket_service.get_seasons()
            if seasons.get('status') == 'ok':
                print("✅ New token is working!")
                
                # Save the new token to .env file
                print("💾 Saving new token to .env file...")
                
                with open('/app/backend/.env', 'r') as f:
                    content = f.read()
                
                # Replace the token line
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.startswith('ENTITYSPORT_TOKEN='):
                        lines[i] = f'ENTITYSPORT_TOKEN={new_token}'
                        break
                
                with open('/app/backend/.env', 'w') as f:
                    f.write('\n'.join(lines))
                
                print("✅ Token saved to .env file!")
                return True
            else:
                print("❌ New token is not working")
        else:
            print("❌ Failed to get new token")
            
    except Exception as e:
        print(f"❌ Error refreshing token: {str(e)}")
    
    return False

if __name__ == "__main__":
    asyncio.run(refresh_entitysport_token())