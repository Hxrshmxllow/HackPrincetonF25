"""
Database Utility Functions for CRUD Operations
"""
from typing import Dict, Any, List, Optional
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError, PyMongoError
from .database import get_users_collection, get_recommendations_collection
from .models.user import UserModel
from .models.recommendation import RecommendationModel


# ============================================
# USER OPERATIONS
# ============================================

def create_user(
    name: str,
    budget_min: int,
    budget_max: int,
    make: str,
    zip_code: str,
    year_min: int,
    year_max: int,
    comfort_level: str,
    model: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new user in the database
    
    Args:
        name: User's full name
        budget_min: Minimum budget
        budget_max: Maximum budget
        make: Preferred car make
        zip_code: User's ZIP code
        year_min: Minimum car year
        year_max: Maximum car year
        comfort_level: Preferred comfort level
        model: Optional car model
        user_id: Optional user ID (auto-generated if not provided)
    
    Returns:
        Created user document
        
    Raises:
        ValueError: If validation fails
        DuplicateKeyError: If user_id already exists
    """
    try:
        user_doc = UserModel.create(
            name=name,
            budget_min=budget_min,
            budget_max=budget_max,
            make=make,
            zip_code=zip_code,
            year_min=year_min,
            year_max=year_max,
            comfort_level=comfort_level,
            model=model,
            user_id=user_id
        )
        
        collection = get_users_collection()
        collection.insert_one(user_doc)
        
        return user_doc
    
    except DuplicateKeyError:
        raise ValueError(f"User with ID {user_id} already exists")
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a user by their ID
    
    Args:
        user_id: User's UUID
        
    Returns:
        User document if found, None otherwise
    """
    try:
        collection = get_users_collection()
        return collection.find_one({"_id": user_id})
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def update_user_profile(user_id: str, profile_updates: Dict[str, Any]) -> bool:
    """
    Update a user's profile
    
    Args:
        user_id: User's UUID
        profile_updates: Dictionary of profile fields to update
        
    Returns:
        True if update successful, False if user not found
    """
    try:
        collection = get_users_collection()
        update_doc = UserModel.update_profile(user_id, profile_updates)
        
        result = collection.update_one(
            {"_id": user_id},
            update_doc
        )
        
        return result.modified_count > 0
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def add_user_search(user_id: str, filters: Dict[str, Any]) -> bool:
    """
    Add a search to user's search history
    
    Args:
        user_id: User's UUID
        filters: Search filters used
        
    Returns:
        True if successful, False if user not found
    """
    try:
        collection = get_users_collection()
        search_entry = UserModel.add_search_history(filters)
        
        result = collection.update_one(
            {"_id": user_id},
            {
                "$push": {"searchHistory": search_entry},
                "$set": {"updatedAt": search_entry["timestamp"]}
            }
        )
        
        return result.modified_count > 0
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def get_user_search_history(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get user's recent search history
    
    Args:
        user_id: User's UUID
        limit: Maximum number of searches to return
        
    Returns:
        List of search history entries
    """
    try:
        collection = get_users_collection()
        user = collection.find_one(
            {"_id": user_id},
            {"searchHistory": {"$slice": -limit}}
        )
        
        if user and "searchHistory" in user:
            return user["searchHistory"]
        return []
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def delete_user(user_id: str) -> bool:
    """
    Delete a user from the database
    
    Args:
        user_id: User's UUID
        
    Returns:
        True if deletion successful, False if user not found
    """
    try:
        collection = get_users_collection()
        result = collection.delete_one({"_id": user_id})
        return result.deleted_count > 0
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


# ============================================
# RECOMMENDATION OPERATIONS
# ============================================

def create_recommendation(
    user_id: str,
    recommendations: List[Dict[str, Any]],
    search_criteria: Dict[str, Any],
    recommendation_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new recommendation record
    
    Args:
        user_id: User's UUID
        recommendations: List of car recommendations
        search_criteria: Criteria used for recommendations
        recommendation_id: Optional recommendation ID
        
    Returns:
        Created recommendation document
        
    Raises:
        ValueError: If validation fails
    """
    try:
        # Validate recommendations
        RecommendationModel.validate_recommendations(recommendations)
        
        rec_doc = RecommendationModel.create(
            user_id=user_id,
            recommendations=recommendations,
            search_criteria=search_criteria,
            recommendation_id=recommendation_id
        )
        
        collection = get_recommendations_collection()
        collection.insert_one(rec_doc)
        
        return rec_doc
    
    except ValueError as e:
        raise ValueError(f"Validation error: {str(e)}")
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def get_recommendations_by_user(
    user_id: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Get all recommendations for a user
    
    Args:
        user_id: User's UUID
        limit: Maximum number of recommendations to return
        
    Returns:
        List of recommendation documents
    """
    try:
        collection = get_recommendations_collection()
        cursor = collection.find({"userId": user_id}).sort("createdAt", -1).limit(limit)
        return list(cursor)
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def get_recommendation_by_id(recommendation_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific recommendation by ID
    
    Args:
        recommendation_id: Recommendation UUID
        
    Returns:
        Recommendation document if found, None otherwise
    """
    try:
        collection = get_recommendations_collection()
        return collection.find_one({"_id": recommendation_id})
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def delete_recommendation(recommendation_id: str) -> bool:
    """
    Delete a recommendation
    
    Args:
        recommendation_id: Recommendation UUID
        
    Returns:
        True if deletion successful, False if not found
    """
    try:
        collection = get_recommendations_collection()
        result = collection.delete_one({"_id": recommendation_id})
        return result.deleted_count > 0
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")


def delete_user_recommendations(user_id: str) -> int:
    """
    Delete all recommendations for a user
    
    Args:
        user_id: User's UUID
        
    Returns:
        Number of recommendations deleted
    """
    try:
        collection = get_recommendations_collection()
        result = collection.delete_many({"userId": user_id})
        return result.deleted_count
    except PyMongoError as e:
        raise Exception(f"Database error: {str(e)}")
