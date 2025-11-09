from flask import Blueprint, jsonify, request, send_file
import json
import requests
import os
from ..utils.openai import get_car_analysis, get_car_checklist, get_insurance_breakdown
from ..utils.pdf_generator import generate_checklist_pdf


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
    
@ai_bp.route("/checklist", methods=["POST"])
def generate_checklist():
    try:
        vehicle_data = request.get_json()
        if not vehicle_data:
            return jsonify({"error": "Missing or invalid JSON body"}), 400

        # 1️⃣ Get AI checklist + price reasoning
        checklist = get_car_checklist(vehicle_data)
        if isinstance(checklist, tuple):  # error jsonify
            return checklist

        # 2️⃣ Generate PDF file
        pdf_path = generate_checklist_pdf(vehicle_data, checklist)

        # 3️⃣ Send to frontend
        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        print("❌ Checklist generation failed:", e)
        return jsonify({"error": str(e)}), 500
    
@ai_bp.route("/insurance-breakdown", methods=["POST"])
def insurance_breakdown():
    try:
        vehicle_data = request.get_json()
        if not vehicle_data:
            return jsonify({"error": "Missing or invalid JSON body"}), 400

        # 1️⃣ Get AI insurance breakdown
        breakdown = get_insurance_breakdown(vehicle_data)
        if isinstance(breakdown, tuple):  # error jsonify
            return breakdown

        return jsonify({
            "status": "success",
            "insuranceBreakdown": breakdown
        }), 200

    except Exception as e:
        print("❌ Insurance breakdown generation failed:", e)
        return jsonify({"error": str(e)}), 500