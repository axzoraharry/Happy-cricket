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
import random

class CricketAIAssistant:
    """Advanced AI Assistant for Cricket Betting Platform with Enhanced Cricket Knowledge"""
    
    def __init__(self):
        # Try to initialize OpenAI client
        self.openai_client = None
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
            try:
                self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            except:
                self.openai_client = None
        
        # Enhanced cricket knowledge base
        self.cricket_knowledge = {
            "teams": {
                "india": {
                    "ranking": {"odi": 1, "t20": 2, "test": 1},
                    "captain": "Rohit Sharma",
                    "star_players": ["Virat Kohli", "Jasprit Bumrah", "KL Rahul", "Hardik Pandya"],
                    "strengths": ["Strong batting lineup", "World-class bowling attack", "Excellent fielding"],
                    "recent_form": "Excellent - won last 4 out of 5 matches",
                    "home_advantage": "Very strong at home venues"
                },
                "australia": {
                    "ranking": {"odi": 3, "t20": 4, "test": 2},
                    "captain": "Pat Cummins",
                    "star_players": ["Steve Smith", "David Warner", "Mitchell Starc", "Glenn Maxwell"],
                    "strengths": ["Aggressive batting", "Pace bowling attack", "Strong mentality"],
                    "recent_form": "Good - competitive in all formats",
                    "home_advantage": "Exceptional at home, especially in WACA and MCG"
                },
                "england": {
                    "ranking": {"odi": 4, "t20": 3, "test": 4},
                    "captain": "Jos Buttler",
                    "star_players": ["Joe Root", "Ben Stokes", "Jofra Archer", "Harry Brook"],
                    "strengths": ["Innovative batting", "All-rounders", "Spin bowling"],
                    "recent_form": "Mixed - rebuilding phase",
                    "home_advantage": "Strong in English conditions"
                },
                "pakistan": {
                    "ranking": {"odi": 5, "t20": 5, "test": 6},
                    "captain": "Babar Azam",
                    "star_players": ["Babar Azam", "Shaheen Afridi", "Mohammad Rizwan", "Shadab Khan"],
                    "strengths": ["Unpredictable", "Fast bowling", "Fighting spirit"],
                    "recent_form": "Inconsistent but dangerous",
                    "home_advantage": "Very strong in UAE and home conditions"
                }
            },
            "betting_tips": {
                "live_betting": [
                    "Watch for momentum shifts after wickets",
                    "Consider weather conditions for total runs",
                    "Monitor required run rate vs current rate",
                    "Powerplay overs are crucial for team totals"
                ],
                "pre_match": [
                    "Check recent head-to-head records",
                    "Analyze pitch conditions and weather",
                    "Consider team news and player availability",
                    "Look at historical venue statistics"
                ],
                "general": [
                    "Never bet more than you can afford to lose",
                    "Set daily/weekly betting limits",
                    "Take breaks between betting sessions",
                    "Research thoroughly before placing bets"
                ]
            },
            "cricket_facts": [
                "The fastest delivery in cricket was 161.3 km/h by Shoaib Akhtar",
                "Brian Lara holds the record for highest individual score: 400*",
                "India has never lost a Test series at home to Australia since 2004",
                "T20 cricket was invented to attract younger audiences to the sport",
                "The Ashes series between England and Australia dates back to 1882"
            ],
            "platform_features": {
                "wallet": "Manage your Happy Coins and INR balance easily",
                "live_betting": "Bet on matches as they happen with real-time odds",
                "casino": "Try cricket-themed slots and casino games",
                "statistics": "Access detailed player and team statistics",
                "predictions": "Get AI-powered match predictions and analysis"
            }
        }
        
        # Response templates for different types of queries
        self.response_templates = {
            "greeting": [
                "Hello! I'm Mr. Happy, your cricket assistant! How can I help you with cricket or betting today?",
                "Welcome to Happy Cricket! I'm here to help with match insights, betting tips, or any cricket questions!",
                "Hi there! Ready to dive into some cricket action? What would you like to know?"
            ],
            "team_info": "Let me tell you about {team}. They're currently ranked #{ranking} in {format}. {additional_info}",
            "betting_advice": "For betting on this match, consider: {tips}. Remember to bet responsibly!",
            "match_prediction": "Based on current form and statistics, {prediction}. However, cricket is unpredictable!",
            "wallet_help": "Your wallet shows {balance} Happy Coins. Need help with deposits or understanding our coin system?",
            "responsible_gambling": "Remember to bet responsibly! Set limits, take breaks, and never bet more than you can afford to lose."
        }
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

    async def process_chat_message(
        self, 
        message: str, 
        user: Optional[UserResponse] = None,
        session_id: Optional[str] = None
    ) -> str:
        """Process chat message with enhanced cricket knowledge"""
        try:
            # If OpenAI is available, use it
            if self.openai_client:
                return await self._process_with_openai(message, user, session_id)
            
            # Otherwise, use enhanced mock responses
            return await self._process_with_cricket_ai(message, user, session_id)
            
        except Exception as e:
            print(f"AI Assistant error: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again!"
    
    async def _process_with_openai(self, message: str, user: Optional[UserResponse], session_id: Optional[str]) -> str:
        """Process message using OpenAI"""
        try:
            # Get user context
            user_context = await self._get_user_context(user) if user else {}
            
            # Prepare conversation messages
            messages = [
                {"role": "system", "content": self.cricket_context},
                {"role": "user", "content": f"User context: {json.dumps(user_context)}\nUser query: {message}"}
            ]
            
            # Get AI response
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            
            # Process any action commands
            await self._process_action_commands(message, user, ai_response)
            
            # Store conversation
            if user:
                await self._store_conversation(user.user_id, message, ai_response, session_id)
            
            return ai_response
            
        except Exception as e:
            print(f"OpenAI error: {e}")
            # Fallback to cricket AI
            return await self._process_with_cricket_ai(message, user, session_id)
    
    async def _process_with_cricket_ai(self, message: str, user: Optional[UserResponse], session_id: Optional[str]) -> str:
        """Enhanced cricket AI with comprehensive responses"""
        try:
            message_lower = message.lower()
            
            # Get user context for personalized responses
            user_context = await self._get_user_context(user) if user else {}
            
            # Greeting responses
            if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good evening']):
                response = random.choice(self.response_templates["greeting"])
                if user:
                    response += f" Your wallet has {user_context.get('happy_coin_balance', 0)} Happy Coins."
                return response
            
            # Team information queries
            for team_name, team_info in self.cricket_knowledge["teams"].items():
                if team_name in message_lower:
                    format_type = "odi" if "odi" in message_lower else "t20" if "t20" in message_lower else "test"
                    ranking = team_info["ranking"].get(format_type, "N/A")
                    
                    response = f"🏏 {team_name.title()} is currently ranked #{ranking} in {format_type.upper()}. "
                    response += f"Captain: {team_info['captain']}. "
                    response += f"Key players: {', '.join(team_info['star_players'][:2])}. "
                    response += f"Recent form: {team_info['recent_form']}. "
                    
                    if "bet" in message_lower or "odds" in message_lower:
                        response += "Would you like betting tips for their upcoming matches?"
                    
                    return response
            
            # Live match queries
            if any(word in message_lower for word in ['live', 'current', 'happening', 'now']):
                try:
                    live_matches = await cricket_service.get_live_matches()
                    if live_matches.get('status') == 'ok' and live_matches.get('response', {}).get('items'):
                        matches = live_matches['response']['items']
                        response = f"📺 Currently {len(matches)} live matches: "
                        for match in matches[:2]:
                            team_a = match.get('teama', {}).get('name', 'Team A')
                            team_b = match.get('teamb', {}).get('name', 'Team B')
                            response += f"{team_a} vs {team_b}, "
                        response += "Want live betting tips for any of these?"
                        return response
                    else:
                        return "🏏 No live matches currently. Check out our upcoming matches for pre-match betting!"
                except:
                    return "🏏 I'm checking live matches for you. Meanwhile, would you like to know about upcoming games?"
            
            # Betting advice queries
            if any(word in message_lower for word in ['bet', 'betting', 'odds', 'tip', 'advice', 'predict']):
                tips = random.sample(self.cricket_knowledge["betting_tips"]["general"], 2)
                response = "🎯 Here are some betting tips: "
                response += f"{tips[0]} Also, {tips[1]} "
                
                if "live" in message_lower:
                    live_tips = random.choice(self.cricket_knowledge["betting_tips"]["live_betting"])
                    response += f"For live betting: {live_tips}"
                
                return response
            
            # Wallet queries
            if any(word in message_lower for word in ['wallet', 'balance', 'money', 'coin', 'deposit']):
                balance = user_context.get('happy_coin_balance', 0)
                response = f"💰 Your wallet: {balance} Happy Coins (₹{balance * 1000:,}). "
                
                if balance < 1:
                    response += "Low balance! You can deposit via Stripe or Razorpay. Minimum deposit is ₹100."
                else:
                    response += "Good balance for betting! Remember to bet responsibly."
                
                return response
            
            # Statistics queries
            if any(word in message_lower for word in ['stats', 'statistics', 'record', 'performance']):
                fact = random.choice(self.cricket_knowledge["cricket_facts"])
                return f"📊 Here's an interesting cricket stat: {fact} Want specific team or player statistics?"
            
            # Platform features
            if any(word in message_lower for word in ['help', 'feature', 'how', 'what can']):
                features = list(self.cricket_knowledge["platform_features"].items())
                feature_name, feature_desc = random.choice(features)
                response = f"🚀 Platform Feature: {feature_desc} "
                response += "You can also ask me about live matches, betting tips, team info, or your wallet!"
                return response
            
            # Match predictions
            if any(word in message_lower for word in ['predict', 'who will win', 'winner', 'forecast']):
                predictions = [
                    "Based on recent form, it's going to be a close match!",
                    "The team batting first usually has an advantage on this pitch.",
                    "Weather conditions might favor the bowling side today.",
                    "Both teams are evenly matched - it could go either way!"
                ]
                response = f"🔮 {random.choice(predictions)} "
                response += "Remember, cricket is unpredictable - that's what makes it exciting!"
                return response
            
            # Casino/gaming queries
            if any(word in message_lower for word in ['casino', 'slot', 'game', 'dice', 'roulette']):
                response = "🎰 Our casino has cricket-themed games! Try Cricket Thunder Slots, Cricket Dice Roll, or Cricket Roulette. "
                response += "All games use Happy Coins. Want me to show you the games list?"
                return response
            
            # Default intelligent response
            responses = [
                "🏏 I'm Mr. Happy, your cricket assistant! I can help with live matches, betting tips, team stats, wallet info, and more. What interests you?",
                "🎯 Ask me about current cricket matches, betting advice, team information, or your Happy Cricket wallet!",
                "📊 I have lots of cricket knowledge! Try asking about live matches, player stats, betting tips, or platform features.",
                "🚀 I'm here to help with all things cricket and betting! What would you like to know about?"
            ]
            
            response = random.choice(responses)
            
            # Add personalized touch if user is logged in
            if user:
                balance = user_context.get('happy_coin_balance', 0)
                if balance > 0:
                    response += f" Your balance: {balance} HC."
            
            return response
            
        except Exception as e:
            print(f"Cricket AI error: {e}")
            return "I'm here to help with cricket and betting! Ask me about live matches, betting tips, team info, or your wallet."
    
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