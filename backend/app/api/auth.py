from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from ..models.user import LoginRequest, LoginResponse, UserCreate, UserResponse
from ..services.user_service import user_service
from ..core.security import verify_token

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        # Create user
        user = await user_service.create_user(user_data)
        
        # Create wallet for the user
        from ..services.wallet_service import wallet_service
        await wallet_service.create_wallet(user.user_id)
        
        # Create tokens
        tokens = await user_service.create_tokens(user)
        
        # Return user data without password hash
        user_response = UserResponse(
            user_id=user.user_id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            phone=user.phone,
            country=user.country,
            role=user.role,
            kyc_status=user.kyc_status,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            referral_code=user.referral_code,
            referred_by=user.referred_by
        )
        
        return {
            "message": "User registered successfully",
            "user": user_response,
            **tokens
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=LoginResponse)
async def login_user(login_data: LoginRequest):
    """Login user and return tokens"""
    try:
        # Authenticate user
        user = await user_service.authenticate_user(login_data.email, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )
        
        # Create tokens
        tokens = await user_service.create_tokens(user)
        
        # Create user response
        user_response = UserResponse(
            user_id=user.user_id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            phone=user.phone,
            country=user.country,
            role=user.role,
            kyc_status=user.kyc_status,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            referral_code=user.referral_code,
            referred_by=user.referred_by
        )
        
        return LoginResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """Get current authenticated user"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return UserResponse(
            user_id=user.user_id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            phone=user.phone,
            country=user.country,
            role=user.role,
            kyc_status=user.kyc_status,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            referral_code=user.referral_code,
            referred_by=user.referred_by
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout_user():
    """Logout user (client should remove tokens)"""
    return {"message": "Logged out successfully"}