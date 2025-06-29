import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Configuration
    APP_NAME: str = os.getenv("APP_NAME", "Happy Cricket")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database Configuration
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "happy_cricket")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # JWT Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "happy_cricket_super_secret_key_2024")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # EntitySport Cricket API
    ENTITYSPORT_ACCESS_KEY: str = os.getenv("ENTITYSPORT_ACCESS_KEY", "")
    ENTITYSPORT_SECRET_KEY: str = os.getenv("ENTITYSPORT_SECRET_KEY", "")
    ENTITYSPORT_TOKEN: str = os.getenv("ENTITYSPORT_TOKEN", "")
    ENTITYSPORT_BASE_URL: str = os.getenv("ENTITYSPORT_BASE_URL", "https://rest.entitysport.com/v2/")
    
    # Happy Coin Configuration
    HAPPY_COIN_CONVERSION_RATE: int = int(os.getenv("HAPPY_COIN_CONVERSION_RATE", "1000"))
    
    # Stripe Configuration
    STRIPE_PUBLISHABLE_KEY: Optional[str] = os.getenv("STRIPE_PUBLISHABLE_KEY")
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    class Config:
        env_file = ".env"

# Global settings instance
settings = Settings()