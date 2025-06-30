from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import Response
from typing import Optional
from pydantic import BaseModel
from ..models.user import UserResponse
from ..api.auth import get_current_user
from ..services.ai_assistant_service import ai_assistant
import base64

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

@router.post("/chat")
async def voice_chat(
    chat_data: ChatMessage,
    current_user: UserResponse = Depends(get_current_user)
):
    """Process voice/text chat with Mr. Happy assistant"""
    try:
        # Process the message with AI
        response = await ai_assistant.process_chat_message(
            message=chat_data.message,
            user=current_user,
            session_id=chat_data.session_id
        )
        
        return {
            "response": response,
            "user_message": chat_data.message,
            "timestamp": "2024-01-01T00:00:00Z",
            "session_id": chat_data.session_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process voice chat: {str(e)}"
        )

@router.post("/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    language: str = Form("en"),
    current_user: UserResponse = Depends(get_current_user)
):
    """Convert speech to text using Whisper API"""
    try:
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid audio file format. Please upload an audio file."
            )
        
        # Read audio file
        audio_data = await audio_file.read()
        
        # Transcribe using AI assistant
        transcription = await ai_assistant.transcribe_audio(audio_data, language)
        
        return {
            "transcription": transcription,
            "language": language,
            "confidence": 0.95  # Placeholder confidence score
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process speech: {str(e)}"
        )

@router.post("/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    voice: str = Form("alloy"),
    current_user: UserResponse = Depends(get_current_user)
):
    """Convert text to speech using OpenAI TTS"""
    try:
        if len(text) > 4000:
            raise HTTPException(
                status_code=400,
                detail="Text is too long. Maximum 4000 characters allowed."
            )
        
        # Generate speech
        audio_data = await ai_assistant.synthesize_speech(text, voice)
        
        # Return audio as base64 for easy frontend consumption
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "audio_data": f"data:audio/mp3;base64,{audio_base64}",
            "text": text,
            "voice": voice,
            "duration_estimate": len(text) * 0.1  # Rough estimate
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate speech: {str(e)}"
        )

@router.post("/full-interaction")
async def full_voice_interaction(
    audio_file: UploadFile = File(...),
    language: str = Form("en"),
    voice: str = Form("alloy"),
    current_user: UserResponse = Depends(get_current_user)
):
    """Complete voice interaction: speech-to-text, AI processing, text-to-speech"""
    try:
        # Step 1: Transcribe audio
        audio_data = await audio_file.read()
        transcript = await ai_assistant.transcribe_audio(audio_data, language)
        
        # Step 2: Process with AI
        ai_response = await ai_assistant.process_voice_query(
            transcript=transcript,
            user=current_user
        )
        
        # Step 3: Convert response to speech
        response_audio = await ai_assistant.synthesize_speech(ai_response, voice)
        response_audio_base64 = base64.b64encode(response_audio).decode('utf-8')
        
        return {
            "transcript": transcript,
            "response_text": ai_response,
            "response_audio": f"data:audio/mp3;base64,{response_audio_base64}",
            "language": language,
            "voice": voice
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process full voice interaction: {str(e)}"
        )

@router.get("/conversation-history")
async def get_conversation_history(
    limit: int = 10,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user's conversation history with Mr. Happy"""
    try:
        history = await ai_assistant.get_conversation_history(current_user.user_id, limit)
        
        return {
            "conversations": history,
            "total": len(history)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch conversation history"
        )

@router.get("/commands")
async def get_voice_commands():
    """Get list of available voice commands"""
    return {
        "commands": [
            {
                "category": "Wallet & Balance",
                "commands": [
                    "What's my balance?",
                    "Show my wallet",
                    "How much money do I have?",
                    "Check my Happy Coins"
                ]
            },
            {
                "category": "Betting",
                "commands": [
                    "Place 5 Happy Coins on India to win",
                    "Bet 2 HC on over 300 runs",
                    "What are the odds for Australia?",
                    "Show me betting options"
                ]
            },
            {
                "category": "Cricket Information",
                "commands": [
                    "Show live matches",
                    "What matches are happening now?",
                    "Tell me about India vs Australia",
                    "Who's winning the match?"
                ]
            },
            {
                "category": "Account Management",
                "commands": [
                    "Add money to my wallet",
                    "Deposit 5000 rupees",
                    "Withdraw money",
                    "Convert INR to Happy Coins"
                ]
            },
            {
                "category": "Help & Support",
                "commands": [
                    "How do I place a bet?",
                    "What are Happy Coins?",
                    "Help me with betting",
                    "Explain the platform"
                ]
            }
        ],
        "tips": [
            "Speak clearly and naturally",
            "You can ask questions in English or Hindi",
            "Use specific team names and amounts for betting",
            "Say 'help' if you're not sure what to ask"
        ]
    }

@router.get("/settings")
async def get_voice_settings(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user's voice assistant settings"""
    # TODO: Implement user-specific voice settings storage
    return {
        "language": "en",
        "voice": "alloy",
        "speech_rate": 1.0,
        "auto_speech": True,
        "notifications": True
    }

@router.post("/settings")
async def update_voice_settings(
    settings: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update user's voice assistant settings"""
    # TODO: Implement user-specific voice settings storage
    return {
        "message": "Voice settings updated successfully",
        "settings": settings
    }