from flask import Blueprint, jsonify, request
import json
import requests
import os
from ..utils.openai import get_car_analysis


ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/", methods=["POST"])
def get_ai_analysis():
    """
    POST /ai/
    Request body should contain JSON of vehicle data.
    Example:
    {
      "make": "Toyota",
      "model": "Camry",
      "year": 2018,
      "price": 18000,
      "mileage": 65000,
      "location": "New Jersey",
      "history": {"accidentCount": 0, "ownerCount": 1}
    }
    """
    try:
        vehicle_data = request.get_json()

        if not vehicle_data:
            return jsonify({"error": "Missing or invalid JSON body"}), 400

        # Run AI analysis
        analysis = get_car_analysis(vehicle_data)

        # get_car_analysis() already returns jsonify() in case of failure
        if isinstance(analysis, tuple):
            # already handled (error)
            return analysis

        return jsonify({
            "status": "success",
            "vehicle": {
                "make": vehicle_data.get("make"),
                "model": vehicle_data.get("model"),
                "year": vehicle_data.get("year"),
            },
            "aiAnalysis": analysis
        }), 200

    except Exception as e:
        print(f"❌ AI analysis error: {e}")
        return jsonify({"error": str(e)}), 500