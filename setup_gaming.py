#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from app.core.database import connect_to_mongo, get_database
from datetime import datetime
import uuid

async def setup_gaming_system():
    """Set up complete gaming system with games and features"""
    print("🎮 SETTING UP GAMING SYSTEM")
    print("=" * 50)
    
    await connect_to_mongo()
    db = await get_database()
    
    print(f"✅ Connected to database: {db.name}")
    
    # Collections
    games_collection = db["games"]
    gaming_sessions_collection = db["gaming_sessions"]
    
    # Clear existing games
    await games_collection.delete_many({})
    await gaming_sessions_collection.delete_many({})
    
    print("🎰 Creating casino games...")
    
    # Create comprehensive game library
    games = [
        # Slot Machines
        {
            "game_id": "slot_cricket_thunder",
            "name": "Cricket Thunder Slots",
            "category": "slots",
            "type": "slot_machine",
            "description": "Cricket-themed slot machine with bowling, batting, and wicket symbols",
            "min_bet": 1.0,
            "max_bet": 1000.0,
            "max_win": 50000.0,
            "rtp": 96.5,  # Return to Player percentage
            "volatility": "medium",
            "paylines": 25,
            "reels": 5,
            "symbols": [
                {"name": "cricket_bat", "value": 100, "rarity": "rare"},
                {"name": "cricket_ball", "value": 50, "rarity": "common"},
                {"name": "wickets", "value": 200, "rarity": "epic"},
                {"name": "trophy", "value": 500, "rarity": "legendary"},
                {"name": "helmet", "value": 75, "rarity": "uncommon"},
                {"name": "gloves", "value": 25, "rarity": "common"},
                {"name": "stadium", "value": 300, "rarity": "rare"}
            ],
            "bonus_features": ["free_spins", "multiplier", "wild_symbols"],
            "is_active": True,
            "status": "active",  # Add status field for compatibility
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "game_id": "slot_happy_cricket",
            "name": "Happy Cricket Fortune",
            "category": "slots",
            "type": "slot_machine",
            "description": "Colorful cricket-themed slots with Happy Coin jackpots",
            "min_bet": 0.5,
            "max_bet": 500.0,
            "max_win": 25000.0,
            "rtp": 95.8,
            "volatility": "high",
            "paylines": 20,
            "reels": 5,
            "symbols": [
                {"name": "happy_coin", "value": 1000, "rarity": "legendary"},
                {"name": "six_hit", "value": 150, "rarity": "rare"},
                {"name": "boundary", "value": 80, "rarity": "uncommon"},
                {"name": "bowler", "value": 120, "rarity": "rare"},
                {"name": "batsman", "value": 100, "rarity": "uncommon"},
                {"name": "umpire", "value": 60, "rarity": "common"},
                {"name": "crowd", "value": 40, "rarity": "common"}
            ],
            "bonus_features": ["jackpot", "free_spins", "scatter_wins"],
            "is_active": True,
            "status": "active",  # Add status field for compatibility
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        
        # Dice Games
        {
            "game_id": "dice_cricket_roll",
            "name": "Cricket Dice Roll",
            "category": "dice",
            "type": "dice_game",
            "description": "Predict the cricket score with dice rolls",
            "min_bet": 1.0,
            "max_bet": 2000.0,
            "max_win": 100000.0,
            "house_edge": 2.5,
            "dice_count": 2,
            "betting_options": [
                {"name": "over_7", "payout": 2.0, "description": "Sum over 7"},
                {"name": "under_7", "payout": 2.0, "description": "Sum under 7"},
                {"name": "exact_7", "payout": 5.0, "description": "Exactly 7"},
                {"name": "doubles", "payout": 6.0, "description": "Both dice same"},
                {"name": "cricket_score", "payout": 10.0, "description": "Cricket-like scores (4, 6, 11, 12)"}
            ],
            "is_active": True,
            "status": "active",  # Add status field for compatibility
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        
        # Crash Games
        {
            "game_id": "crash_cricket_rocket",
            "name": "Cricket Rocket Crash",
            "category": "crash",
            "type": "crash_game",
            "description": "Watch the cricket ball rocket fly and cash out before it crashes",
            "min_bet": 0.1,
            "max_bet": 5000.0,
            "max_multiplier": 100.0,
            "house_edge": 1.0,
            "auto_cashout_options": [1.5, 2.0, 5.0, 10.0],
            "crash_probability": 0.99,  # Probability of not crashing at 1x
            "is_active": True,
            "status": "active",  # Add status field for compatibility
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        
        # Card Games
        {
            "game_id": "card_cricket_poker",
            "name": "Cricket Poker",
            "category": "cards",
            "type": "poker",
            "description": "Poker with cricket-themed cards and special cricket hands",
            "min_bet": 2.0,
            "max_bet": 1000.0,
            "max_win": 50000.0,
            "house_edge": 3.0,
            "deck_type": "cricket_themed",
            "special_hands": [
                {"name": "cricket_royal", "description": "All cricket symbols", "payout": 100.0},
                {"name": "sixer_straight", "description": "Six consecutive cricket numbers", "payout": 50.0},
                {"name": "hat_trick", "description": "Three wicket cards", "payout": 25.0}
            ],
            "is_active": True,
            "status": "active",  # Add status field for compatibility
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        
        # Roulette
        {
            "game_id": "roulette_cricket_wheel",
            "name": "Cricket Roulette",
            "category": "roulette",
            "type": "roulette",
            "description": "Cricket-themed roulette with team colors and cricket numbers",
            "min_bet": 1.0,
            "max_bet": 10000.0,
            "max_win": 350000.0,  # 35:1 on single number
            "house_edge": 2.7,
            "wheel_type": "cricket_european",
            "numbers": list(range(0, 37)),  # 0-36 European style
            "special_bets": [
                {"name": "team_india", "numbers": [7, 10, 18], "payout": 11.0},
                {"name": "team_australia", "numbers": [5, 14, 23], "payout": 11.0},
                {"name": "cricket_scores", "numbers": [4, 6, 11, 22], "payout": 8.0},
                {"name": "wicket_numbers", "numbers": [1, 2, 3, 8, 9, 10], "payout": 5.0}
            ],
            "is_active": True,
            "status": "active",  # Add status field for compatibility
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        
        # Blackjack
        {
            "game_id": "blackjack_cricket",
            "name": "Cricket Blackjack",
            "category": "cards", 
            "type": "blackjack",
            "description": "Traditional blackjack with cricket bonus features",
            "min_bet": 5.0,
            "max_bet": 2000.0,
            "max_win": 30000.0,
            "house_edge": 0.5,
            "deck_count": 6,
            "special_rules": [
                {"name": "cricket_21", "description": "21 with cricket cards pays 3:1"},
                {"name": "wicket_split", "description": "Split any two wicket cards"},
                {"name": "boundary_double", "description": "Double down on boundary cards (4, 6)"}
            ],
            "is_active": True,
            "status": "active",  # Add status field for compatibility
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    # Insert games
    result = await games_collection.insert_many(games)
    print(f"✅ Created {len(games)} casino games")
    
    # Display created games
    print("\n🎲 Games Created:")
    for game in games:
        print(f"  🎮 {game['name']} ({game['category']})")
        print(f"     Min Bet: ${game['min_bet']} | Max Bet: ${game['max_bet']}")
        print(f"     ID: {game['game_id']}")
        print()
    
    # Create sample jackpots
    print("💰 Creating jackpots...")
    
    jackpots_collection = db["jackpots"]
    await jackpots_collection.delete_many({})
    
    jackpots = [
        {
            "jackpot_id": "mega_cricket_jackpot",
            "name": "Mega Cricket Jackpot",
            "current_amount": 50000.0,
            "currency": "INR",
            "happy_coin_amount": 50.0,
            "eligible_games": ["slot_cricket_thunder", "slot_happy_cricket"],
            "trigger_probability": 0.0001,  # 1 in 10,000
            "last_won": None,
            "last_winner": None,
            "total_won_all_time": 150000.0,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "jackpot_id": "mini_cricket_jackpot",
            "name": "Mini Cricket Jackpot",
            "current_amount": 5000.0,
            "currency": "INR",
            "happy_coin_amount": 5.0,
            "eligible_games": ["dice_cricket_roll", "crash_cricket_rocket"],
            "trigger_probability": 0.001,  # 1 in 1,000
            "last_won": None,
            "last_winner": None,
            "total_won_all_time": 25000.0,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    await jackpots_collection.insert_many(jackpots)
    print(f"✅ Created {len(jackpots)} jackpots")
    
    for jackpot in jackpots:
        print(f"  💎 {jackpot['name']}: ₹{jackpot['current_amount']:,}")
    
    # Create gaming statistics
    print("\n📊 Creating gaming statistics...")
    
    stats_collection = db["gaming_stats"]
    await stats_collection.delete_many({})
    
    stats = {
        "total_games_played": 15420,
        "total_bets_placed": 89234,
        "total_amount_wagered": 2456789.50,
        "total_amount_won": 2134567.80,
        "house_profit": 322221.70,
        "active_players": 1247,
        "biggest_win": {
            "amount": 45000.0,
            "game": "slot_cricket_thunder",
            "player": "anonymous",
            "date": "2025-06-25"
        },
        "popular_games": [
            {"game_id": "slot_cricket_thunder", "plays": 5430},
            {"game_id": "crash_cricket_rocket", "plays": 4210},
            {"game_id": "dice_cricket_roll", "plays": 3890},
            {"game_id": "roulette_cricket_wheel", "plays": 1890}
        ],
        "last_updated": datetime.utcnow().isoformat()
    }
    
    await stats_collection.insert_one(stats)
    print("✅ Gaming statistics created")
    
    print("\n" + "=" * 50)
    print("🎯 GAMING SYSTEM SETUP COMPLETE!")
    print(f"\n📈 Summary:")
    print(f"🎮 {len(games)} games created")
    print(f"💰 {len(jackpots)} jackpots active")
    print(f"📊 Gaming statistics initialized")
    print("\n🎲 Available Game Categories:")
    categories = set(game['category'] for game in games)
    for category in categories:
        count = sum(1 for game in games if game['category'] == category)
        print(f"  - {category.title()}: {count} games")

if __name__ == "__main__":
    asyncio.run(setup_gaming_system())