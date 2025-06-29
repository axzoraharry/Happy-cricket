from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.user import UserResponse, UserUpdate, KYCSubmission
from ..services.user_service import user_service
from ..api.auth import get_current_user

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get user profile"""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    update_data: UserUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update user profile"""
    try:
        updated_user = await user_service.update_user(
            current_user.user_id, 
            update_data.dict(exclude_unset=True)
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            user_id=updated_user.user_id,
            email=updated_user.email,
            username=updated_user.username,
            full_name=updated_user.full_name,
            phone=updated_user.phone,
            country=updated_user.country,
            role=updated_user.role,
            kyc_status=updated_user.kyc_status,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at,
            updated_at=updated_user.updated_at,
            referral_code=updated_user.referral_code,
            referred_by=updated_user.referred_by
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/kyc/submit")
async def submit_kyc_documents(
    kyc_data: KYCSubmission,
    current_user: UserResponse = Depends(get_current_user)
):
    """Submit KYC documents for verification"""
    try:
        # Set user_id from current user
        kyc_data.user_id = current_user.user_id
        
        success = await user_service.submit_kyc(kyc_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit KYC documents"
            )
        
        return {"message": "KYC documents submitted successfully. Verification in progress."}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/referrals", response_model=List[UserResponse])
async def get_user_referrals(current_user: UserResponse = Depends(get_current_user)):
    """Get users referred by current user"""
    try:
        referrals = await user_service.get_referral_users(current_user.referral_code)
        return referrals
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch referrals"
        )

@router.delete("/account")
async def deactivate_account(current_user: UserResponse = Depends(get_current_user)):
    """Deactivate user account"""
    try:
        success = await user_service.deactivate_user(current_user.user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to deactivate account"
            )
        
        return {"message": "Account deactivated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )