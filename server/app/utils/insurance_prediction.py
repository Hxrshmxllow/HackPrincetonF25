"""
Insurance Prediction Module
============================
Heuristic-based insurance cost estimation using vehicle attributes and location data.
"""

# State-based risk multipliers (based on average insurance costs)
STATE_MULTIPLIERS = {
    "NJ": 1.35,  # New Jersey - high rates
    "NY": 1.40,  # New York - highest rates
    "CA": 1.25,  # California - high rates
    "FL": 1.30,  # Florida - high rates
    "TX": 1.10,  # Texas - moderate
    "PA": 1.15,  # Pennsylvania - moderate
    "OH": 0.95,  # Ohio - lower rates
    "MI": 1.45,  # Michigan - very high rates
    "MA": 1.20,  # Massachusetts - high
    "VA": 1.05,  # Virginia - moderate
    "NC": 0.90,  # North Carolina - lower
    "GA": 1.08,  # Georgia - moderate
    "IL": 1.18,  # Illinois - moderate-high
}

# Make-based risk multipliers (based on insurance claim data)
MAKE_MULTIPLIERS = {
    "Tesla": 1.30,  # High repair costs
    "BMW": 1.35,    # Luxury, expensive repairs
    "Mercedes-Benz": 1.40,
    "Audi": 1.32,
    "Porsche": 1.60,
    "Jaguar": 1.45,
    "Land Rover": 1.38,
    "Dodge": 1.20,  # Performance models common
    "Chevrolet": 1.05,
    "Ford": 1.00,
    "Toyota": 0.85,  # Very reliable
    "Honda": 0.88,
    "Mazda": 0.92,
    "Subaru": 0.95,
    "Hyundai": 0.90,
    "Kia": 0.88,
    "Nissan": 0.98,
    "Volkswagen": 1.10,
}

# Body style risk multipliers
BODY_STYLE_MULTIPLIERS = {
    "Sedan": 0.95,
    "SUV": 1.05,
    "Truck": 1.08,
    "Coupe": 1.20,  # Often sports-oriented
    "Convertible": 1.25,
    "Hatchback": 0.93,
    "Wagon": 0.97,
    "Van": 1.00,
    "Minivan": 0.90,  # Family vehicles
}

# Engine cylinder multipliers (power proxy)
CYLINDER_MULTIPLIERS = {
    3: 0.85,
    4: 0.90,
    6: 1.10,
    8: 1.30,
    10: 1.50,
    12: 1.70,
}


def estimate_annual_insurance(car_data):
    """
    Estimate annual insurance cost using heuristic model.

    Args:
        car_data (dict): Car listing data with 'vehicle', 'retailListing', and 'history' keys

    Returns:
        dict: Insurance estimate with breakdown
    """
    vehicle = car_data.get("vehicle", {})
    retail = car_data.get("retailListing", {})
    history = car_data.get("history", {})

    # === BASE COST (from vehicle value) ===
    price = retail.get("price") or vehicle.get("baseMsrp") or 25000
    base_cost = price * 0.06  # Start with ~6% of vehicle value

    # === LOCATION MULTIPLIER ===
    state = retail.get("state", "NJ")
    location_mult = STATE_MULTIPLIERS.get(state, 1.15)  # Default to moderate-high

    # === MAKE MULTIPLIER ===
    make = vehicle.get("make", "")
    make_mult = MAKE_MULTIPLIERS.get(make, 1.00)

    # === BODY STYLE MULTIPLIER ===
    body_style = vehicle.get("bodyStyle", "Sedan")
    body_mult = BODY_STYLE_MULTIPLIERS.get(body_style, 1.00)

    # === ENGINE POWER MULTIPLIER ===
    cylinders = vehicle.get("cylinders")
    cylinder_mult = CYLINDER_MULTIPLIERS.get(cylinders, 1.00) if cylinders else 1.00

    # === AGE FACTOR ===
    year = vehicle.get("year", 2020)
    current_year = 2025
    age = max(0, current_year - year)

    # More granular age brackets for diversity
    if age <= 2:
        age_mult = 1.15  # Brand new, high value
    elif age <= 5:
        age_mult = 1.05  # Relatively new
    elif age <= 8:
        age_mult = 0.95  # Mid-age, depreciated
    elif age <= 12:
        age_mult = 0.85  # Older, lower value
    else:
        age_mult = 0.75  # Very old, much lower value

    # === MILEAGE FACTOR ===
    miles = retail.get("miles", 50000)
    # More granular mileage brackets for diversity
    if miles < 20000:
        mileage_mult = 1.10  # Very low mileage = higher value
    elif miles < 50000:
        mileage_mult = 1.05  # Low mileage
    elif miles < 80000:
        mileage_mult = 0.95  # Average mileage
    elif miles < 120000:
        mileage_mult = 0.85  # High mileage
    else:
        mileage_mult = 0.75  # Very high mileage

    # === ACCIDENT HISTORY ===
    accident_count = history.get("accidentCount", 0) if history else 0
    # Clean history gives discount, accidents increase cost
    if accident_count == 0:
        accident_mult = 0.90  # Clean history discount
    else:
        accident_mult = 1.0 + (accident_count * 0.20)  # +20% per accident

    # === OWNERSHIP HISTORY ===
    owner_count = history.get("ownerCount", 1) if history else 1
    # Multiple owners can indicate higher risk or poor maintenance
    owner_mult = 1.0 + (max(0, owner_count - 1) * 0.05)  # +5% per additional owner

    # === USAGE TYPE ===
    usage_type = history.get("usageType", "Personal") if history else "Personal"
    usage_mult = 1.30 if usage_type in ["Commercial", "Rental", "Lease"] else 1.00

    # === FUEL TYPE (EVs have different risk profiles) ===
    fuel = vehicle.get("fuel", "Gasoline")
    fuel_mult = 1.15 if fuel in ["Electric", "Hybrid"] else 1.00  # Higher repair costs

    # === CALCULATE FINAL ESTIMATE ===
    total_multiplier = (
        location_mult *
        make_mult *
        body_mult *
        cylinder_mult *
        age_mult *
        mileage_mult *
        accident_mult *
        owner_mult *
        usage_mult *
        fuel_mult
    )

    estimated_annual = base_cost * total_multiplier
    estimated_monthly = estimated_annual / 12

    # === RETURN BREAKDOWN ===
    return {
        "annualEstimate": round(estimated_annual, 2),
        "monthlyEstimate": round(estimated_monthly, 2),
        "breakdown": {
            "baseCost": round(base_cost, 2),
            "locationMultiplier": round(location_mult, 3),
            "makeMultiplier": round(make_mult, 3),
            "bodyStyleMultiplier": round(body_mult, 3),
            "engineMultiplier": round(cylinder_mult, 3),
            "ageMultiplier": round(age_mult, 3),
            "mileageMultiplier": round(mileage_mult, 3),
            "accidentMultiplier": round(accident_mult, 3),
            "ownerMultiplier": round(owner_mult, 3),
            "usageMultiplier": round(usage_mult, 3),
            "fuelMultiplier": round(fuel_mult, 3),
            "totalMultiplier": round(total_multiplier, 3),
        },
        "factors": {
            "state": state,
            "make": make,
            "bodyStyle": body_style,
            "cylinders": cylinders,
            "age": age,
            "miles": miles,
            "accidentCount": accident_count,
            "ownerCount": owner_count,
            "usageType": usage_type,
            "fuel": fuel,
        }
    }
