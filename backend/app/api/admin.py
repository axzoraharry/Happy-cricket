from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.user import UserResponse, UserRole, KYCStatus
from ..api.auth import get_current_user
from ..services.user_service import user_service
from ..services.wallet_service import wallet_service

router = APIRouter()

async def verify_admin_access(current_user: UserResponse = Depends(get_current_user)):
    """Verify that the current user has admin access"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: UserResponse = Depends(verify_admin_access)
):
    """Get all users (admin only)"""
    try:
        # Get all users regardless of role
        users = await user_service.get_users_by_role(UserRole.USER, skip, limit)
        return {
            "users": users,
            "count": len(users)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@router.get("/kyc/pending")
async def get_pending_kyc_submissions(
    admin_user: UserResponse = Depends(verify_admin_access)
):
    """Get pending KYC submissions for review"""
    try:
        # TODO: Implement KYC pending submissions logic
        return {
            "pending_submissions": [],
            "count": 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch pending KYC submissions"
        )

@router.post("/kyc/{user_id}/approve")
async def approve_kyc(
    user_id: str,
    admin_user: UserResponse = Depends(verify_admin_access)
):
    """Approve user KYC"""
    try:
        success = await user_service.update_kyc_status(user_id, KYCStatus.VERIFIED)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "KYC approved successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/kyc/{user_id}/reject")
async def reject_kyc(
    user_id: str,
    admin_user: UserResponse = Depends(verify_admin_access)
):
    """Reject user KYC"""
    try:
        success = await user_service.update_kyc_status(user_id, KYCStatus.REJECTED)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "KYC rejected"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/stats/overview")
async def get_platform_stats(
    admin_user: UserResponse = Depends(verify_admin_access)
):
    """Get platform overview statistics"""
    try:
        # TODO: Implement comprehensive stats
        return {
            "total_users": 0,
            "active_users": 0,
            "total_deposits": 0,
            "total_withdrawals": 0,
            "total_bets": 0,
            "platform_revenue": 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch platform stats"
        )

@router.post("/users/{user_id}/deactivate")
async def deactivate_user_admin(
    user_id: str,
    admin_user: UserResponse = Depends(verify_admin_access)
):
    """Deactivate user account (admin action)"""
    try:
        success = await user_service.deactivate_user(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "User account deactivated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )