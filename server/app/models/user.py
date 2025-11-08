"""
User Model and Schema for MongoDB
"""
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


class UserModel:
    """
    User Profile Model
    
    Schema:
    {
        "_id": "uuid-string",
        "name": "John Doe",
        "profile": {
            "budgetMin": 10000,
            "budgetMax": 50000,
            "make": "Toyota",
            "model": "Camry",  # Optional
            "zipCode": "08544",
            "yearMin": 2018,
            "yearMax": 2024,
            "comfortLevel": "sedan"
        },
        "searchHistory": [
            {
                "timestamp": "2024-01-01T12:00:00Z",
                "filters": {
                    "make": "Honda",
                    "model": "Civic",
                    "year": 2022,
                    "maxPrice": 25000
                }
            }
        ],
        "createdAt": "2024-01-01T12:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z"
    }
    """
    
    @staticmethod
    def create(
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
        Create a new user document
        
        Args:
            name: User's full name
            budget_min: Minimum budget in USD
            budget_max: Maximum budget in USD
            make: Preferred car make
            zip_code: User's ZIP code
            year_min: Minimum car year
            year_max: Maximum car year
            comfort_level: Type of car (sports, luxury, suv, sedan, etc.)
            model: Preferred car model (optional)
            user_id: UUID for the user (auto-generated if not provided)
            
        Returns:
            User document dictionary
        """
        now = datetime.utcnow()
        
        return {
            "_id": user_id or str(uuid.uuid4()),
            "name": name,
            "profile": {
                "budgetMin": budget_min,
                "budgetMax": budget_max,
                "make": make,
                "model": model,
                "zipCode": zip_code,
                "yearMin": year_min,
                "yearMax": year_max,
                "comfortLevel": comfort_level
            },
            "searchHistory": [],
            "createdAt": now,
            "updatedAt": now
        }
    
    @staticmethod
    def update_profile(
        user_id: str,
        profile_updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create update document for user profile
        
        Args:
            user_id: User's UUID
            profile_updates: Dictionary of profile fields to update
            
        Returns:
            MongoDB update document
        """
        update_doc = {
            "$set": {
                "updatedAt": datetime.utcnow()
            }
        }
        
        for key, value in profile_updates.items():
            update_doc["$set"][f"profile.{key}"] = value
        
        return update_doc
    
    @staticmethod
    def add_search_history(
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create search history entry
        
        Args:
            filters: Search filters used
            
        Returns:
            Search history entry
        """
        return {
            "timestamp": datetime.utcnow(),
            "filters": filters
        }
    
    @staticmethod
    def validate_profile(profile_data: Dict[str, Any]) -> bool:
        """
        Validate user profile data
        
        Args:
            profile_data: Profile data to validate
            
        Returns:
            True if valid, raises ValueError if invalid
        """
        required_fields = ["name", "budgetMin", "budgetMax", "make", "zipCode", "yearMin", "yearMax", "comfortLevel"]
        
        for field in required_fields:
            if field not in profile_data and field not in profile_data.get("profile", {}):
                raise ValueError(f"Missing required field: {field}")
        
        # Validate budget range
        if "budgetMin" in profile_data:
            if profile_data["budgetMin"] > profile_data["budgetMax"]:
                raise ValueError("budgetMin cannot be greater than budgetMax")
        
        # Validate year range
        if "yearMin" in profile_data:
            if profile_data["yearMin"] > profile_data["yearMax"]:
                raise ValueError("yearMin cannot be greater than yearMax")
        
        return True
