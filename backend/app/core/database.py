import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import redis.asyncio as redis
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None
    redis_client: Optional[redis.Redis] = None

db = Database()

# MongoDB Connection
async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "happy_cricket")
    
    db.client = AsyncIOMotorClient(mongo_url)
    db.database = db.client[database_name]
    
    # Test connection
    try:
        await db.client.admin.command('ismaster')
        print(f"✅ Connected to MongoDB: {database_name}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("✅ MongoDB connection closed")

async def get_database():
    """Get database instance"""
    return db.database

# Redis Connection
async def connect_to_redis():
    """Create Redis connection"""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    try:
        db.redis_client = redis.from_url(redis_url, decode_responses=True)
        await db.redis_client.ping()
        print("✅ Connected to Redis")
        return db.redis_client
    except Exception as e:
        print(f"❌ Failed to connect to Redis: {e}")
        return None

async def get_redis():
    """Get Redis client instance"""
    if not db.redis_client:
        await connect_to_redis()
    return db.redis_client