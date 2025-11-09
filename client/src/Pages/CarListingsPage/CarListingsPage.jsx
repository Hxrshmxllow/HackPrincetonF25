import React, { useState, useEffect } from "react";
import "./CarListingsPage.css";
import { Car as CarIcon, MapPin, Gauge } from "lucide-react";
import CarModal from "../../Components/CarModal/CarModal";
import fetchListings from "../../utils/fetchListings";
import NavBar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

function CarListingsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    year: "",
    maxPrice: "",
  });
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        // temporary mock profile for now (no firebase)
        const profile = JSON.parse(localStorage.getItem("profile")) || {
          budgetMax: 50000,
          comfortLevel: "Sedan",
        };

        const state = "NJ";
        const budget = profile?.budgetMax || profile?.budgetMin || 50000;
        const primaryUse = profile?.comfortLevel || "Sedan";

        const listings = await fetchListings(state, budget, primaryUse);
        setCars(listings);
      } catch (err) {
        console.error("❌ Error fetching listings:", err);
      }
      setLoading(false);
    };

    loadCars();
  }, []);

  const filteredCars = cars.filter(
    (car) =>
      (filters.make === "" ||
        car.make.toLowerCase().includes(filters.make.toLowerCase())) &&
      (filters.model === "" ||
        car.model.toLowerCase().includes(filters.model.toLowerCase())) &&
      (filters.year === "" || car.year === Number(filters.year)) &&
      (filters.maxPrice === "" || car.price <= Number(filters.maxPrice))
  );

  return (
    <>
      {/* ===== HEADER ===== */}
      <NavBar />

      {/* ===== MAIN CONTENT ===== */}
      <div className="listings-page">
        <div className="filter-bar">
          <h2>
            <CarIcon size={20} style={{ marginRight: "6px" }} />
            Find Your Perfect Ride
          </h2>
          <div className="filters">
            {["make", "model", "year", "maxPrice"].map((key) => (
              <input
                key={key}
                type={key === "year" || key === "maxPrice" ? "number" : "text"}
                placeholder={
                  key === "maxPrice"
                    ? "Max Price ($)"
                    : key[0].toUpperCase() + key.slice(1)
                }
                value={filters[key]}
                onChange={(e) =>
                  setFilters({ ...filters, [key]: e.target.value })
                }
              />
            ))}
          </div>
        </div>

        {loading ? (
          <p className="loading">Loading car listings...</p>
        ) : filteredCars.length === 0 ? (
          <p className="no-results">No cars match your filters.</p>
        ) : (
          <div className="car-grid">
            {filteredCars.map((car) => (
              <div
                className="car-card"
                key={car.id}
                onClick={() => setSelectedCar(car)}
              >
                <div className="image-wrapper">
                  <img src={car.image} alt={`${car.make} ${car.model}`} />
                </div>
                <div className="car-info">
                  <h3>
                    {car.year} {car.make} {car.model}
                  </h3>
                  <p className="price">${car.price.toLocaleString()}</p>
                  <p className="details">
                    <Gauge size={14} /> {car.mileage.toLocaleString()} mi •{" "}
                    <MapPin size={14} /> {car.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCar && (
          <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <Footer />
    </>
  );
}

export default CarListingsPage;
