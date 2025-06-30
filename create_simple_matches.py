#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from datetime import datetime, timedelta
import json
from app.core.database import connect_to_mongo, get_database

async def create_simple_match_data():
    """Create simple match data that won't cause serialization issues"""
    print("🏏 Creating Simple Match Data")
    print("=" * 50)
    
    await connect_to_mongo()
    db = await get_database()
    
    # Collections
    matches_collection = db["cricket_matches"]
    
    print("🏏 Creating simple matches...")
    
    # Current time
    now = datetime.utcnow()
    
    # Simple match structure
    matches = [
        {
            "match_id": "match_live_1",
            "title": "India vs Australia - Final",
            "teama": {"name": "India", "short_name": "IND"},
            "teamb": {"name": "Australia", "short_name": "AUS"},
            "format": "ODI",
            "venue": "Melbourne Cricket Ground",
            "date_start": (now - timedelta(hours=2)).isoformat(),
            "status": "3",
            "status_str": "Live",
            "verified": True,
            "odds_available": True
        },
        {
            "match_id": "match_live_2",
            "title": "England vs Pakistan - Semi Final",
            "teama": {"name": "England", "short_name": "ENG"},
            "teamb": {"name": "Pakistan", "short_name": "PAK"},
            "format": "T20",
            "venue": "Lord's Cricket Ground",
            "date_start": (now - timedelta(hours=1)).isoformat(),
            "status": "3",
            "status_str": "Live",
            "verified": True,
            "odds_available": True
        },
        {
            "match_id": "match_upcoming_1",
            "title": "South Africa vs New Zealand",
            "teama": {"name": "South Africa", "short_name": "SA"},
            "teamb": {"name": "New Zealand", "short_name": "NZ"},
            "format": "ODI",
            "venue": "Cape Town Stadium",
            "date_start": (now + timedelta(hours=6)).isoformat(),
            "status": "1",
            "status_str": "Upcoming",
            "verified": True,
            "odds_available": True
        },
        {
            "match_id": "match_upcoming_2",
            "title": "India vs England",
            "teama": {"name": "India", "short_name": "IND"},
            "teamb": {"name": "England", "short_name": "ENG"},
            "format": "T20",
            "venue": "Mumbai Stadium",
            "date_start": (now + timedelta(hours=12)).isoformat(),
            "status": "1",
            "status_str": "Upcoming",
            "verified": True,
            "odds_available": True
        }
    ]
    
    # Insert matches
    await matches_collection.delete_many({})
    await matches_collection.insert_many(matches)
    print(f"✅ Created {len(matches)} simple matches")
    
    # Test retrieval
    print("\n📋 Testing data retrieval:")
    live_matches = []
    async for match in matches_collection.find({"status": "3"}):
        match.pop('_id', None)
        live_matches.append(match)
    
    print(f"Live matches found: {len(live_matches)}")
    for match in live_matches:
        print(f"  - {match['title']}")

if __name__ == "__main__":
    asyncio.run(create_simple_match_data())