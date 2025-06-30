from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
from ..models.user import UserResponse
from ..api.auth import get_current_user
from ..services.payment_service import payment_service
from ..models.wallet import DepositRequest
import json

router = APIRouter()

@router.post("/stripe/create-payment-intent")
async def create_stripe_payment_intent(
    deposit_data: DepositRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create Stripe payment intent for deposit"""
    try:
        payment_intent = await payment_service.create_stripe_payment_intent(
            amount=deposit_data.amount,
            currency=deposit_data.currency.upper(),
            user_id=current_user.user_id
        )
        
        return {
            "success": True,
            "payment_intent": payment_intent
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/razorpay/create-order")
async def create_razorpay_order(
    deposit_data: DepositRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create Razorpay order for deposit"""
    try:
        order = await payment_service.create_razorpay_order(
            amount=deposit_data.amount,
            currency=deposit_data.currency.upper(),
            user_id=current_user.user_id
        )
        
        return {
            "success": True,
            "order": order
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        signature = request.headers.get('stripe-signature')
        
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing stripe signature"
            )
        
        result = await payment_service.verify_stripe_webhook(payload, signature)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/razorpay/verify")
async def verify_razorpay_payment(
    payment_data: Dict[str, str],
    current_user: UserResponse = Depends(get_current_user)
):
    """Verify Razorpay payment"""
    try:
        required_fields = ['payment_id', 'order_id', 'signature']
        for field in required_fields:
            if field not in payment_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        result = await payment_service.verify_razorpay_payment(
            payment_id=payment_data['payment_id'],
            order_id=payment_data['order_id'],
            signature=payment_data['signature']
        )
        
        return {
            "success": True,
            "verification": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/methods")
async def get_payment_methods(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get available payment methods for user"""
    try:
        methods = await payment_service.get_payment_methods(current_user.user_id)
        return {
            "success": True,
            "payment_methods": methods
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payment methods"
        )

@router.post("/refund")
async def create_refund(
    refund_data: Dict[str, Any],
    current_user: UserResponse = Depends(get_current_user)
):
    """Create refund for a payment (admin only)"""
    try:
        # TODO: Add admin role check
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        required_fields = ['payment_provider', 'payment_id', 'amount']
        for field in required_fields:
            if field not in refund_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        refund = await payment_service.create_refund(
            payment_provider=refund_data['payment_provider'],
            payment_id=refund_data['payment_id'],
            amount=float(refund_data['amount']),
            reason=refund_data.get('reason', 'requested_by_customer')
        )
        
        return {
            "success": True,
            "refund": refund
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/analytics")
async def get_payment_analytics(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get payment analytics (admin only)"""
    try:
        # TODO: Add admin role check
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # TODO: Implement payment analytics
        analytics = {
            "total_transactions": 0,
            "total_volume": 0,
            "success_rate": 0,
            "top_payment_methods": [],
            "daily_volume": [],
            "currency_breakdown": {}
        }
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payment analytics"
        )