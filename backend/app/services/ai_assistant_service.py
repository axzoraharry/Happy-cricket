import openai
import base64
import tempfile
import io
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydub import AudioSegment
from ..core.config import settings
from ..core.database import get_database
from ..models.user import UserResponse
from ..services.wallet_service import wallet_service
from ..services.cricket_service import cricket_service
from fastapi import HTTPException, status
import json
import re

class CricketAIAssistant:
    """Advanced AI Assistant for Cricket Betting Platform"""
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.cricket_context = """
        You are Mr. Happy, an expert cricket assistant for the Happy Cricket betting platform.
        
        Your capabilities include:
        - Live cricket match analysis and predictions
        - Betting recommendations based on statistics and trends
        - Player performance insights and historical data
        - Match history, team comparisons, and tournament information
        - Wallet management and betting guidance
        - Happy Coin system explanation and assistance
        
        Key platform information:
        - Users bet with Happy Coins (HC): 1 HC = ₹1,000 INR
        - Minimum bet: 0.1 HC, Maximum bet: 100 HC per single bet
        - Platform supports live betting, pre-match betting, and fantasy cricket
        - Always promote responsible gambling and set betting limits
        
        Your personality:
        - Friendly, enthusiastic about cricket
        - Knowledgeable but not overly technical
        - Helpful with both cricket insights and platform navigation
        - Always encourage responsible gambling practices
        
        Response format:
        - Keep responses concise but informative (2-3 sentences max for voice)
        - Use cricket terminology appropriately
        - Include relevant statistics when available
        - Always end with a helpful suggestion or question
        """
    
    async def process_voice_query(
        self, 
        transcript: str, 
        user: Optional[UserResponse] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Process voice query and return AI response"""
        try:
            if not self.openai_client:
                return "I'm sorry, my AI capabilities are currently unavailable. Please try again later."
            
            # Get user context
            user_context = await self._get_user_context(user) if user else {}
            
            # Prepare conversation messages
            messages = [
                {"role": "system", "content": self.cricket_context},
                {"role": "user", "content": f"User context: {json.dumps(user_context)}\nUser query: {transcript}"}
            ]
            
            # Get AI response
            response = self.openai_client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            
            # Process any action commands
            await self._process_action_commands(transcript, user, ai_response)
            
            # Store conversation
            if user:
                await self._store_conversation(user.user_id, transcript, ai_response)
            
            return ai_response
            
        except Exception as e:
            print(f"AI Assistant error: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again or type your question."
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en") -> str:
        """Transcribe audio using OpenAI Whisper"""
        try:
            if not self.openai_client:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Speech recognition is currently unavailable"
                )
            
            # Convert audio to proper format for Whisper
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_data))
            audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                audio_segment.export(temp_file.name, format="wav")
                
                with open(temp_file.name, "rb") as audio_file:
                    transcript = self.openai_client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language=language if language != "auto" else None
                    )
                    
            return transcript.text
            
        except Exception as e:
            print(f"Transcription error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to transcribe audio"
            )
    
    async def synthesize_speech(self, text: str, voice: str = "alloy") -> bytes:
        """Convert text to speech using OpenAI TTS"""
        try:
            if not self.openai_client:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Text-to-speech is currently unavailable"
                )
            
            response = self.openai_client.audio.speech.create(
                model="tts-1",
                voice=voice,  # alloy, echo, fable, onyx, nova, shimmer
                input=text
            )
            
            return response.content
            
        except Exception as e:
            print(f"TTS error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to generate speech"
            )
    
    async def _get_user_context(self, user: UserResponse) -> Dict[str, Any]:
        """Get comprehensive user context for AI processing"""
        context = {
            "user_info": {
                "name": user.full_name,
                "username": user.username,
                "kyc_status": user.kyc_status
            }
        }
        
        try:
            # Get wallet information
            wallet = await wallet_service.get_wallet(user.user_id)
            if wallet:
                context["wallet"] = {
                    "happy_coin_balance": wallet.happy_coin_balance,
                    "inr_balance": wallet.inr_balance,
                    "total_bet_amount": wallet.total_bet_amount,
                    "total_winnings": wallet.total_winnings
                }
            
            # Get recent transactions
            recent_transactions = await wallet_service.get_transactions(user.user_id, skip=0, limit=5)
            context["recent_activity"] = [
                {
                    "type": t.transaction_type,
                    "amount": t.amount,
                    "currency": t.currency,
                    "description": t.description
                } for t in recent_transactions
            ]
            
            # Get live matches (simplified)
            live_matches = await cricket_service.get_betting_matches()
            context["available_matches"] = len(live_matches) if live_matches else 0
            
        except Exception as e:
            print(f"Error getting user context: {e}")
        
        return context
    
    async def _process_action_commands(
        self, 
        transcript: str, 
        user: Optional[UserResponse], 
        ai_response: str
    ):
        """Process action commands from user transcript"""
        if not user:
            return
        
        transcript_lower = transcript.lower()
        
        try:
            # Check for balance inquiry
            if any(word in transcript_lower for word in ["balance", "wallet", "money", "coins"]):
                # This is handled by getting user context, no additional action needed
                pass
            
            # Check for betting commands
            if "bet" in transcript_lower or "place" in transcript_lower:
                # Extract betting information
                betting_info = self._extract_betting_info(transcript)
                if betting_info:
                    # Log betting intent for future processing
                    await self._log_betting_intent(user.user_id, betting_info)
            
            # Check for deposit/withdrawal commands
            if any(word in transcript_lower for word in ["deposit", "add money", "withdraw"]):
                # Log financial intent
                await self._log_financial_intent(user.user_id, transcript)
                
        except Exception as e:
            print(f"Error processing action commands: {e}")
    
    def _extract_betting_info(self, transcript: str) -> Optional[Dict[str, Any]]:
        """Extract betting information from transcript"""
        try:
            # Simple regex patterns for betting extraction
            amount_patterns = [
                r"(\d+(?:\.\d+)?)\s*(?:happy\s*coins?|hc|coins?)",
                r"bet\s+(\d+(?:\.\d+)?)",
                r"(\d+(?:\.\d+)?)\s*on\s+"
            ]
            
            team_patterns = [
                r"on\s+(india|australia|england|pakistan|south\s+africa|new\s+zealand|bangladesh|sri\s+lanka|afghanistan|west\s+indies)",
                r"(india|australia|england|pakistan|south\s+africa|new\s+zealand|bangladesh|sri\s+lanka|afghanistan|west\s+indies)\s+to\s+win"
            ]
            
            amount = None
            team = None
            
            # Extract amount
            for pattern in amount_patterns:
                match = re.search(pattern, transcript, re.IGNORECASE)
                if match:
                    amount = float(match.group(1))
                    break
            
            # Extract team
            for pattern in team_patterns:
                match = re.search(pattern, transcript, re.IGNORECASE)
                if match:
                    team = match.group(1).title()
                    break
            
            if amount and team:
                return {
                    "amount": amount,
                    "team": team,
                    "bet_type": "match_winner",
                    "transcript": transcript
                }
                
        except Exception as e:
            print(f"Error extracting betting info: {e}")
        
        return None
    
    async def _store_conversation(self, user_id: str, transcript: str, response: str):
        """Store conversation in database"""
        try:
            db = await get_database()
            collection = db["ai_conversations"]
            
            conversation_doc = {
                "user_id": user_id,
                "transcript": transcript,
                "response": response,
                "timestamp": datetime.utcnow(),
                "session_id": f"voice_{user_id}_{int(datetime.utcnow().timestamp())}"
            }
            
            await collection.insert_one(conversation_doc)
            
        except Exception as e:
            print(f"Error storing conversation: {e}")
    
    async def _log_betting_intent(self, user_id: str, betting_info: Dict[str, Any]):
        """Log betting intent for analysis"""
        try:
            db = await get_database()
            collection = db["betting_intents"]
            
            intent_doc = {
                "user_id": user_id,
                "intent_type": "betting",
                "details": betting_info,
                "timestamp": datetime.utcnow(),
                "processed": False
            }
            
            await collection.insert_one(intent_doc)
            
        except Exception as e:
            print(f"Error logging betting intent: {e}")
    
    async def _log_financial_intent(self, user_id: str, transcript: str):
        """Log financial intent for analysis"""
        try:
            db = await get_database()
            collection = db["financial_intents"]
            
            intent_doc = {
                "user_id": user_id,
                "intent_type": "financial",
                "transcript": transcript,
                "timestamp": datetime.utcnow(),
                "processed": False
            }
            
            await collection.insert_one(intent_doc)
            
        except Exception as e:
            print(f"Error logging financial intent: {e}")
    
    async def get_conversation_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's conversation history"""
        try:
            db = await get_database()
            collection = db["ai_conversations"]
            
            cursor = collection.find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
            conversations = []
            
            async for conv in cursor:
                conversations.append({
                    "transcript": conv["transcript"],
                    "response": conv["response"],
                    "timestamp": conv["timestamp"]
                })
            
            return conversations
            
        except Exception as e:
            print(f"Error getting conversation history: {e}")
            return []

# Global AI assistant instance
ai_assistant = CricketAIAssistant()