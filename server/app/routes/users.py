"""
User API Routes
"""
from flask import Blueprint, jsonify, request
from app.db_utils import (
    create_user,
    get_user_by_id,
    update_user_profile,
    add_user_search,
    get_user_search_history,
    delete_user
)

users_bp = Blueprint("users", __name__)


@users_bp.route("/", methods=["POST"])
def create_user_profile():
    """
    Create a new user profile
    
    Expected JSON body:
    {
        "userId": "optional-uuid",  # Optional, auto-generated if not provided
        "name": "John Doe",
        "budgetMin": 10000,
        "budgetMax": 50000,
        "make": "Toyota",
        "model": "Camry",  # Optional
        "zipCode": "08544",
        "yearMin": 2018,
        "yearMax": 2024,
        "comfortLevel": "sedan"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["name", "budgetMin", "budgetMax", "make", "zipCode", "yearMin", "yearMax", "comfortLevel"]
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Create user
        user = create_user(
            name=data["name"],
            budget_min=int(data["budgetMin"]),
            budget_max=int(data["budgetMax"]),
            make=data["make"],
            zip_code=data["zipCode"],
            year_min=int(data["yearMin"]),
            year_max=int(data["yearMax"]),
            comfort_level=data["comfortLevel"],
            model=data.get("model"),
            user_id=data.get("userId")
        )
        
        # Convert datetime objects to strings for JSON serialization
        user["createdAt"] = user["createdAt"].isoformat()
        user["updatedAt"] = user["updatedAt"].isoformat()
        
        return jsonify({
            "success": True,
            "user": user
        }), 201
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@users_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    """
    Get user profile by ID
    """
    try:
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Convert datetime objects to strings
        user["createdAt"] = user["createdAt"].isoformat()
        user["updatedAt"] = user["updatedAt"].isoformat()
        
        # Convert search history timestamps
        for search in user.get("searchHistory", []):
            search["timestamp"] = search["timestamp"].isoformat()
        
        return jsonify({
            "success": True,
            "user": user
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@users_bp.route("/<user_id>", methods=["PUT"])
def update_user(user_id):
    """
    Update user profile
    
    Expected JSON body (all fields optional):
    {
        "budgetMin": 15000,
        "budgetMax": 55000,
        "make": "Honda",
        "model": "Accord",
        "zipCode": "10001",
        "yearMin": 2019,
        "yearMax": 2024,
        "comfortLevel": "luxury"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Update user
        success = update_user_profile(user_id, data)
        
        if not success:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "User profile updated successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@users_bp.route("/<user_id>/searches", methods=["POST"])
def add_search(user_id):
    """
    Add a search to user's history
    
    Expected JSON body:
    {
        "filters": {
            "make": "Honda",
            "model": "Civic",
            "year": 2022,
            "maxPrice": 25000
        }
    }
    """
    try:
        data = request.get_json()
        
        if "filters" not in data:
            return jsonify({"error": "Missing 'filters' field"}), 400
        
        success = add_user_search(user_id, data["filters"])
        
        if not success:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Search added to history"
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@users_bp.route("/<user_id>/searches", methods=["GET"])
def get_searches(user_id):
    """
    Get user's search history
    
    Query parameters:
    - limit: Number of searches to return (default: 10)
    """
    try:
        limit = request.args.get("limit", 10, type=int)
        
        searches = get_user_search_history(user_id, limit)
        
        # Convert timestamps to strings
        for search in searches:
            search["timestamp"] = search["timestamp"].isoformat()
        
        return jsonify({
            "success": True,
            "searches": searches
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@users_bp.route("/<user_id>", methods=["DELETE"])
def remove_user(user_id):
    """
    Delete a user
    """
    try:
        success = delete_user(user_id)
        
        if not success:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "User deleted successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
