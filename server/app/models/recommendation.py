"""
Recommendation Model and Schema for MongoDB
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid


class RecommendationModel:
    """
    Car Recommendation Model
    
    Schema:
    {
        "_id": "uuid-string",
        "userId": "user-uuid-string",
        "recommendations": [
            {
                "make": "Toyota",
                "model": "Camry",
                "year": 2021,
                "price": 23999,
                "reason": "Excellent reliability and fuel efficiency within your budget"
            }
        ],
        "searchCriteria": {
            "budget": 50000,
            "carType": "sedan",
            "location": "08544",
            "primaryUse": "Daily commuting"
        },
        "createdAt": "2024-01-01T12:00:00Z"
    }
    """
    
    @staticmethod
    def create(
        user_id: str,
        recommendations: List[Dict[str, Any]],
        search_criteria: Dict[str, Any],
        recommendation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new recommendation document
        
        Args:
            user_id: UUID of the user requesting recommendations
            recommendations: List of car recommendations with make, model, year, price
            search_criteria: The criteria used to generate recommendations
            recommendation_id: UUID for the recommendation (auto-generated if not provided)
            
        Returns:
            Recommendation document dictionary
        """
        return {
            "_id": recommendation_id or str(uuid.uuid4()),
            "userId": user_id,
            "recommendations": recommendations,
            "searchCriteria": search_criteria,
            "createdAt": datetime.utcnow()
        }
    
    @staticmethod
    def validate_recommendation(recommendation: Dict[str, Any]) -> bool:
        """
        Validate a single recommendation entry
        
        Args:
            recommendation: Recommendation data to validate
            
        Returns:
            True if valid, raises ValueError if invalid
        """
        required_fields = ["make", "model", "year", "price"]
        
        for field in required_fields:
            if field not in recommendation:
                raise ValueError(f"Missing required field in recommendation: {field}")
        
        # Validate year is reasonable
        if not (1990 <= recommendation["year"] <= 2026):
            raise ValueError(f"Invalid year: {recommendation['year']}")
        
        # Validate price is positive
        if recommendation["price"] < 0:
            raise ValueError("Price cannot be negative")
        
        return True
    
    @staticmethod
    def validate_recommendations(recommendations: List[Dict[str, Any]]) -> bool:
        """
        Validate list of recommendations
        
        Args:
            recommendations: List of recommendations to validate
            
        Returns:
            True if all valid, raises ValueError if any invalid
        """
        if not recommendations:
            raise ValueError("Recommendations list cannot be empty")
        
        for rec in recommendations:
            RecommendationModel.validate_recommendation(rec)
        
        return True
    
    @staticmethod
    def format_recommendation(
        make: str,
        model: str,
        year: int,
        price: float,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Format a single recommendation entry
        
        Args:
            make: Car make
            model: Car model
            year: Car year
            price: Estimated price
            reason: Optional reason/explanation for recommendation
            
        Returns:
            Formatted recommendation dictionary
        """
        rec = {
            "make": make,
            "model": model,
            "year": year,
            "price": price
        }
        
        if reason:
            rec["reason"] = reason
        
        return rec
