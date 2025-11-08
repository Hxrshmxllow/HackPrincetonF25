import React, { useState, useEffect } from "react";
import "./CarListings.css";
import { Car } from "lucide-react";
//import { useNavigate } from "react-router-dom";
import "./App.tsx"

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  image: string;
  images: string[];
  location: string;
  description: string;
  insuranceEstimate: number;
  maintenanceNote: string;
}

const mockCars: Car[] = [
  {
    id: 1,
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    price: 41999,
    mileage: 12000,
    image: "https://source.unsplash.com/1000x700/?tesla,car",
    images: [
      "https://source.unsplash.com/1200x800/?tesla,model3,exterior",
      "https://source.unsplash.com/1200x800/?tesla,model3,interior",
      "https://source.unsplash.com/1200x800/?tesla,model3,front",
      "https://source.unsplash.com/1200x800/?tesla,model3,side",
      "https://source.unsplash.com/1200x800/?tesla,model3,back",
    ],
    location: "Newark, NJ",
    description:
      "The Tesla Model 3 offers cutting-edge EV performance with minimal maintenance and high resale value.",
    insuranceEstimate: 1450,
    maintenanceNote:
      "Generally reliable — check for tire wear and software update status.",
  },
  {
    id: 2,
    make: "Toyota",
    model: "Camry",
    year: 2021,
    price: 23999,
    mileage: 28000,
    image: "https://source.unsplash.com/1000x700/?toyota,camry",
    images: [
      "https://source.unsplash.com/1200x800/?toyota,camry,exterior",
      "https://source.unsplash.com/1200x800/?toyota,camry,interior",
      "https://source.unsplash.com/1200x800/?toyota,camry,front",
      "https://source.unsplash.com/1200x800/?toyota,camry,side",
    ],
    location: "Edison, NJ",
    description:
      "A dependable midsize sedan known for comfort, fuel efficiency, and long-term reliability.",
    insuranceEstimate: 1200,
    maintenanceNote:
      "Excellent reliability — inspect for brake wear and oil change history.",
  },
  {
    id: 3,
    make: "Honda",
    model: "Civic",
    year: 2022,
    price: 20999,
    mileage: 18000,
    image: "https://source.unsplash.com/1000x700/?honda,civic",
    images: [
      "https://source.unsplash.com/1200x800/?honda,civic,exterior",
      "https://source.unsplash.com/1200x800/?honda,civic,interior",
      "https://source.unsplash.com/1200x800/?honda,civic,front",
      "https://source.unsplash.com/1200x800/?honda,civic,side",
      "https://source.unsplash.com/1200x800/?honda,civic,back",
    ],
    location: "Princeton, NJ",
    description:
      "Popular among new buyers for its smooth ride, solid build, and great resale value.",
    insuranceEstimate: 1100,
    maintenanceNote:
      "Mostly trouble-free — verify recall fixes and transmission fluid changes.",
  },
  {
    id: 4,
    make: "BMW",
    model: "3 Series",
    year: 2020,
    price: 32999,
    mileage: 36000,
    image: "https://source.unsplash.com/1000x700/?bmw,car",
    images: [
      "https://source.unsplash.com/1200x800/?bmw,3series,exterior",
      "https://source.unsplash.com/1200x800/?bmw,3series,interior",
      "https://source.unsplash.com/1200x800/?bmw,3series,front",
      "https://source.unsplash.com/1200x800/?bmw,3series,side",
      "https://source.unsplash.com/1200x800/?bmw,3series,back",
    ],
    location: "New Brunswick, NJ",
    description:
      "Luxury meets performance — refined interior, excellent handling, and strong resale value.",
    insuranceEstimate: 1800,
    maintenanceNote:
      "Ensure regular servicing — common for minor electrical and suspension issues.",
  },
];

const CarListings: React.FC = () => {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const hasProfile = localStorage.getItem("profile");
  // const navigate = useNavigate();

  // Reset image index when a new car is selected
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedCar]);

  const filteredCars = mockCars.filter((car) => {
    return (
      (make === "" || car.make.toLowerCase().includes(make.toLowerCase())) &&
      (model === "" || car.model.toLowerCase().includes(model.toLowerCase())) &&
      (year === "" || car.year === Number(year)) &&
      (maxPrice === "" || car.price <= Number(maxPrice))
    );
  });

  return (
    <div className="page">
    {/* <nav className="navbar-listings">
      <div className="logo">
        <Car size={28} />
        <span>CarInsight</span>
      </div>
      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#">Features</a>
        <a href="#">Contact</a>
      </div>
      {hasProfile ? (
        <button className="profile-icon" onClick={() => navigate("/profile")}>
          <User size={24} />
        </button>
      ) : (
        <button className="nav-btn" onClick={() => navigate("/setup")}>
          Get Started
        </button>
      )}
    </nav> */}

    <div className="listings-page">
      <div className="filter-bar">
        <h2>🔍 Find Your Perfect Ride</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          />
          <input
            type="text"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price ($)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="car-grid">
        {filteredCars.map((car) => (
          <div
            className="car-card"
            key={car.id}
            onClick={() => {
              setSelectedCar(car);
              setCurrentImageIndex(0);
            }}
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
                {car.mileage.toLocaleString()} miles • {car.location}
              </p>
            </div>
          </div>
        ))}
        {filteredCars.length === 0 && (
          <p className="no-results">No cars match your filters.</p>
        )}
      </div>

      {/* Modal */}
      {selectedCar && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedCar(null);
            setCurrentImageIndex(0);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => {
                setSelectedCar(null);
                setCurrentImageIndex(0);
              }}
            >
              ×
            </button>
            <div className="image-carousel-container">
              <div
                className="image-carousel"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                }}
              >
                {selectedCar.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${selectedCar.make} ${selectedCar.model} - Image ${index + 1}`}
                    className="carousel-image"
                  />
                ))}
              </div>
              {currentImageIndex > 0 && (
                <button
                  className="carousel-btn carousel-btn-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(currentImageIndex - 1);
                  }}
                >
                  ‹
                </button>
              )}
              {currentImageIndex < selectedCar.images.length - 1 && (
                <button
                  className="carousel-btn carousel-btn-right"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(currentImageIndex + 1);
                  }}
                >
                  ›
                </button>
              )}
              <div className="carousel-indicators">
                {selectedCar.images.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImageIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="modal-content">
              <div className="modal-content-wrapper">
                <div className="vehicle-info">
                  <h2>
                    {selectedCar.year} {selectedCar.make} {selectedCar.model}
                  </h2>
                  <p className="modal-price">
                    ${selectedCar.price.toLocaleString()}
                  </p>
                  <p className="modal-detail">
                    📍 {selectedCar.location} • {selectedCar.mileage.toLocaleString()}{" "}
                    miles
                  </p>
                  <p className="description">{selectedCar.description}</p>
                </div>
                <div className="insight-box">
                  <p>💡 {selectedCar.maintenanceNote}</p>
                  <p>
                    🛡 Estimated Insurance: $
                    {selectedCar.insuranceEstimate.toLocaleString()}/yr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default CarListings;
