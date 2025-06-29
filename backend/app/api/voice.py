from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Optional
from ..models.user import UserResponse
from ..api.auth import get_current_user
import base64

router = APIRouter()

@router.post("/chat")
async def voice_chat(
    message: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Process voice/text chat with Mr. Happy assistant"""
    try:
        # TODO: Integrate with OpenAI/LLM for voice processing
        # For now, return mock response
        
        # Parse common commands
        message_lower = message.lower()
        
        if "balance" in message_lower:
            from ..services.wallet_service import wallet_service
            wallet = await wallet_service.get_wallet(current_user.user_id)
            
            response = f"Your current balance is {wallet.happy_coin_balance} Happy Coins and ₹{wallet.inr_balance} INR."
            
        elif "bet" in message_lower and "place" in message_lower:
            response = "I can help you place a bet! Please specify the match, bet type, and amount. For example, 'Place 2 Happy Coins on India to win against Australia.'"
            
        elif "matches" in message_lower or "live" in message_lower:
            response = "Let me check the live matches for you. You can also ask me about specific matches or upcoming games."
            
        elif "deposit" in message_lower or "add money" in message_lower:
            response = "I can help you add money to your wallet. What amount would you like to deposit?"
            
        elif "withdraw" in message_lower:
            response = "I can help you withdraw money from your wallet. Please specify the amount you'd like to withdraw."
            
        else:
            response = f"Hello {current_user.full_name}! I'm Mr. Happy, your cricket betting assistant. I can help you with:\n- Check your wallet balance\n- Place bets on matches\n- Get live match updates\n- Deposit/withdraw money\n- Answer cricket-related questions\n\nWhat would you like to do today?"
        
        return {
            "response": response,
            "user_message": message,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process voice chat: {str(e)}"
        )

@router.post("/speech-to-text")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """Convert speech to text using Whisper API"""
    try:
        # TODO: Integrate with OpenAI Whisper
        # For now, return mock response
        
        if not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid audio file format"
            )
        
        # Mock transcription
        transcription = "Hello Mr. Happy, what's my balance?"
        
        return {
            "transcription": transcription,
            "confidence": 0.95
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process speech: {str(e)}"
        )

@router.post("/text-to-speech")
async def text_to_speech(
    text: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Convert text to speech using TTS API"""
    try:
        # TODO: Integrate with TTS service (ElevenLabs, OpenAI, etc.)
        # For now, return mock response
        
        # Mock audio generation
        mock_audio_base64 = "data:audio/mp3;base64,SGVsbG8gV29ybGQ="  # "Hello World" in base64
        
        return {
            "audio_url": mock_audio_base64,
            "text": text,
            "duration": 3.5
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate speech: {str(e)}"
        )

@router.get("/commands")
async def get_voice_commands():
    """Get list of available voice commands"""
    return {
        "commands": [
            {
                "command": "Check balance",
                "examples": ["What's my balance?", "Show my wallet", "How much money do I have?"]
            },
            {
                "command": "Place bet",
                "examples": ["Place 5 Happy Coins on India to win", "Bet 2 HC on over 300 runs"]
            },
            {
                "command": "Live matches",
                "examples": ["Show live matches", "What matches are happening now?"]
            },
            {
                "command": "Deposit money",
                "examples": ["Add 5000 rupees to my wallet", "Deposit money"]
            },
            {
                "command": "Withdraw money",
                "examples": ["Withdraw 2000 rupees", "Take out money"]
            },
            {
                "command": "Match information",
                "examples": ["Tell me about India vs Australia", "Match details"]
            }
        ]
    }