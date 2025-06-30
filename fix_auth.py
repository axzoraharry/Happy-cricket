#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('/app/backend')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from app.core.database import connect_to_mongo, get_database
from app.services.user_service import user_service
from app.core.security import get_password_hash, verify_password
from datetime import datetime

async def fix_authentication():
    """Fix authentication issues by ensuring proper user setup"""
    print("🔐 FIXING AUTHENTICATION ISSUES")
    print("=" * 50)
    
    await connect_to_mongo()
    db = await get_database()
    
    print(f"✅ Connected to database: {db.name}")
    
    # Check existing users
    users_collection = db["users"]
    user_count = await users_collection.count_documents({})
    print(f"📊 Current users in database: {user_count}")
    
    # List existing users
    if user_count > 0:
        print("\n👥 Existing users:")
        async for user in users_collection.find():
            print(f"  - {user.get('email')} (Active: {user.get('is_active')})")
    
    # Create/update test user with proper password
    test_email = "test@happycricket.com"
    test_password = "testpass123"
    
    existing_user = await users_collection.find_one({"email": test_email})
    
    if existing_user:
        print(f"\n🔄 Updating existing user: {test_email}")
        
        # Update password hash
        new_password_hash = get_password_hash(test_password)
        
        result = await users_collection.update_one(
            {"email": test_email},
            {
                "$set": {
                    "password_hash": new_password_hash,
                    "is_active": True,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        if result.modified_count > 0:
            print("✅ User password updated successfully")
        else:
            print("❌ Failed to update user password")
    else:
        print(f"\n➕ Creating new test user: {test_email}")
        
        import uuid
        from app.models.user import UserRole, KYCStatus
        
        # Create new user
        user_id = str(uuid.uuid4())
        referral_code = f"HC{user_id[:8].upper()}"
        password_hash = get_password_hash(test_password)
        
        user_doc = {
            "user_id": user_id,
            "email": test_email,
            "username": "testuser",
            "full_name": "Test User",
            "phone": "+1234567890",
            "country": "IN",
            "password_hash": password_hash,
            "role": UserRole.USER,
            "kyc_status": KYCStatus.NOT_SUBMITTED,
            "is_active": True,
            "referral_code": referral_code,
            "referred_by": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = await users_collection.insert_one(user_doc)
        
        if result.inserted_id:
            print("✅ Test user created successfully")
            
            # Create wallet for the user
            from app.services.wallet_service import wallet_service
            try:
                await wallet_service.create_wallet(user_id)
                print("✅ Wallet created for test user")
            except Exception as e:
                print(f"⚠️ Warning: Could not create wallet: {e}")
        else:
            print("❌ Failed to create test user")
    
    # Test password verification
    print(f"\n🧪 Testing password verification for {test_email}...")
    
    user = await users_collection.find_one({"email": test_email})
    if user:
        password_valid = verify_password(test_password, user['password_hash'])
        print(f"Password verification: {'✅ PASS' if password_valid else '❌ FAIL'}")
        
        if password_valid:
            # Test user service authentication
            print("🔍 Testing user service authentication...")
            
            try:
                authenticated_user = await user_service.authenticate_user(test_email, test_password)
                if authenticated_user:
                    print("✅ User service authentication: PASS")
                    
                    # Test token creation
                    tokens = await user_service.create_tokens(authenticated_user)
                    print("✅ Token creation: PASS")
                    print(f"   Access token: {tokens['access_token'][:30]}...")
                    
                else:
                    print("❌ User service authentication: FAIL")
            except Exception as e:
                print(f"❌ User service authentication error: {e}")
    
    # Create admin user
    print(f"\n👑 Creating admin user...")
    admin_email = "admin@happycricket.com"
    admin_password = "admin123"
    
    existing_admin = await users_collection.find_one({"email": admin_email})
    
    if not existing_admin:
        import uuid
        from app.models.user import UserRole, KYCStatus
        
        admin_id = str(uuid.uuid4())
        admin_referral_code = f"HC{admin_id[:8].upper()}"
        admin_password_hash = get_password_hash(admin_password)
        
        admin_doc = {
            "user_id": admin_id,
            "email": admin_email,
            "username": "admin",
            "full_name": "Admin User",
            "phone": "+1234567891",
            "country": "IN",
            "password_hash": admin_password_hash,
            "role": UserRole.ADMIN,
            "kyc_status": KYCStatus.VERIFIED,
            "is_active": True,
            "referral_code": admin_referral_code,
            "referred_by": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = await users_collection.insert_one(admin_doc)
        
        if result.inserted_id:
            print("✅ Admin user created successfully")
            
            # Create wallet for admin
            try:
                from app.services.wallet_service import wallet_service
                await wallet_service.create_wallet(admin_id)
                print("✅ Admin wallet created")
            except Exception as e:
                print(f"⚠️ Warning: Could not create admin wallet: {e}")
        else:
            print("❌ Failed to create admin user")
    else:
        print("✅ Admin user already exists")
    
    print("\n" + "=" * 50)
    print("🎯 AUTHENTICATION SETUP COMPLETE!")
    print("\nTest Credentials:")
    print(f"Email: {test_email}")
    print(f"Password: {test_password}")
    print(f"\nAdmin Credentials:")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")

if __name__ == "__main__":
    asyncio.run(fix_authentication())