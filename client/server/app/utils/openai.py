from flask import jsonify
import requests
import os, json
from openai import OpenAI

def get_car_recommendation(state, budget, primary_use, comfort):
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return jsonify({"error": "Missing OpenAI API key"}), 500

    client = OpenAI(api_key=key)

    # Construct a prompt for OpenAI
    prompt = f"""
    You are an expert car consultant. Suggest top 3 cars (make, model, and year) that best fit
    the following buyer preferences:

    - Max budget: ${budget}
    - Car type/Comfort: {comfort}
    - Location: {state}
    - Primary use: {primary_use}

    Each recommendation should include:
    1. Make
    2. Model
    3. Year (within budget range)
    4. Estimated price based on current market trends

    Respond in JSON format as a list of objects with keys:
    ["make", "model", "year", "price"].

    Do NOT include any additional explanations or reasons.
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
    
def get_car_rating(vehicle_data):
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return jsonify({"error": "Missing OpenAI API key"}), 500

    client = OpenAI(api_key=key)

    # Validate
    if not vehicle_data:
        return jsonify({"error": "Missing vehicle data"}), 400

    # Build prompt for OpenAI
    prompt = f"""
    You are an automotive analyst that evaluates used cars based on reliability, cost, and satisfaction.
    Given the following vehicle JSON, return a JSON object with numeric ratings (out of 5.00, up to 2 decimals)
    for these categories:

    1. dealRating — based on mileage, price, year, and location
    2. fuelEconomyRating — based on MPG or efficiency for this model
    3. maintenanceRating — based on yearly maintenance cost and reliability
    4. safetyRating — based on NHTSA/IIHS safety performance
    5. ownerSatisfactionRating — based on verified owner reviews
    6. overallRating — average of all above categories

    Input vehicle:
    {vehicle_data}

    Respond strictly in JSON with keys:
    ["dealRating", "fuelEconomyRating", "maintenanceRating", "safetyRating", "ownerSatisfactionRating", "overallRating"].

    Example format:
    {{
      "dealRating": 3.45,
      "fuelEconomyRating": 3.80,
      "maintenanceRating": 3.10,
      "safetyRating": 4.20,
      "ownerSatisfactionRating": 3.90,
      "overallRating": 3.69
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a precise car rating assistant that only returns clean JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        raw = response.choices[0].message.content.strip()

        try:
            ratings = json.loads(raw)
        except json.JSONDecodeError:
            ratings = {"rawText": raw}
        print(ratings)
        return ratings

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def chat_about_car(car_data, message_history):
    """Chat with AI about a specific car using conversation history. Don't include any headers or anything that needs to be formatted. Just be conversational."""
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return {"error": "Missing OpenAI API key"}

    client = OpenAI(api_key=key)

    # Build system prompt with car information
    car_info = f"""
    Car Details:
    - Make: {car_data.get('make', 'Unknown')}
    - Model: {car_data.get('model', 'Unknown')}
    - Year: {car_data.get('year', 'Unknown')}
    - Price: ${car_data.get('price', 0):,}
    - Mileage: {car_data.get('mileage', 0):,} miles
    - Location: {car_data.get('location', 'Unknown')}
    - Transmission: {car_data.get('transmission', 'N/A')}
    - Fuel Type: {car_data.get('fuel', 'N/A')}
    - Exterior Color: {car_data.get('exteriorColor', 'N/A')}
    - Interior Color: {car_data.get('interiorColor', 'N/A')}
    - Description: {car_data.get('description', 'N/A')}
    """
    
    if car_data.get('ratings'):
        car_info += f"""
    - Overall Rating: {car_data.get('ratings', {}).get('overallRating', 'N/A')}
    - Deal Rating: {car_data.get('ratings', {}).get('dealRating', 'N/A')}
    - Fuel Economy Rating: {car_data.get('ratings', {}).get('fuelEconomyRating', 'N/A')}
    - Maintenance Rating: {car_data.get('ratings', {}).get('maintenanceRating', 'N/A')}
    - Safety Rating: {car_data.get('ratings', {}).get('safetyRating', 'N/A')}
    """
    
    if car_data.get('history'):
        car_info += f"""
    - Accident Count: {car_data.get('history', {}).get('accidentCount', 'N/A')}
    - Owner Count: {car_data.get('history', {}).get('ownerCount', 'N/A')}
    - One Owner: {car_data.get('history', {}).get('oneOwner', 'N/A')}
    """

    system_prompt = f"""You are a helpful and knowledgeable car buying assistant. You have access to detailed information about a specific car listing. 
    
    {car_info}
    
    Answer questions about this car honestly and helpfully. Provide insights about:
    - Value and pricing
    - Reliability and maintenance
    - Fuel economy
    - Safety features
    - Overall quality and owner satisfaction
    - Whether this car is a good deal
    - Any concerns or things to watch out for
    
    Be conversational, friendly, and provide practical advice. If you don't know something specific, say so rather than guessing."""

    # Build messages array
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history
    for msg in message_history:
        messages.append(msg)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7
        )

        reply = response.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        return {"error": str(e)}