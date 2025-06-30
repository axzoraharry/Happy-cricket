<file>
      <absolute_file_name>/app/backend/app/services/payment_service.py</absolute_file_name>
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
    
    async def verify_stripe_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """Verify and process Stripe webhook"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.stripe_webhook_secret
            )
            
            if event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                await self._process_successful_stripe_payment(payment_intent)
            
            elif event['type'] == 'payment_intent.payment_failed':
                payment_intent = event['data']['object']
                await self._process_failed_stripe_payment(payment_intent)
            
            return {'status': 'success', 'event_type': event['type']}
            
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payload"
            )
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )
    
    async def verify_razorpay_payment(
        self, 
        payment_id: str, 
        order_id: str, 
        signature: str
    ) -> Dict[str, Any]:
        """Verify Razorpay payment signature"""
        try:
            if not self.razorpay_client:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Razorpay is not configured"
                )
            
            # Verify signature
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            
            self.razorpay_client.utility.verify_payment_signature(params_dict)
            
            # Get payment details
            payment = self.razorpay_client.payment.fetch(payment_id)
            
            if payment['status'] == 'captured':
                await self._process_successful_razorpay_payment(payment)
                return {'status': 'success', 'payment': payment}
            else:
                return {'status': 'pending', 'payment': payment}
                
        except razorpay.errors.SignatureVerificationError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment verification failed: {str(e)}"
            )
    
    async def create_refund(
        self, 
        payment_provider: str,
        payment_id: str, 
        amount: float,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """Create refund for a payment"""
        try:
            if payment_provider == "stripe":
                refund = stripe.Refund.create(
                    payment_intent=payment_id,
                    amount=int(amount * 100),
                    reason=reason,
                    metadata={'platform': 'happy_cricket'}
                )
                return {
                    'refund_id': refund.id,
                    'status': refund.status,
                    'amount': refund.amount / 100
                }
            
            elif payment_provider == "razorpay":
                if not self.razorpay_client:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Razorpay is not configured"
                    )
                
                refund = self.razorpay_client.payment.refund(
                    payment_id,
                    {
                        'amount': int(amount * 100),
                        'speed': 'normal',
                        'notes': {
                            'reason': reason,
                            'platform': 'happy_cricket'
                        }
                    }
                )
                
                return {
                    'refund_id': refund['id'],
                    'status': refund['status'],
                    'amount': refund['amount'] / 100
                }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Refund creation failed: {str(e)}"
            )
    
    async def get_payment_methods(self, user_id: str) -> Dict[str, Any]:
        """Get available payment methods for user"""
        try:
            # Get user's saved payment methods from Stripe
            stripe_methods = []
            if settings.STRIPE_SECRET_KEY:
                try:
                    customer_methods = stripe.PaymentMethod.list(
                        customer=f"cust_{user_id}",
                        type="card"
                    )
                    stripe_methods = [
                        {
                            'id': pm.id,
                            'type': pm.type,
                            'brand': pm.card.brand if pm.card else None,
                            'last4': pm.card.last4 if pm.card else None
                        }
                        for pm in customer_methods.data
                    ]
                except:
                    stripe_methods = []
            
            # Available payment options
            payment_options = {
                'stripe': {
                    'available': bool(settings.STRIPE_SECRET_KEY),
                    'methods': ['card', 'google_pay', 'apple_pay'],
                    'saved_methods': stripe_methods
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
    
    async def _process_successful_stripe_payment(self, payment_intent: Dict[str, Any]):
        """Process successful Stripe payment"""
        user_id = payment_intent['metadata'].get('user_id')
        amount = payment_intent['amount'] / 100  # Convert from cents
        
        if user_id:
            # Create deposit transaction
            transaction_data = TransactionCreate(
                user_id=user_id,
                transaction_type=TransactionType.DEPOSIT,
                amount=amount,
                currency="INR" if payment_intent['currency'] == 'inr' else "USD",
                description=f"Deposit via Stripe - {payment_intent['id']}",
                payment_method="stripe",
                external_transaction_id=payment_intent['id']
            )
            
            await wallet_service.create_transaction(transaction_data)
            await wallet_service.update_balance(
                user_id, amount, 
                "INR" if payment_intent['currency'] == 'inr' else "USD",
                TransactionType.DEPOSIT
            )
            
            # Update payment intent status
            db = await get_database()
            collection = db["payment_intents"]
            await collection.update_one(
                {'payment_intent_id': payment_intent['id']},
                {'$set': {'status': 'succeeded', 'processed_at': datetime.utcnow()}}
            )
    
    async def _process_failed_stripe_payment(self, payment_intent: Dict[str, Any]):
        """Process failed Stripe payment"""
        # Update payment intent status
        db = await get_database()
        collection = db["payment_intents"]
        await collection.update_one(
            {'payment_intent_id': payment_intent['id']},
            {'$set': {'status': 'failed', 'processed_at': datetime.utcnow()}}
        )
    
    async def _process_successful_razorpay_payment(self, payment: Dict[str, Any]):
        """Process successful Razorpay payment"""
        user_id = payment['notes'].get('user_id')
        amount = payment['amount'] / 100  # Convert from paise
        
        if user_id:
            # Create deposit transaction
            transaction_data = TransactionCreate(
                user_id=user_id,
                transaction_type=TransactionType.DEPOSIT,
                amount=amount,
                currency=payment['currency'],
                description=f"Deposit via Razorpay - {payment['id']}",
                payment_method="razorpay",
                external_transaction_id=payment['id']
            )
            
            await wallet_service.create_transaction(transaction_data)
            await wallet_service.update_balance(
                user_id, amount, payment['currency'], TransactionType.DEPOSIT
            )
            
            # Update order status
            db = await get_database()
            collection = db["payment_orders"]
            await collection.update_one(
                {'order_id': payment['order_id']},
                {'$set': {'status': 'paid', 'processed_at': datetime.utcnow()}}
            )

# Global payment service instance
payment_service = PaymentService()
</content>
    </file>