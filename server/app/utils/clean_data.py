from .openai import get_car_rating
from .insurance_prediction import estimate_annual_insurance
import os
from flask import jsonify
import requests

def clean_listings(data):
    simplified_results = {}
    vin_set = set()
    for item in data.get("results", []):
        try:
            listings = item.get("listings", [])
            if not listings:
                print("⚠️ No listings in item:", item.keys())
                continue

            for listing in listings:
                try:
                    vehicle = listing.get("vehicle", {})
                    vin = vehicle.get("vin")

                    if not vin:
                        print("🚫 Missing VIN in listing:", listing.keys())
                        continue

                    if vin in vin_set:
                        print(f"⚠️ Duplicate VIN skipped: {vin}")
                        continue

                    vin_set.add(vin)
                    print(f"🔹 Processing VIN: {vin}")

                    # Safe extract with debug prints
                    history = listing.get("history", {})
                    retail = listing.get("retailListing", {}).copy()
                    if "vdp" not in retail:
                        print(f"⚠️ Missing VDP for VIN {vin}")

                    retail["listing"] = retail.pop("vdp", None)
                    vehicle = listing.get("vehicle", {})

                    token = os.getenv("AUTO_DEV_KEY")
                    if not token:
                        print(f"⚠️ Missing AUTO_DEV_KEY, using default image for {vin}")
                        images = retail.get("primaryImage")
                    else:
                        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                        url = f'https://api.auto.dev/photos/{vin}'

                        try:
                            resp = requests.get(url, headers=headers, timeout=2)
                            if resp.status_code == 200:
                                listings_data = resp.json()
                                photo_data = listings_data.get("data", [])
                                photo_retail = photo_data.get("retail", {})
                                if photo_retail is not None:
                                    images = photo_retail
                                else:
                                    images = retail.get("primaryImage")
                            else:
                                print(f"❌ Auto.dev error {resp.status_code} for {vin} images")
                                images = retail.get("primaryImage")
                        except Exception as e:
                            print(f"❌ Auto.dev error for {vin} images: {e}")
                            images = retail.get("primaryImage")

                    simplified_results[vin] = {
                         **(
                            {"history": {
                                "accidentCount": history.get("accidentCount"),
                                "accidents": history.get("accidents"),
                                "oneOwner": history.get("oneOwner"),
                                "ownerCount": history.get("ownerCount"),
                                "personalUse": history.get("personalUse"),
                                "usageType": history.get("usageType"),
                            }} if history else {}
                        ),
                        "retailListing": {
                            "carfaxUrl": retail.get("carfaxUrl"),
                            "city": retail.get("city"),
                            "cpo": retail.get("cpo"),
                            "dealer": retail.get("dealer"),
                            "miles": retail.get("miles"),
                            "price": retail.get("price"),
                            "images": images,
                            "state": retail.get("state"),
                            "used": retail.get("used"),
                            "listing": retail.get("listing"),
                            "zip": retail.get("zip"),
                        },
                        "vehicle": {
                            "baseMsrp": vehicle.get("baseMsrp"),
                            "bodyStyle": vehicle.get("bodyStyle"),
                            "cylinders": vehicle.get("cylinders"),
                            "doors": vehicle.get("doors"),
                            "drivetrain": vehicle.get("drivetrain"),
                            "engine": vehicle.get("engine"),
                            "exteriorColor": vehicle.get("exteriorColor"),
                            "fuel": vehicle.get("fuel"),
                            "interiorColor": vehicle.get("interiorColor"),
                            "make": vehicle.get("make"),
                            "model": vehicle.get("model"),
                            "seats": vehicle.get("seats"),
                            "transmission": vehicle.get("transmission"),
                            "trim": vehicle.get("trim"),
                            "type": vehicle.get("type"),
                            "vin": vin,
                            "year": vehicle.get("year"),
                        }
                    }
                    # Get ratings - handle both dict and tuple responses
                    rating_result = get_car_rating(simplified_results[vin])
                    if isinstance(rating_result, tuple):
                        # Error case: (response, status_code)
                        print(f"⚠️ Failed to get rating for {vin}")
                        simplified_results[vin]["ratings"] = {}
                    else:
                        simplified_results[vin]["ratings"] = rating_result
                except Exception as e:
                    import traceback
                    print(f"❌ Error while processing VIN or listing: {e}")
                    traceback.print_exc()

        except Exception as e:
            print(f"❌ Error while processing item in results: {e}")

    return {
        "uniqueVinCount": len(vin_set),
        "results": simplified_results
    }


def get_filter_data(data):
    """
    Generate filter metadata from simplified car listings.

    Args:
        data (dict): cleaned data, where each key is a VIN and value contains
                     'retailListing' and 'vehicle' fields.

    Returns:
        dict: filter metadata including min/max ranges and unique categorical sets.
              Models are now grouped under their corresponding make.
    """
    if not data or not isinstance(data, dict):
        return {
            "mileageRange": {"min": None, "max": None},
            "priceRange": {"min": None, "max": None},
            "makes": [],
            "models": {},
            "years": [],
            "exteriorColors": []
        }

    mileages, prices, makes, years, colors = [], [], set(), set(), set()
    models_by_make = {}  # ✅ new structure

    for vin, listing in data.items():
        vehicle = listing.get("vehicle", {})
        retail = listing.get("retailListing", {})

        # --- Collect numerical data ---
        miles = retail.get("miles")
        price = retail.get("price")
        year = vehicle.get("year")

        if isinstance(miles, (int, float)):
            mileages.append(miles)
        if isinstance(price, (int, float)):
            prices.append(price)
        if isinstance(year, (int, float)):
            years.add(year)

        # --- Collect categorical data ---
        make = vehicle.get("make")
        model = vehicle.get("model")
        color = vehicle.get("exteriorColor")

        if make:
            makes.add(make)
            if make not in models_by_make:
                models_by_make[make] = set()
            if model:
                models_by_make[make].add(model)
        if color:
            colors.add(color)

    # --- Compute ranges ---
    mileage_range = {"min": min(mileages) if mileages else None,
                     "max": max(mileages) if mileages else None}
    price_range = {"min": min(prices) if prices else None,
                   "max": max(prices) if prices else None}

    # --- Convert sets to sorted lists ---
    models_by_make = {make: sorted(list(models))
                      for make, models in models_by_make.items()}

    # --- Build final filter metadata ---
    filters = {
        "mileageRange": mileage_range,
        "priceRange": price_range,
        "makes": sorted(list(makes)),
        "models": models_by_make,
        "years": sorted(list(years)),
        "exteriorColors": sorted(list(colors))
    }

    print("✅ Generated filters:", filters)
    return filters