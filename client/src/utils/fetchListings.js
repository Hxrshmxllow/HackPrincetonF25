// src/utils/fetchListings.js
export default async function fetchListings(state, budget, primaryUse) {
  try {
    const url = `http://localhost:8000/listings/?state=${state}&budget=${budget}&primary_use=${primaryUse}`;
    console.log("Fetching from:", url);

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed response:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    if (!data.listings) {
      console.warn("No listings returned");
      return [];
    }

    // Convert object { VIN: listingData } → array
    return Object.entries(data.listings).map(([vin, item], index) => {
      const retail = item.retailListing || {};
      const vehicle = item.vehicle || {};
      const ratings = item.ratings || {};
      const history = item.history || {};

      const images = Array.isArray(retail.images)
        ? retail.images
        : typeof retail.images === "string"
        ? retail.images.split(",").map((url) => url.trim())
        : [];

      return {
        id: index,
        make: vehicle.make || "Unknown",
        model: vehicle.model || "N/A",
        year: vehicle.year || 0,
        price: retail.price || 0,
        mileage: retail.miles || 0,
        image: images[0] || "https://source.unsplash.com/1000x700/?car",
        images,
        location: `${retail.city || "Unknown"}, ${retail.state || ""}`,
        description: `${vehicle.make || ""} ${vehicle.model || ""} ${vehicle.trim || ""}`,
        insuranceEstimate: Math.round((retail.price || 10000) * 0.12),
        insuranceMonthly: Math.round((retail.price || 10000) * 0.12 / 12),
        maintenanceNote: `Overall Rating: ${ratings.overallRating?.toFixed(2) || "N/A"} / 5`,
        ratings,
        history,
        dealer: retail.dealer,
        listing: retail.listing,
        exteriorColor: vehicle.exteriorColor,
        interiorColor: vehicle.interiorColor,
        drivetrain: vehicle.drivetrain,
        transmission: vehicle.transmission,
        fuel: vehicle.fuel,
        baseMsrp: vehicle.baseMsrp,
      };
    });
  } catch (err) {
    console.error("Error fetching listings:", err);
    return [];
  }
}
