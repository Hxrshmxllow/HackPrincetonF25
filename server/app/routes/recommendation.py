from flask import Blueprint, jsonify, request
import requests
import os
from openai import OpenAI
from app.db_utils import (
    create_recommendation,
    get_recommendations_by_user,
    get_recommendation_by_id,
    get_user_by_id
)
import json

recommendations_bp = Blueprint("recommendations", __name__)

@recommendations_bp.route("/generate", methods=["POST"])
def generate_car_recommendations():
    """
    Generate AI car recommendations for a user
    
    Expected JSON body:
    {
        "userId": "user-uuid",
        "budget": 50000,  # Optional, uses user profile if not provided
        "carType": "sedan",  # Optional, uses user profile if not provided
        "location": "08544",  # Optional, uses user profile if not provided
        "primaryUse": "Daily commuting"
    }
    """
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return jsonify({"error": "Missing OpenAI API key"}), 500

    try:
        data = request.get_json()
        user_id = data.get("userId")
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
        
        # Get user profile
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Use request data or fall back to user profile
        budget = data.get("budget", user["profile"].get("budgetMax"))
        car_type = data.get("carType", user["profile"].get("comfortLevel"))
        location = data.get("location", user["profile"].get("zipCode"))
        primary_use = data.get("primaryUse", "Daily commuting and personal use")
        
        # Store search criteria
        search_criteria = {
            "budget": budget,
            "carType": car_type,
            "location": location,
            "primaryUse": primary_use
        }

        client = OpenAI(api_key=key)

        # Construct a prompt for OpenAI
        prompt = f"""
        You are an expert car consultant. Suggest 5 cars (make, model, and year) that best fit
        the following buyer preferences:

        - Max budget: ${budget}
        - Car type: {car_type}
        - Location: {location}
        - Primary use: {primary_use}

        Each recommendation should include:
        1. make - Car manufacturer
        2. model - Car model name
        3. year - Model year (within budget range)
        4. price - Estimated price based on current market trends
        5. reason - Brief explanation why this car is recommended (1 sentence)

        Respond ONLY with a valid JSON array of objects with these exact keys:
        ["make", "model", "year", "price", "reason"]
        
        Example format:
        [
          {{"make": "Toyota", "model": "Camry", "year": 2021, "price": 23999, "reason": "Excellent reliability and fuel efficiency"}},
          ...
        ]
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful car buying assistant. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        raw = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        # Parse the response
        try:
            recommendations = json.loads(raw)
        except json.JSONDecodeError as e:
            return jsonify({
                "error": "Failed to parse AI response",
                "raw_response": raw
            }), 500
        
        # Save recommendations to database
        rec_doc = create_recommendation(
            user_id=user_id,
            recommendations=recommendations,
            search_criteria=search_criteria
        )
        
        # Convert datetime to string
        rec_doc["createdAt"] = rec_doc["createdAt"].isoformat()

        return jsonify({
            "success": True,
            "recommendation": rec_doc
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@recommendations_bp.route("/user/<user_id>", methods=["GET"])
def get_user_recommendations(user_id):
    """
    Get all recommendations for a user
    
    Query parameters:
    - limit: Number of recommendations to return (default: 10)
    """
    try:
        limit = request.args.get("limit", 10, type=int)
        
        recommendations = get_recommendations_by_user(user_id, limit)
        
        # Convert datetime objects to strings
        for rec in recommendations:
            rec["createdAt"] = rec["createdAt"].isoformat()
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations)
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@recommendations_bp.route("/<recommendation_id>", methods=["GET"])
def get_recommendation(recommendation_id):
    """
    Get a specific recommendation by ID
    """
    try:
        recommendation = get_recommendation_by_id(recommendation_id)
        
        if not recommendation:
            return jsonify({"error": "Recommendation not found"}), 404
        
        # Convert datetime to string
        recommendation["createdAt"] = recommendation["createdAt"].isoformat()
        
        return jsonify({
            "success": True,
            "recommendation": recommendation
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

