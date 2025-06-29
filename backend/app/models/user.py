from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class KYCStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    NOT_SUBMITTED = "not_submitted"

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    country: str = "IN"
    
class UserCreate(UserBase):
    password: str
    referral_code: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None

class UserResponse(UserBase):
    user_id: str
    role: UserRole
    kyc_status: KYCStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    referral_code: str
    referred_by: Optional[str] = None
    
class UserInDB(UserResponse):
    password_hash: str

class KYCDocument(BaseModel):
    document_type: str  # "aadhar", "pan", "passport", "driving_license"
    document_number: str
    document_image: str  # Base64 encoded image
    selfie_image: str   # Base64 encoded selfie

class KYCSubmission(BaseModel):
    user_id: str
    documents: List[KYCDocument]
    submitted_at: datetime = datetime.utcnow()
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse