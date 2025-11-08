"""
MongoDB Database Configuration and Connection
"""
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
import os
from typing import Optional

class MongoDB:
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None
    
    @classmethod
    def get_client(cls) -> MongoClient:
        """Get or create MongoDB client instance"""
        if cls._client is None:
            mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
            cls._client = MongoClient(mongo_uri)
        return cls._client
    
    @classmethod
    def get_database(cls) -> Database:
        """Get or create database instance"""
        if cls._db is None:
            client = cls.get_client()
            db_name = os.getenv("MONGODB_DATABASE", "carinsight")
            cls._db = client[db_name]
        return cls._db
    
    @classmethod
    def get_collection(cls, collection_name: str) -> Collection:
        """Get a specific collection from the database"""
        db = cls.get_database()
        return db[collection_name]
    
    @classmethod
    def close_connection(cls):
        """Close MongoDB connection"""
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None


# Collection names as constants
USERS_COLLECTION = "users"
RECOMMENDATIONS_COLLECTION = "recommendations"


def get_users_collection() -> Collection:
    """Get users collection"""
    return MongoDB.get_collection(USERS_COLLECTION)


def get_recommendations_collection() -> Collection:
    """Get recommendations collection"""
    return MongoDB.get_collection(RECOMMENDATIONS_COLLECTION)
