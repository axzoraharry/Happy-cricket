#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

from app.services.cricket_service import cricket_service

async def test_entitysport_api():
    """Test EntitySport API with current credentials"""
    print("🏏 Testing EntitySport API Integration")
    print("=" * 50)
    
    # Test 1: Get seasons
    print("\n1. Testing Get Seasons...")
    try:
        seasons = await cricket_service.get_seasons()
        if seasons.get('status') == 'ok':
            print(f"✅ Seasons API working - Found {len(seasons.get('response', {}).get('items', []))} seasons")
        else:
            print(f"❌ Seasons API failed - Status: {seasons.get('status')}")
            print(f"   Message: {seasons.get('message', 'No message')}")
    except Exception as e:
        print(f"❌ Seasons API error: {str(e)}")
    
    # Test 2: Get current competitions
    print("\n2. Testing Get Competitions...")
    try:
        competitions = await cricket_service.get_competitions()
        if competitions.get('status') == 'ok':
            print(f"✅ Competitions API working - Found {len(competitions.get('response', {}).get('items', []))} competitions")
            
            # Show first few competitions
            items = competitions.get('response', {}).get('items', [])
            if items:
                print("   Recent competitions:")
                for comp in items[:3]:
                    print(f"   - {comp.get('title', 'Unknown')} ({comp.get('cid', 'No ID')})")
        else:
            print(f"❌ Competitions API failed - Status: {competitions.get('status')}")
            print(f"   Message: {competitions.get('message', 'No message')}")
    except Exception as e:
        print(f"❌ Competitions API error: {str(e)}")
    
    # Test 3: Get live matches
    print("\n3. Testing Get Live Matches...")
    try:
        live_matches = await cricket_service.get_live_matches()
        if live_matches.get('status') == 'ok':
            items = live_matches.get('response', {}).get('items', [])
            print(f"✅ Live Matches API working - Found {len(items)} live matches")
            
            if items:
                print("   Current live matches:")
                for match in items[:3]:
                    team_a = match.get('teama', {}).get('name', 'Team A')
                    team_b = match.get('teamb', {}).get('name', 'Team B')
                    print(f"   - {team_a} vs {team_b} (ID: {match.get('match_id', 'No ID')})")
            else:
                print("   No live matches currently")
        else:
            print(f"❌ Live Matches API failed - Status: {live_matches.get('status')}")
            print(f"   Message: {live_matches.get('message', 'No message')}")
    except Exception as e:
        print(f"❌ Live Matches API error: {str(e)}")
    
    # Test 4: Get upcoming matches
    print("\n4. Testing Get Upcoming Matches...")
    try:
        upcoming_matches = await cricket_service.get_upcoming_matches()
        if upcoming_matches.get('status') == 'ok':
            items = upcoming_matches.get('response', {}).get('items', [])
            print(f"✅ Upcoming Matches API working - Found {len(items)} upcoming matches")
            
            if items:
                print("   Next upcoming matches:")
                for match in items[:5]:
                    team_a = match.get('teama', {}).get('name', 'Team A')
                    team_b = match.get('teamb', {}).get('name', 'Team B')
                    date_start = match.get('date_start', 'No date')
                    print(f"   - {team_a} vs {team_b} - {date_start} (ID: {match.get('match_id', 'No ID')})")
        else:
            print(f"❌ Upcoming Matches API failed - Status: {upcoming_matches.get('status')}")
            print(f"   Message: {upcoming_matches.get('message', 'No message')}")
    except Exception as e:
        print(f"❌ Upcoming Matches API error: {str(e)}")
    
    # Test 5: Get betting matches (our custom method)
    print("\n5. Testing Get Betting Matches...")
    try:
        betting_matches = await cricket_service.get_betting_matches()
        print(f"✅ Betting Matches method working - Found {len(betting_matches)} matches suitable for betting")
        
        if betting_matches:
            print("   Matches available for betting:")
            for match in betting_matches[:3]:
                team_a = match.get('teama', {}).get('name', 'Team A')
                team_b = match.get('teamb', {}).get('name', 'Team B')
                category = match.get('betting_category', 'unknown')
                print(f"   - {team_a} vs {team_b} ({category})")
    except Exception as e:
        print(f"❌ Betting Matches error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("EntitySport API Test Complete")

if __name__ == "__main__":
    asyncio.run(test_entitysport_api())