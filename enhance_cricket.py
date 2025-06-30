#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from app.core.database import connect_to_mongo, get_database
from datetime import datetime, timedelta
import random

async def enhance_cricket_features():
    """Add enhanced cricket features like odds, statistics, commentary"""
    print("🏏 ENHANCING CRICKET FEATURES")
    print("=" * 50)
    
    await connect_to_mongo()
    db = await get_database()
    
    # Collections
    matches_collection = db["cricket_matches"]
    odds_collection = db["cricket_odds"]
    stats_collection = db["cricket_statistics"]
    commentary_collection = db["cricket_commentary"]
    
    print("📊 Adding betting odds to matches...")
    
    # Get all matches
    matches = []
    async for match in matches_collection.find():
        matches.append(match)
    
    # Create betting odds for each match
    odds_data = []
    for match in matches:
        match_id = match['match_id']
        
        # Generate realistic odds based on team strength
        team_a = match['teama']['name']
        team_b = match['teamb']['name']
        
        # Base odds (higher number = less likely to win)
        team_strength = {
            'India': 1.8,
            'Australia': 2.0,
            'England': 2.2,
            'Pakistan': 2.5,
            'South Africa': 2.3,
            'New Zealand': 2.7
        }
        
        team_a_odds = team_strength.get(team_a, 2.5)
        team_b_odds = team_strength.get(team_b, 2.5)
        
        # Adjust for home advantage
        if 'Stadium' in match.get('venue', ''):
            if team_a in match['venue']:
                team_a_odds *= 0.9  # Home advantage
                team_b_odds *= 1.1
        
        # Create comprehensive odds
        odds = {
            "match_id": match_id,
            "match_title": match['title'],
            "market_odds": {
                "match_winner": {
                    team_a: round(team_a_odds, 2),
                    team_b: round(team_b_odds, 2),
                    "draw": 8.5 if match['format'] != 'T20' else None
                },
                "total_runs": {
                    "over_300": 2.1 if match['format'] == 'ODI' else None,
                    "under_300": 1.8 if match['format'] == 'ODI' else None,
                    "over_160": 1.9 if match['format'] == 'T20' else None,
                    "under_160": 1.9 if match['format'] == 'T20' else None
                },
                "top_batsman": {
                    f"{team_a}_player_1": 4.5,
                    f"{team_a}_player_2": 5.2,
                    f"{team_b}_player_1": 4.8,
                    f"{team_b}_player_2": 5.5,
                    "other": 12.0
                },
                "top_bowler": {
                    f"{team_a}_bowler_1": 3.8,
                    f"{team_a}_bowler_2": 4.2,
                    f"{team_b}_bowler_1": 4.0,
                    f"{team_b}_bowler_2": 4.5,
                    "other": 15.0
                },
                "first_innings_runs": {
                    "over_250": 2.2 if match['format'] == 'ODI' else None,
                    "under_250": 1.7 if match['format'] == 'ODI' else None,
                    "over_150": 1.8 if match['format'] == 'T20' else None,
                    "under_150": 2.0 if match['format'] == 'T20' else None
                },
                "method_of_victory": {
                    "runs": 1.9,
                    "wickets": 2.1,
                    "super_over": 25.0 if match['format'] == 'T20' else None
                },
                "highest_opening_partnership": {
                    "over_50": 2.5,
                    "under_50": 1.5,
                    "over_100": 6.0,
                    "under_25": 3.2
                }
            },
            "live_odds": {
                "next_ball": {
                    "dot_ball": 2.8,
                    "single": 3.2,
                    "boundary": 8.5,
                    "six": 15.0,
                    "wicket": 12.0
                },
                "next_over_runs": {
                    "0-3": 4.5,
                    "4-7": 2.8,
                    "8-12": 3.5,
                    "13+": 8.0
                }
            } if match['status'] == '3' else {},
            "odds_updated_at": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Remove None values
        def clean_odds(obj):
            if isinstance(obj, dict):
                return {k: clean_odds(v) for k, v in obj.items() if v is not None}
            return obj
        
        odds = clean_odds(odds)
        odds_data.append(odds)
    
    # Insert odds
    await odds_collection.delete_many({})
    if odds_data:
        await odds_collection.insert_many(odds_data)
    print(f"✅ Created odds for {len(odds_data)} matches")
    
    print("\n📈 Creating player and team statistics...")
    
    # Create comprehensive statistics
    stats_data = [
        # Team Statistics
        {
            "type": "team_stats",
            "team_name": "India",
            "stats": {
                "matches_played": 156,
                "wins": 98,
                "losses": 52,
                "draws": 6,
                "win_percentage": 62.8,
                "highest_score": 418,
                "lowest_score": 36,
                "average_score": 284.5,
                "best_bowling": "6/12",
                "current_ranking": {
                    "odi": 1,
                    "t20": 2,
                    "test": 1
                },
                "recent_form": ["W", "W", "L", "W", "W"],
                "home_record": {"wins": 65, "losses": 15},
                "away_record": {"wins": 33, "losses": 37}
            },
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "type": "team_stats",
            "team_name": "Australia",
            "stats": {
                "matches_played": 162,
                "wins": 89,
                "losses": 67,
                "draws": 6,
                "win_percentage": 54.9,
                "highest_score": 434,
                "lowest_score": 45,
                "average_score": 278.2,
                "best_bowling": "7/15",
                "current_ranking": {
                    "odi": 3,
                    "t20": 4,
                    "test": 2
                },
                "recent_form": ["L", "W", "W", "L", "W"],
                "home_record": {"wins": 58, "losses": 22},
                "away_record": {"wins": 31, "losses": 45}
            },
            "updated_at": datetime.utcnow().isoformat()
        },
        
        # Player Statistics
        {
            "type": "player_stats",
            "player_name": "Virat Kohli",
            "team": "India",
            "position": "Batsman",
            "stats": {
                "matches": 295,
                "runs": 13848,
                "average": 57.32,
                "strike_rate": 92.89,
                "centuries": 46,
                "half_centuries": 65,
                "highest_score": 183,
                "recent_scores": [72, 45, 89, 123, 34],
                "vs_teams": {
                    "Australia": {"matches": 45, "runs": 2234, "average": 52.9},
                    "England": {"matches": 38, "runs": 1876, "average": 54.8},
                    "Pakistan": {"matches": 12, "runs": 734, "average": 73.4}
                }
            },
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "type": "player_stats", 
            "player_name": "Jasprit Bumrah",
            "team": "India",
            "position": "Bowler",
            "stats": {
                "matches": 89,
                "wickets": 145,
                "average": 23.45,
                "economy_rate": 4.82,
                "best_figures": "6/19",
                "five_wickets": 4,
                "recent_figures": ["2/34", "1/45", "3/28", "0/42", "4/31"],
                "vs_teams": {
                    "Australia": {"matches": 18, "wickets": 32, "average": 21.8},
                    "England": {"matches": 16, "wickets": 28, "average": 25.2},
                    "Pakistan": {"matches": 8, "wickets": 15, "average": 19.8}
                }
            },
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    await stats_collection.delete_many({})
    await stats_collection.insert_many(stats_data)
    print(f"✅ Created statistics for {len(stats_data)} entities")
    
    print("\n💬 Adding live commentary...")
    
    # Create live commentary for live matches
    commentary_data = []
    live_matches = [m for m in matches if m['status'] == '3']
    
    for match in live_matches:
        match_id = match['match_id']
        
        # Generate commentary based on match situation
        team_batting = match.get('current_batting_team', match['teama']['name'])
        team_bowling = match.get('current_bowling_team', match['teamb']['name'])
        
        # Sample commentary entries
        commentary_entries = [
            {
                "match_id": match_id,
                "over": 32.4,
                "ball": 4,
                "commentary": f"FOUR! Beautiful cover drive by the batsman. {team_batting} looking in control here.",
                "event_type": "boundary",
                "runs": 4,
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "match_id": match_id,
                "over": 32.3,
                "ball": 3,
                "commentary": f"Good length delivery outside off, safely negotiated to the keeper.",
                "event_type": "dot_ball",
                "runs": 0,
                "timestamp": (datetime.utcnow() - timedelta(minutes=1)).isoformat()
            },
            {
                "match_id": match_id,
                "over": 32.2,
                "ball": 2,
                "commentary": f"Single taken towards mid-wicket. Good running between the wickets.",
                "event_type": "single",
                "runs": 1,
                "timestamp": (datetime.utcnow() - timedelta(minutes=2)).isoformat()
            },
            {
                "match_id": match_id,
                "over": 32.1,
                "ball": 1,
                "commentary": f"WICKET! {team_bowling} strikes! Brilliant catch in the slips. The crowd erupts!",
                "event_type": "wicket",
                "runs": 0,
                "dismissal_type": "caught",
                "timestamp": (datetime.utcnow() - timedelta(minutes=3)).isoformat()
            },
            {
                "match_id": match_id,
                "over": 31.6,
                "ball": 6,
                "commentary": f"SIX! Massive hit over long-on! The ball sails into the crowd. What a shot!",
                "event_type": "six",
                "runs": 6,
                "timestamp": (datetime.utcnow() - timedelta(minutes=4)).isoformat()
            }
        ]
        
        commentary_data.extend(commentary_entries)
    
    if commentary_data:
        await commentary_collection.delete_many({})
        await commentary_collection.insert_many(commentary_data)
        print(f"✅ Created {len(commentary_data)} commentary entries")
    
    print("\n🎯 Creating match predictions and insights...")
    
    # Add predictions collection
    predictions_collection = db["cricket_predictions"]
    await predictions_collection.delete_many({})
    
    predictions_data = []
    for match in matches:
        if match['status'] in ['1', '3']:  # Upcoming or live
            team_a = match['teama']['name']
            team_b = match['teamb']['name']
            
            # AI-generated predictions
            prediction = {
                "match_id": match['match_id'],
                "ai_prediction": {
                    "winner": team_a if random.random() > 0.5 else team_b,
                    "confidence": round(random.uniform(65, 85), 1),
                    "predicted_margin": f"{random.randint(15, 45)} runs" if random.random() > 0.5 else f"{random.randint(3, 7)} wickets",
                    "key_factors": [
                        f"{team_a}'s recent form",
                        "Weather conditions favoring batsmen",
                        f"{team_b}'s bowling attack",
                        "Pitch report suggests high-scoring game"
                    ]
                },
                "expert_analysis": {
                    "pitch_report": "The wicket looks good for batting with even bounce expected throughout the match.",
                    "weather_impact": "Clear skies with mild breeze. No rain expected.",
                    "team_news": f"Both teams are likely to field their strongest XI.",
                    "key_battles": [
                        f"{team_a} batting vs {team_b} bowling",
                        f"Middle-order stability will be crucial"
                    ]
                },
                "historical_stats": {
                    "head_to_head": {
                        team_a: random.randint(8, 15),
                        team_b: random.randint(8, 15)
                    },
                    "venue_record": {
                        "matches_played": random.randint(15, 35),
                        "average_first_innings": random.randint(250, 320),
                        "chase_success_rate": f"{random.randint(45, 75)}%"
                    }
                },
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            predictions_data.append(prediction)
    
    if predictions_data:
        await predictions_collection.insert_many(predictions_data)
        print(f"✅ Created predictions for {len(predictions_data)} matches")
    
    print("\n" + "=" * 50)
    print("🎯 CRICKET FEATURES ENHANCEMENT COMPLETE!")
    print(f"\n📈 Summary:")
    print(f"📊 Betting odds: {len(odds_data)} matches")
    print(f"📈 Statistics: {len(stats_data)} entities")
    print(f"💬 Commentary: {len(commentary_data)} entries")
    print(f"🎯 Predictions: {len(predictions_data)} matches")

if __name__ == "__main__":
    asyncio.run(enhance_cricket_features())