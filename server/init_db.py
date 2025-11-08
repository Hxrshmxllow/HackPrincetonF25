"""
Database Initialization Script

This script initializes the MongoDB database with proper indexes
and creates the necessary collections.

Usage:
    python init_db.py
"""
from app.database import MongoDB, USERS_COLLECTION, RECOMMENDATIONS_COLLECTION
from pymongo import IndexModel, ASCENDING, DESCENDING
import os
from dotenv import load_dotenv


def create_indexes():
    """Create indexes for better query performance"""
    
    db = MongoDB.get_database()
    
    print("Creating indexes...")
    
    # Users Collection Indexes
    users_indexes = [
        IndexModel([("profile.zipCode", ASCENDING)], name="zipcode_index"),
        IndexModel([("profile.make", ASCENDING)], name="make_index"),
        IndexModel([("profile.budgetMin", ASCENDING), ("profile.budgetMax", ASCENDING)], name="budget_range_index"),
        IndexModel([("createdAt", DESCENDING)], name="created_at_index"),
    ]
    
    users_collection = db[USERS_COLLECTION]
    users_collection.create_indexes(users_indexes)
    print(f"✓ Created {len(users_indexes)} indexes for '{USERS_COLLECTION}' collection")
    
    # Recommendations Collection Indexes
    recommendations_indexes = [
        IndexModel([("userId", ASCENDING)], name="user_id_index"),
        IndexModel([("createdAt", DESCENDING)], name="created_at_index"),
        IndexModel([("userId", ASCENDING), ("createdAt", DESCENDING)], name="user_created_compound_index"),
    ]
    
    recommendations_collection = db[RECOMMENDATIONS_COLLECTION]
    recommendations_collection.create_indexes(recommendations_indexes)
    print(f"✓ Created {len(recommendations_indexes)} indexes for '{RECOMMENDATIONS_COLLECTION}' collection")


def verify_connection():
    """Verify MongoDB connection"""
    try:
        client = MongoDB.get_client()
        # Ping the server
        client.admin.command('ping')
        print("✓ Successfully connected to MongoDB")
        return True
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        return False


def list_collections():
    """List all collections in the database"""
    db = MongoDB.get_database()
    collections = db.list_collection_names()
    print(f"\nCollections in database '{db.name}':")
    for collection in collections:
        count = db[collection].count_documents({})
        print(f"  - {collection}: {count} documents")


def main():
    """Main initialization function"""
    load_dotenv()
    
    print("=" * 60)
    print("MongoDB Database Initialization")
    print("=" * 60)
    
    # Check environment variables
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("MONGODB_DATABASE", "carinsight")
    
    print(f"\nMongoDB URI: {mongo_uri}")
    print(f"Database Name: {db_name}")
    print()
    
    # Verify connection
    if not verify_connection():
        print("\nPlease check your MongoDB connection and try again.")
        return
    
    # Create indexes
    try:
        create_indexes()
        print("\n✓ Database initialization completed successfully!")
    except Exception as e:
        print(f"\n✗ Error during initialization: {e}")
        return
    
    # List collections
    list_collections()
    
    print("\n" + "=" * 60)
    print("Database is ready to use!")
    print("=" * 60)
    
    # Close connection
    MongoDB.close_connection()


if __name__ == "__main__":
    main()
