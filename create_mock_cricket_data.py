#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

from datetime import datetime, timedelta
import json
from app.core.database import connect_to_mongo, get_database

async def create_mock_cricket_data():
    """Create comprehensive mock cricket data for the platform"""
    print("🏏 Creating Mock Cricket Data")
    print("=" * 50)
    
    await connect_to_mongo()
    db = await get_database()
    
    # Check actual database name being used
    print(f"Using database: {db.name}")
    
    # Collections
    matches_collection = db["cricket_matches"]
    teams_collection = db["cricket_teams"]
    competitions_collection = db["cricket_competitions"]
    
    print("📊 Creating mock teams...")
    
    # Mock teams
    teams = [
        {
            "team_id": "team_1",
            "name": "India",
            "short_name": "IND",
            "logo": "https://example.com/logos/india.png",
            "country": "India"
        },
        {
            "team_id": "team_2", 
            "name": "Australia",
            "short_name": "AUS",
            "logo": "https://example.com/logos/australia.png",
            "country": "Australia"
        },
        {
            "team_id": "team_3",
            "name": "England", 
            "short_name": "ENG",
            "logo": "https://example.com/logos/england.png",
            "country": "England"
        },
        {
            "team_id": "team_4",
            "name": "Pakistan",
            "short_name": "PAK", 
            "logo": "https://example.com/logos/pakistan.png",
            "country": "Pakistan"
        },
        {
            "team_id": "team_5",
            "name": "South Africa",
            "short_name": "SA",
            "logo": "https://example.com/logos/south_africa.png", 
            "country": "South Africa"
        },
        {
            "team_id": "team_6",
            "name": "New Zealand",
            "short_name": "NZ",
            "logo": "https://example.com/logos/new_zealand.png",
            "country": "New Zealand"
        }
    ]
    
    # Insert teams
    await teams_collection.delete_many({})  # Clear existing
    await teams_collection.insert_many(teams)
    print(f"✅ Created {len(teams)} teams")
    
    print("🏆 Creating mock competitions...")
    
    # Mock competitions
    competitions = [
        {
            "competition_id": "comp_1",
            "name": "ICC World Cup 2024",
            "short_name": "World Cup",
            "category": "international",
            "format": "ODI",
            "status": "active"
        },
        {
            "competition_id": "comp_2", 
            "name": "T20 World Cup 2024",
            "short_name": "T20 WC",
            "category": "international",
            "format": "T20",
            "status": "active"
        },
        {
            "competition_id": "comp_3",
            "name": "Indian Premier League",
            "short_name": "IPL",
            "category": "domestic",
            "format": "T20",
            "status": "active"
        }
    ]
    
    # Insert competitions
    await competitions_collection.delete_many({})
    await competitions_collection.insert_many(competitions)
    print(f"✅ Created {len(competitions)} competitions")
    
    print("🏏 Creating mock matches...")
    
    # Current time
    now = datetime.utcnow()
    
    # Mock matches (mix of live, upcoming, and completed)
    matches = []
    
    # Live matches (2)
    matches.extend([
        {
            "match_id": "match_live_1",
            "title": "India vs Australia - Final",
            "competition": competitions[0],
            "teama": teams[0],  # India
            "teamb": teams[1],  # Australia  
            "format": "ODI",
            "venue": "Melbourne Cricket Ground",
            "date_start": (now - timedelta(hours=2)).isoformat(),
            "date_end": (now + timedelta(hours=4)).isoformat(),
            "status": "3",  # Live
            "status_str": "Live",
            "verified": True,
            "odds_available": True,
            "toss_winner": "India",
            "toss_decision": "bat",
            "innings": [
                {
                    "innings_number": 1,
                    "batting_team": "India", 
                    "bowling_team": "Australia",
                    "score": "287/8",
                    "overs": "50.0",
                    "completed": True
                },
                {
                    "innings_number": 2,
                    "batting_team": "Australia",
                    "bowling_team": "India", 
                    "score": "156/4",
                    "overs": "32.4",
                    "completed": False
                }
            ],
            "current_batting_team": "Australia",
            "current_bowling_team": "India",
            "target": 288,
            "required": 132,
            "required_overs": 17.2,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        },
        {
            "match_id": "match_live_2", 
            "title": "England vs Pakistan - Semi Final",
            "competition": competitions[1],
            "teama": teams[2],  # England
            "teamb": teams[3],  # Pakistan
            "format": "T20",
            "venue": "Lord's Cricket Ground",
            "date_start": (now - timedelta(hours=1)).isoformat(),
            "date_end": (now + timedelta(hours=2)).isoformat(),
            "status": "3",  # Live
            "status_str": "Live", 
            "verified": True,
            "odds_available": True,
            "toss_winner": "Pakistan",
            "toss_decision": "bowl",
            "innings": [
                {
                    "innings_number": 1,
                    "batting_team": "England",
                    "bowling_team": "Pakistan",
                    "score": "178/6", 
                    "overs": "20.0",
                    "completed": True
                },
                {
                    "innings_number": 2,
                    "batting_team": "Pakistan",
                    "bowling_team": "England",
                    "score": "89/3",
                    "overs": "12.3", 
                    "completed": False
                }
            ],
            "current_batting_team": "Pakistan",
            "current_bowling_team": "England",
            "target": 179,
            "required": 90,
            "required_overs": 7.3,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
    ])
    
    # Upcoming matches (5) 
    for i in range(5):
        team_a_idx = i % len(teams)
        team_b_idx = (i + 1) % len(teams)
        comp_idx = i % len(competitions)
        
        matches.append({
            "match_id": f"match_upcoming_{i+1}",
            "title": f"{teams[team_a_idx]['name']} vs {teams[team_b_idx]['name']}",
            "competition": competitions[comp_idx],
            "teama": teams[team_a_idx],
            "teamb": teams[team_b_idx], 
            "format": competitions[comp_idx]["format"],
            "venue": f"Stadium {i+1}",
            "date_start": (now + timedelta(hours=i*6 + 1)).isoformat(),
            "date_end": (now + timedelta(hours=i*6 + 8)).isoformat(),
            "status": "1",  # Upcoming
            "status_str": "Upcoming",
            "verified": True,
            "odds_available": True,
            "toss_winner": None,
            "toss_decision": None,
            "innings": [],
            "current_batting_team": None,
            "current_bowling_team": None,
            "target": None,
            "required": None,
            "required_overs": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        })
    
    # Completed matches (3)
    for i in range(3):
        team_a_idx = (i + 2) % len(teams)
        team_b_idx = (i + 3) % len(teams)
        comp_idx = i % len(competitions)
        
        matches.append({
            "match_id": f"match_completed_{i+1}",
            "title": f"{teams[team_a_idx]['name']} vs {teams[team_b_idx]['name']}",
            "competition": competitions[comp_idx],
            "teama": teams[team_a_idx],
            "teamb": teams[team_b_idx],
            "format": competitions[comp_idx]["format"], 
            "venue": f"Historic Stadium {i+1}",
            "date_start": (now - timedelta(days=i+1, hours=8)).isoformat(),
            "date_end": (now - timedelta(days=i+1, hours=1)).isoformat(),
            "status": "4",  # Completed
            "status_str": "Completed",
            "verified": True,
            "odds_available": False,
            "toss_winner": teams[team_a_idx]['name'],
            "toss_decision": "bat",
            "innings": [
                {
                    "innings_number": 1,
                    "batting_team": teams[team_a_idx]['name'],
                    "bowling_team": teams[team_b_idx]['name'],
                    "score": f"{200 + i*20}/{6 + i}",
                    "overs": "50.0" if competitions[comp_idx]["format"] == "ODI" else "20.0",
                    "completed": True
                },
                {
                    "innings_number": 2, 
                    "batting_team": teams[team_b_idx]['name'],
                    "bowling_team": teams[team_a_idx]['name'],
                    "score": f"{180 + i*15}/{8 + i}",
                    "overs": "47.3" if competitions[comp_idx]["format"] == "ODI" else "19.2",
                    "completed": True
                }
            ],
            "winner": teams[team_a_idx]['name'],
            "result": f"{teams[team_a_idx]['name']} won by {20 + i*5} runs",
            "created_at": (now - timedelta(days=i+1)).isoformat(),
            "updated_at": (now - timedelta(days=i+1)).isoformat()
        })
    
    # Insert matches
    await matches_collection.delete_many({})
    await matches_collection.insert_many(matches)
    print(f"✅ Created {len(matches)} matches")
    print(f"   - {len([m for m in matches if m['status'] == '3'])} live matches")
    print(f"   - {len([m for m in matches if m['status'] == '1'])} upcoming matches") 
    print(f"   - {len([m for m in matches if m['status'] == '4'])} completed matches")
    
    print("\n✅ Mock cricket data created successfully!")
    print("🎯 The platform now has realistic cricket data for betting and display")

if __name__ == "__main__":
    asyncio.run(create_mock_cricket_data())