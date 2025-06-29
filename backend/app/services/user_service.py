from typing import Optional, List
from datetime import datetime, timedelta
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import get_database
from ..core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from ..models.user import UserCreate, UserInDB, UserResponse, UserRole, KYCStatus, KYCSubmission
from fastapi import HTTPException, status

class UserService:
    """Service for user management operations"""
    
    def __init__(self):
        self.collection_name = "users"
        self.kyc_collection_name = "kyc_submissions"
    
    async def create_user(self, user_data: UserCreate) -> UserInDB:
        """Create a new user"""
        db = await get_database()
        collection = db[self.collection_name]
        
        # Check if user already exists
        existing_user = await collection.find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        # Generate user ID and referral code
        user_id = str(uuid.uuid4())
        referral_code = f"HC{user_id[:8].upper()}"
        
        # Hash password
        password_hash = get_password_hash(user_data.password)
        
        # Create user document
        user_doc = {
            "user_id": user_id,
            "email": user_data.email,
            "username": user_data.username,
            "full_name": user_data.full_name,
            "phone": user_data.phone,
            "country": user_data.country,
            "password_hash": password_hash,
            "role": UserRole.USER,
            "kyc_status": KYCStatus.NOT_SUBMITTED,
            "is_active": True,
            "referral_code": referral_code,
            "referred_by": user_data.referral_code if user_data.referral_code else None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert user
        result = await collection.insert_one(user_doc)
        
        if result.inserted_id:
            return UserInDB(**user_doc)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate user with email and password"""
        db = await get_database()
        collection = db[self.collection_name]
        
        user = await collection.find_one({"email": email})
        if not user:
            return None
        
        if not verify_password(password, user.get("password_hash")):
            return None
        
        return UserInDB(**user)
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID"""
        db = await get_database()
        collection = db[self.collection_name]
        
        user = await collection.find_one({"user_id": user_id})
        if user:
            return UserInDB(**user)
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email"""
        db = await get_database()
        collection = db[self.collection_name]
        
        user = await collection.find_one({"email": email})
        if user:
            return UserInDB(**user)
        return None
    
    async def update_user(self, user_id: str, update_data: dict) -> Optional[UserInDB]:
        """Update user information"""
        db = await get_database()
        collection = db[self.collection_name]
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return await self.get_user_by_id(user_id)
        return None
    
    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        db = await get_database()
        collection = db[self.collection_name]
        
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    
    async def update_kyc_status(self, user_id: str, kyc_status: KYCStatus) -> bool:
        """Update user KYC status"""
        db = await get_database()
        collection = db[self.collection_name]
        
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": {"kyc_status": kyc_status, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    
    async def submit_kyc(self, kyc_data: KYCSubmission) -> bool:
        """Submit KYC documents for verification"""
        db = await get_database()
        kyc_collection = db[self.kyc_collection_name]
        
        # Create KYC submission document
        kyc_doc = {
            "submission_id": str(uuid.uuid4()),
            "user_id": kyc_data.user_id,
            "documents": [doc.dict() for doc in kyc_data.documents],
            "status": KYCStatus.PENDING,
            "submitted_at": datetime.utcnow(),
            "reviewed_at": None,
            "reviewer_id": None,
            "review_notes": None
        }
        
        # Insert KYC submission
        result = await kyc_collection.insert_one(kyc_doc)
        
        if result.inserted_id:
            # Update user KYC status to pending
            await self.update_kyc_status(kyc_data.user_id, KYCStatus.PENDING)
            return True
        
        return False
    
    async def get_users_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get users by role with pagination"""
        db = await get_database()
        collection = db[self.collection_name]
        
        cursor = collection.find({"role": role}).skip(skip).limit(limit)
        users = []
        
        async for user_doc in cursor:
            # Remove password hash from response
            user_doc.pop("password_hash", None)
            users.append(UserResponse(**user_doc))
        
        return users
    
    async def get_referral_users(self, referral_code: str) -> List[UserResponse]:
        """Get users referred by a specific referral code"""
        db = await get_database()
        collection = db[self.collection_name]
        
        cursor = collection.find({"referred_by": referral_code})
        users = []
        
        async for user_doc in cursor:
            user_doc.pop("password_hash", None)
            users.append(UserResponse(**user_doc))
        
        return users
    
    async def create_tokens(self, user: UserInDB) -> dict:
        """Create access and refresh tokens for user"""
        access_token_expires = timedelta(minutes=30)
        refresh_token_expires = timedelta(days=7)
        
        access_token = create_access_token(
            data={"sub": user.user_id, "email": user.email, "role": user.role},
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user.user_id, "email": user.email}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

# Global user service instance
user_service = UserService()