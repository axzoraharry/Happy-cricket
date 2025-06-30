#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

from app.core.database import connect_to_mongo, get_database
from app.services.user_service import user_service
from app.models.user import UserCreate

async def create_test_users():
    """Create test users for the platform"""
    await connect_to_mongo()
    
    print("Creating test users...")
    
    # Test user
    test_user = UserCreate(
        email="test@happycricket.com",
        password="testpass123",
        username="testuser",
        full_name="Test User",
        phone="+1234567890",
        country="IN"
    )
    
    # Admin user
    admin_user = UserCreate(
        email="admin@happycricket.com", 
        password="admin123",
        username="admin",
        full_name="Admin User",
        phone="+1234567891",
        country="IN"
    )
    
    try:
        # Create test user
        user = await user_service.create_user(test_user)
        print(f"✅ Created test user: {user.email}")
        
        # Create admin user and update role
        admin = await user_service.create_user(admin_user)
        print(f"✅ Created admin user: {admin.email}")
        
        # Update admin role
        db = await get_database()
        collection = db["users"]
        await collection.update_one(
            {"user_id": admin.user_id},
            {"$set": {"role": "admin"}}
        )
        print(f"✅ Updated admin role for: {admin.email}")
        
    except Exception as e:
        print(f"❌ Error creating users: {str(e)}")
    
    print("\nTest users created successfully!")
    print("Test User: test@happycricket.com / testpass123")
    print("Admin User: admin@happycricket.com / admin123")

if __name__ == "__main__":
    asyncio.run(create_test_users())