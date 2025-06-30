from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.wallet import router as wallet_router
from app.api.cricket import router as cricket_router
from app.api.betting import router as betting_router
from app.api.admin import router as admin_router
from app.api.voice import router as voice_router
from app.api.payments import router as payments_router

# Import database connection
from app.core.database import connect_to_mongo, close_mongo_connection

# Create FastAPI app
app = FastAPI(
    title="Happy Cricket API",
    description="Complete Cricket Betting & Gaming Platform with Voice Assistant",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include API routers with /api prefix
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(wallet_router, prefix="/api/wallet", tags=["Wallet"])
app.include_router(cricket_router, prefix="/api/cricket", tags=["Cricket Data"])
app.include_router(betting_router, prefix="/api/betting", tags=["Betting"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(voice_router, prefix="/api/voice", tags=["Voice Assistant"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": os.getenv("APP_NAME", "Happy Cricket"),
        "version": os.getenv("APP_VERSION", "1.0.0")
    }

# Root endpoint
@app.get("/api/")
async def root():
    return {
        "message": "🏏 Welcome to Happy Cricket Platform API! 🎯",
        "docs": "/api/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True if os.getenv("DEBUG") == "True" else False
    )