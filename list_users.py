#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

from app.core.database import connect_to_mongo, get_database

async def list_users():
    """List all users in the database"""
    await connect_to_mongo()
    
    db = await get_database()
    collection = db["users"]
    
    print("Listing all users in database:")
    print("-" * 50)
    
    count = 0
    async for user in collection.find():
        count += 1
        print(f"User {count}:")
        print(f"  ID: {user.get('user_id')}")
        print(f"  Email: {user.get('email')}")
        print(f"  Username: {user.get('username')}")
        print(f"  Full Name: {user.get('full_name')}")
        print(f"  Role: {user.get('role')}")
        print(f"  Active: {user.get('is_active')}")
        print(f"  Has Password Hash: {'Yes' if user.get('password_hash') else 'No'}")
        print("-" * 30)
    
    if count == 0:
        print("No users found in database!")
    else:
        print(f"Total users found: {count}")

if __name__ == "__main__":
    asyncio.run(list_users())