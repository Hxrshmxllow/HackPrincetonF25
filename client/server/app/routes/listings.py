from flask import Blueprint, jsonify, request
import json
import requests
import os
from ..utils.openai import get_car_recommendation, chat_about_car
from ..utils.clean_data import clean_listings, get_filter_data

listings_bp = Blueprint("listings", __name__)

@listings_bp.route("/", methods=["GET"])
def get_listings_by_filter():
    """Fetch real car listings from Auto.dev based on AI-generated or user-provided criteria."""
    try:
        state = request.args.get("state")
        if not state:
            return jsonify({"error": "state is required"}), 400

        make = request.args.get("make")
        model = request.args.get("model")
        model_year = request.args.get("model_year", type=int)
        comfort = request.args.get("comfort")
        primary_use = request.args.get("primary_use")
        if primary_use:
            primary_use = primary_use.replace("_", " ")
        if not (make or model) and not primary_use:
            return jsonify({"error": "primary_use is required"}), 400
        budget = request.args.get("budget")

        car_listings = []

        # --- 1️⃣ Get recommendations ---
        if make and model:
            # ✅ User directly provided make/model → single query, no AI
            recommendations = [{
                "make": make,
                "model": model,
                "year": model_year,
            }]
            print(f"ℹ️ Direct search: {make} {model} ({model_year or 'any year'})")

        else:
            # ✅ Use AI to generate recommendations
            try:
                rec_response = get_car_recommendation(state, budget, primary_use, comfort)
                # Handle both tuple (error) and Response object cases
                if isinstance(rec_response, tuple):
                    # Error case: (response, status_code)
                    error_data = rec_response[0].get_json()
                    return jsonify({"error": error_data.get("error", "AI recommendation error")}), rec_response[1]
                recommendations_json = rec_response.get_json()
            except Exception as e:
                print(f"❌ Failed to get AI recommendations: {e}")
                return jsonify({"error": f"AI recommendation error: {str(e)}"}), 500

            # --- Parse AI output safely ---
            try:
                raw_text = recommendations_json.get("recommendations", {}).get("text", "")
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                recommendations = json.loads(raw_text)
                print(recommendations)
                print(f"✅ AI provided {len(recommendations)} car suggestions")
            except Exception as e:
                print(f"❌ Failed to parse AI recommendations: {e}")
                return jsonify({"error": f"Failed to parse AI output: {str(e)}"}), 500

        # --- 2️⃣ Validate Auto.dev token ---
        token = os.getenv("AUTO_DEV_KEY")
        if not token:
            return jsonify({"error": "Missing AUTO_DEV_KEY environment variable"}), 500

        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # --- 3️⃣ Call Auto.dev for each recommended vehicle ---
        for rec in recommendations:
            make = rec.get("make")
            model = rec.get("model")
            year = rec.get("year")

            if not (make and model):
                print(f"⚠️ Skipping incomplete recommendation: {rec}")
                continue

            url = (
                f"https://api.auto.dev/listings?"
                f"vehicle.make={make}&"
                f"vehicle.model={model}&"
                f"retailListing.state={state}&"
                f"limit=5"
            )

            if budget:
                url += f"&retailListing.price=0-{budget}"
            if year:
                url += f"&vehicle.year={year}"

            try:
                resp = requests.get(url, headers=headers, timeout=10)
                if resp.status_code == 200:
                    listings_data = resp.json()
                    car_listings.append({
                        "recommendation": rec,
                        "listings": listings_data.get("listings", listings_data.get("data", []))
                    })
                else:
                    print(f"❌ Auto.dev error {resp.status_code} for {make} {model}")
                    car_listings.append({
                        "recommendation": rec,
                        "error": f"Auto.dev returned {resp.status_code}"
                    })
            except Exception as e:
                print(f"❌ Request failed for {make} {model}: {e}")
                car_listings.append({
                    "recommendation": rec,
                    "error": f"Request exception: {str(e)}"
                })

        # --- 4️⃣ Clean + deduplicate listings ---
        try:
            simplified = clean_listings({"results": car_listings})
            print(f"✅ Found {simplified['uniqueVinCount']} unique VINs")
        except Exception as e:
            print(f"⚠️ Failed to clean listings: {e}")
            import traceback
            traceback.print_exc()
            simplified = {"uniqueVinCount": 0, "results": {}}

        # --- 5️⃣ Generate filters ---
        try:
            filters = get_filter_data(simplified.get("results", {}))
            print(f"✅ Generated filters with {len(filters.get('makes', []))} makes")
        except Exception as e:
            print(f"⚠️ Failed to generate filters: {e}")
            filters = {}

        # --- 6️⃣ Return structured response ---
        return jsonify({
            "items": simplified["uniqueVinCount"],
            "listings": simplified["results"],
            "filters": filters
        }), 200
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"❌ Unhandled error in get_listings_by_filter: {error_msg}")
        return jsonify({"error": f"Internal server error: {error_msg}"}), 500

@listings_bp.route("/chat", methods=["POST"])
def chat_with_ai():
    """Chat with AI about a specific car."""
    try:
        data = request.get_json()
        car_data = data.get("car")
        message_history = data.get("messageHistory", [])
        user_message = data.get("message", "")

        if not car_data:
            return jsonify({"error": "Car data is required"}), 400
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Add user message to history
        message_history.append({"role": "user", "content": user_message})

        # Get AI response
        result = chat_about_car(car_data, message_history)
        
        if "error" in result:
            return jsonify(result), 500

        # Add AI response to history
        message_history.append({"role": "assistant", "content": result["reply"]})

        return jsonify({
            "reply": result["reply"],
            "messageHistory": message_history
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500