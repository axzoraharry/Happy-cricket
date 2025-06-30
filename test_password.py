#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

from app.core.database import connect_to_mongo, get_database
from app.core.security import verify_password

async def test_password():
    """Test password verification"""
    await connect_to_mongo()
    
    db = await get_database()
    collection = db["users"]
    
    user = await collection.find_one({"email": "test@happycricket.com"})
    if user:
        print(f"Found user: {user['email']}")
        print(f"Password hash: {user['password_hash'][:50]}...")
        
        # Test password verification
        test_password = "testpass123"
        is_valid = verify_password(test_password, user['password_hash'])
        print(f"Password verification result: {is_valid}")
        
        if not is_valid:
            print("❌ Password verification failed!")
            # Try to update password hash
            from app.core.security import get_password_hash
            new_hash = get_password_hash(test_password)
            
            result = await collection.update_one(
                {"email": "test@happycricket.com"},
                {"$set": {"password_hash": new_hash}}
            )
            
            if result.modified_count > 0:
                print("✅ Updated password hash")
                # Test again
                user = await collection.find_one({"email": "test@happycricket.com"})
                is_valid = verify_password(test_password, user['password_hash'])
                print(f"Password verification after update: {is_valid}")
            else:
                print("❌ Failed to update password hash")
        else:
            print("✅ Password verification successful!")
    else:
        print("❌ User not found!")

if __name__ == "__main__":
    asyncio.run(test_password())