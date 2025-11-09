"""
Quick test script for insurance prediction
"""

from server.app.utils.insurance_prediction import estimate_annual_insurance

# Test Case 1: High-end sports car with accident history
test_car_1 = {
    "vehicle": {
        "make": "BMW",
        "model": "M3",
        "year": 2022,
        "baseMsrp": 75000,
        "bodyStyle": "Coupe",
        "cylinders": 6,
        "fuel": "Gasoline",
    },
    "retailListing": {
        "price": 65000,
        "state": "NJ",
        "city": "Newark",
        "miles": 15000,
    },
    "history": {
        "accidentCount": 2,
        "ownerCount": 1,
        "usageType": "Personal",
    }
}

# Test Case 2: Reliable family sedan
test_car_2 = {
    "vehicle": {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "baseMsrp": 28000,
        "bodyStyle": "Sedan",
        "cylinders": 4,
        "fuel": "Gasoline",
    },
    "retailListing": {
        "price": 24000,
        "state": "NJ",
        "city": "Princeton",
        "miles": 35000,
    },
    "history": {
        "accidentCount": 0,
        "ownerCount": 1,
        "usageType": "Personal",
    }
}

# Test Case 3: Electric vehicle
test_car_3 = {
    "vehicle": {
        "make": "Tesla",
        "model": "Model 3",
        "year": 2023,
        "baseMsrp": 45000,
        "bodyStyle": "Sedan",
        "cylinders": None,  # EVs don't have cylinders
        "fuel": "Electric",
    },
    "retailListing": {
        "price": 42000,
        "state": "CA",
        "city": "Los Angeles",
        "miles": 8000,
    },
    "history": {
        "accidentCount": 0,
        "ownerCount": 1,
        "usageType": "Personal",
    }
}

print("=" * 60)
print("INSURANCE PREDICTION TEST RESULTS")
print("=" * 60)

for i, car in enumerate([test_car_1, test_car_2, test_car_3], 1):
    result = estimate_annual_insurance(car)
    vehicle = car["vehicle"]
    retail = car["retailListing"]

    print(f"\n📊 Test Case {i}: {vehicle['year']} {vehicle['make']} {vehicle['model']}")
    print(f"   Price: ${retail['price']:,}")
    print(f"   Location: {retail['city']}, {retail['state']}")
    print(f"   Mileage: {retail['miles']:,}")
    print(f"   Accidents: {car['history']['accidentCount']}")
    print(f"\n   💰 INSURANCE ESTIMATE:")
    print(f"      Annual:  ${result['annualEstimate']:,.2f}")
    print(f"      Monthly: ${result['monthlyEstimate']:,.2f}")
    print(f"\n   🔍 Key Multipliers:")
    breakdown = result['breakdown']
    print(f"      Base Cost:       ${breakdown['baseCost']:,.2f}")
    print(f"      Location (x{breakdown['locationMultiplier']:.2f})")
    print(f"      Make/Brand (x{breakdown['makeMultiplier']:.2f})")
    print(f"      Body Style (x{breakdown['bodyStyleMultiplier']:.2f})")
    print(f"      Accidents (x{breakdown['accidentMultiplier']:.2f})")
    print(f"      Total Multiplier: x{breakdown['totalMultiplier']:.3f}")
    print("-" * 60)

print("\n✅ Insurance prediction test completed!")
