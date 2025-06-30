import stripe
import razorpay
import hashlib
import hmac
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from ..core.config import settings
from ..core.database import get_database
from ..models.wallet import TransactionCreate, TransactionType, TransactionStatus
from ..services.wallet_service import wallet_service
from fastapi import HTTPException, status
import uuid

class PaymentService:
    """Enhanced payment service supporting Stripe and Razorpay"""
    
    def __init__(self):
        # Stripe configuration
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.stripe_webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        
        # Razorpay configuration
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
            self.razorpay_client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
        else:
            self.razorpay_client = None
    
    async def create_stripe_payment_intent(
        self, 
        amount: float, 
        currency: str, 
        user_id: str,
        payment_method_types: list = None
    ) -> Dict[str, Any]:
        """Create Stripe payment intent"""
        try:
            if payment_method_types is None:
                payment_method_types = ['card', 'google_pay', 'apple_pay']
            
            # Convert amount to smallest currency unit (cents for USD, paise for INR)
            amount_cents = int(amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                payment_method_types=payment_method_types,
                metadata={
                    'user_id': user_id,
                    'platform': 'happy_cricket',
                    'purpose': 'wallet_deposit'
                },
                automatic_payment_methods={
                    'enabled': True,
                    'allow_redirects': 'never'
                }
            )
            
            # Store payment intent in database
            await self._store_payment_intent(payment_intent, user_id, amount, currency)
            
            return {
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id,
                'amount': amount,
                'currency': currency,
                'status': payment_intent.status
            }
            
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe payment creation failed: {str(e)}"
            )
    
    async def create_razorpay_order(
        self, 
        amount: float, 
        currency: str, 
        user_id: str
    ) -> Dict[str, Any]:
        """Create Razorpay order"""
        try:
            if not self.razorpay_client:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Razorpay is not configured"
                )
            
            # Convert amount to smallest currency unit
            amount_paise = int(amount * 100)
            
            order_data = {
                'amount': amount_paise,
                'currency': currency.upper(),
                'receipt': f"rcpt_{user_id}_{int(datetime.utcnow().timestamp())}",
                'payment_capture': 1,  # Auto capture
                'notes': {
                    'user_id': user_id,
                    'platform': 'happy_cricket',
                    'purpose': 'wallet_deposit'
                }
            }
            
            order = self.razorpay_client.order.create(data=order_data)
            
            # Store order in database
            await self._store_razorpay_order(order, user_id, amount, currency)
            
            return {
                'order_id': order['id'],
                'amount': amount,
                'currency': currency,
                'key_id': settings.RAZORPAY_KEY_ID,
                'status': order['status']
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Razorpay order creation failed: {str(e)}"
            )
    
    async def get_payment_methods(self, user_id: str) -> Dict[str, Any]:
        """Get available payment methods for user"""
        try:
            # Available payment options
            payment_options = {
                'stripe': {
                    'available': bool(settings.STRIPE_SECRET_KEY),
                    'methods': ['card', 'google_pay', 'apple_pay'],
                    'saved_methods': []
                },
                'razorpay': {
                    'available': bool(self.razorpay_client),
                    'methods': ['card', 'netbanking', 'upi', 'wallet', 'emi']
                }
            }
            
            return payment_options
            
        except Exception as e:
            return {
                'stripe': {'available': False, 'methods': [], 'saved_methods': []},
                'razorpay': {'available': False, 'methods': []}
            }
    
    async def _store_payment_intent(
        self, 
        payment_intent: Dict[str, Any], 
        user_id: str, 
        amount: float, 
        currency: str
    ):
        """Store Stripe payment intent in database"""
        db = await get_database()
        collection = db["payment_intents"]
        
        payment_doc = {
            'payment_intent_id': payment_intent['id'],
            'user_id': user_id,
            'amount': amount,
            'currency': currency,
            'status': payment_intent['status'],
            'provider': 'stripe',
            'created_at': datetime.utcnow(),
            'metadata': payment_intent.get('metadata', {})
        }
        
        await collection.insert_one(payment_doc)
    
    async def _store_razorpay_order(
        self, 
        order: Dict[str, Any], 
        user_id: str, 
        amount: float, 
        currency: str
    ):
        """Store Razorpay order in database"""
        db = await get_database()
        collection = db["payment_orders"]
        
        order_doc = {
            'order_id': order['id'],
            'user_id': user_id,
            'amount': amount,
            'currency': currency,
            'status': order['status'],
            'provider': 'razorpay',
            'created_at': datetime.utcnow(),
            'notes': order.get('notes', {})
        }
        
        await collection.insert_one(order_doc)

# Global payment service instance
payment_service = PaymentService()