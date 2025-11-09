from flask import Blueprint, jsonify
import requests
import os
from openai import OpenAI

recommendations_bp = Blueprint("recommendations", __name__)

@recommendations_bp.route("/", methods=["GET"])
def get_car_recommendations():
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return jsonify({"error": "Missing OpenAI API key"}), 500

    client = OpenAI(api_key=key)

    # Extract query parameters
    #budget = request.args.get("budget", "")
    #car_type = request.args.get("type", "")
    #location = request.args.get("location", "")
    #primary_use = request.args.get("use", "")

    budget = 10000
    car_type = "SUV"
    location = "San Francisco, CA"
    primary_use = "Daily commuting and weekend trips"

    # Validate
    if not budget or not car_type or not location or not primary_use:
        return jsonify({"error": "Missing one or more required query parameters"}), 400

    # Construct a prompt for OpenAI
    prompt = f"""
    You are an expert car consultant. Suggest 10 cars (make, model, and year) that best fit
    the following buyer preferences:

    - Max budget: ${budget}
    - Car type: {car_type}
    - Location: {location}
    - Primary use: {primary_use}

    Each recommendation should include:
    1. Make
    2. Model
    3. Year (within budget range)
    4. Estimated price based on current market trends

    Respond in JSON format as a list of objects with keys:
    ["make", "model", "year", "price"].
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful car buying assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        raw = response.choices[0].message.content.strip()

        # Try to parse the response into JSON
        import json
        try:
            recommendations = json.loads(raw)
        except json.JSONDecodeError:
            # If parsing fails, wrap raw text
            recommendations = {"text": raw}

        return jsonify({
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500