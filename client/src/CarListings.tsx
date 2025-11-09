import React, { useState, useEffect, useRef } from "react";
import "./CarListings.css";
import {
  Car as CarIcon,
  MapPin,
  Building2,
  Gauge,
  PaintBucket,
  Fuel,
  Settings,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
  History,
  MessageCircle,
  Send,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

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
  ratings?: any;
  history?: any;
  dealer?: string;
  listing?: string;
  exteriorColor?: string;
  interiorColor?: string;
  drivetrain?: string;
  transmission?: string;
  fuel?: string;
}

const fetchListings = async (
  state: string,
  budget: number,
  primaryUse: string
): Promise<Car[]> => {
  try {
    const url = `http://localhost:8000/listings/?state=${state}&budget=${budget}&primary_use=${primaryUse}`;
    console.log("🔍 Fetching from:", url);
    
    const res = await fetch(url);
    console.log("📡 Response status:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Response not OK:", res.status, errorText);
      return [];
    }

    const data = await res.json();
    console.log("📦 Response data:", data);
    console.log("📦 Listings keys:", data.listings ? Object.keys(data.listings) : "No listings");
    
    if (!data.listings) {
      console.warn("⚠️ No listings in response");
      return [];
    }

    const entries = Object.entries(data.listings);
    console.log(`✅ Found ${entries.length} listings to process`);
    
    return entries.map(
      ([_vin, item]: [string, any], index) => {
        const retail = item.retailListing || {};
        const vehicle = item.vehicle || {};
        const ratings = item.ratings || {};
        const history = item.history || {};

        const parsedImages = Array.isArray(retail.images)
          ? retail.images
          : typeof retail.images === "string"
          ? retail.images.split(",").map((url: string) => url.trim())
          : [];

        return {
          id: index,
          make: vehicle.make || "Unknown",
          model: vehicle.model || "N/A",
          year: vehicle.year || 0,
          price: retail.price || 0,
          mileage: retail.miles || 0,
          image:
            parsedImages[0] ||
            "https://source.unsplash.com/1000x700/?car,vehicle,auto",
          images: parsedImages,
          location: `${retail.city || "Unknown"}, ${retail.state || ""}`,
          description: `${vehicle.make || ""} ${vehicle.model || ""} ${
            vehicle.trim || ""
          } — ${vehicle.engine || "N/A"} engine, ${vehicle.transmission || ""}`,
          insuranceEstimate: Math.round((retail.price || 10000) * 0.12),
          maintenanceNote: `Overall Rating: ${
            ratings.overallRating?.toFixed(2) || "N/A"
          } / 5`,
          ratings,
          history,
          dealer: retail.dealer,
          listing: retail.listing,
          exteriorColor: vehicle.exteriorColor,
          interiorColor: vehicle.interiorColor,
          drivetrain: vehicle.drivetrain,
          transmission: vehicle.transmission,
          fuel: vehicle.fuel,
        };
      }
    );
  } catch (err) {
    console.error("❌ Fetch failed:", err);
    if (err instanceof Error) {
      console.error("❌ Error details:", err.message, err.stack);
    }
    return [];
  }
};

const CarListings: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    year: "",
    maxPrice: "",
  });
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: string; content: string}>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);

      try {
        const stored = localStorage.getItem("profile");

        let state = "NJ";
        let budget = 50000;
        let primaryUse = "Sedan";

        if (stored) {
          const profile = JSON.parse(stored);
          state = profile.location.state ? "NJ" : "CA";
          budget = Number(profile.budget.max) || 50000;
          primaryUse = profile.comfort.level || "Sedan";
        }

        const data = await fetchListings(state, budget, primaryUse);
        setCars(data);
      } catch (err) {
        console.error("Error loading listings:", err);
      }

      setLoading(false);
    };

    loadCars();
  }, []);

  // Carousel auto-slide
  useEffect(() => {
    if (!selectedCar) return;
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);

    autoSlideRef.current = setInterval(() => {
      setCurrentImage((prev) =>
        selectedCar.images.length
          ? (prev + 1) % selectedCar.images.length
          : 0
      );
    }, 4000);

    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [selectedCar]);

  // Reset chat when car changes
  useEffect(() => {
    if (selectedCar) {
      setChatMessages([]);
      setChatInput("");
      setChatSidebarOpen(false); // Close sidebar when switching cars
    }
  }, [selectedCar]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!selectedCar || !chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    // Add user message to chat
    const newMessages = [...chatMessages, { role: "user", content: userMessage }];
    setChatMessages(newMessages);

    try {
      const response = await fetch("http://localhost:8000/listings/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          car: selectedCar,
          messageHistory: newMessages,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setChatMessages(data.messageHistory || newMessages);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

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
    <div className="listings-page">
      {/* Filter Bar */}
      <div className="filter-bar">
        <h2>
          <CarIcon size={22} style={{ marginRight: "8px" }} />
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
              value={(filters as any)[key]}
              onChange={(e) =>
                setFilters({ ...filters, [key]: e.target.value })
              }
            />
          ))}
        </div>
      </div>

      {/* Listings */}
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
              onClick={() => {
                setSelectedCar(car);
                setCurrentImage(0);
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
                  <Gauge size={14} style={{ marginRight: "5px" }} />
                  {car.mileage.toLocaleString()} mi • <MapPin size={14} />{" "}
                  {car.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedCar && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCar(null)}
        >
          <div className={`modal ${chatSidebarOpen ? "chat-sidebar-open" : ""}`} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCar(null)}>
              <X />
            </button>
            
            {/* Chat Sidebar Toggle Button */}
            <button 
              className="chat-toggle-btn"
              onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
              title={chatSidebarOpen ? "Close chat" : "Open chat"}
            >
              {chatSidebarOpen ? <ChevronRightIcon size={20} /> : <MessageCircle size={20} />}
            </button>

            {/* Main Content */}
            <div className="modal-main-content">
              {/* Carousel */}
              <div className="image-carousel-container">
                <div
                  className="image-carousel"
                  style={{
                    transform: `translateX(-${currentImage * 100}%)`,
                  }}
                >
                  {selectedCar.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${selectedCar.make}-${i}`}
                      className="carousel-image"
                    />
                  ))}
                </div>

                <button
                  className="carousel-btn carousel-btn-left"
                  onClick={() =>
                    setCurrentImage(
                      currentImage === 0
                        ? selectedCar.images.length - 1
                        : currentImage - 1
                    )
                  }
                >
                  <ChevronLeft />
                </button>
                <button
                  className="carousel-btn carousel-btn-right"
                  onClick={() =>
                    setCurrentImage(
                      (currentImage + 1) % selectedCar.images.length
                    )
                  }
                >
                  <ChevronRight />
                </button>

                <div className="carousel-indicators">
                  {selectedCar.images.map((_, i) => (
                    <button
                      key={i}
                      className={`indicator ${
                        currentImage === i ? "active" : ""
                      }`}
                      onClick={() => setCurrentImage(i)}
                    />
                  ))}
                </div>
              </div>
              {/* Info Section */}
              <div className="modal-columns">
                <div className="car-details">
                <h2>
                  {selectedCar.year} {selectedCar.make} {selectedCar.model}
                </h2>
                <p className="modal-price">
                  ${selectedCar.price.toLocaleString()}
                </p>
                <p className="modal-detail">
                  <MapPin size={14} /> {selectedCar.location} •{" "}
                  <Gauge size={14} /> {selectedCar.mileage.toLocaleString()} mi
                </p>
                <p className="description">{selectedCar.description}</p>

                {selectedCar.listing && (
                  <a
                    href={selectedCar.listing}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="listing-link"
                  >
                    View Full Listing
                  </a>
                )}
                {selectedCar.dealer && (
                  <p>
                    <Building2 size={14} /> Dealer: {selectedCar.dealer}
                  </p>
                )}

                <div className="vehicle-meta">
                  <p>
                    <Settings size={14} /> {selectedCar.transmission}
                  </p>
                  <p>
                    <Fuel size={14} /> {selectedCar.fuel}
                  </p>
                  <p>
                    <PaintBucket size={14} /> Exterior:{" "}
                    {selectedCar.exteriorColor}
                  </p>
                  <p>Interior: {selectedCar.interiorColor}</p>
                </div>

                {selectedCar.history && (
                  <div className="history-section">
                    <h3>
                      <History size={16} /> Vehicle History
                    </h3>
                    <ul>
                      <li>
                        Accidents: {selectedCar.history.accidentCount ?? "N/A"}
                      </li>
                      <li>
                        Owner Count: {selectedCar.history.ownerCount ?? "N/A"}
                      </li>
                      <li>
                        One Owner: {selectedCar.history.oneOwner ? "Yes" : "No"}
                      </li>
                      <li>
                        Personal Use:{" "}
                        {selectedCar.history.personalUse ? "Yes" : "No"}
                      </li>
                      <li>
                        Usage Type: {selectedCar.history.usageType ?? "N/A"}
                      </li>
                    </ul>
                  </div>
                )}
                </div>

              {/* Ratings & Insights */}
              <div className="car-ratings">
                {selectedCar.ratings && (
                  <div className="ratings-section">
                    <h3>
                      <Star size={16} /> Ratings
                    </h3>
                    <ul>
                      <li>
                        Deal:{" "}
                        {selectedCar.ratings.dealRating?.toFixed(2) || "N/A"}
                      </li>
                      <li>
                        Fuel Economy:{" "}
                        {selectedCar.ratings.fuelEconomyRating?.toFixed(2) ||
                          "N/A"}
                      </li>
                      <li>
                        Maintenance:{" "}
                        {selectedCar.ratings.maintenanceRating?.toFixed(2) ||
                          "N/A"}
                      </li>
                      <li>
                        Safety:{" "}
                        {selectedCar.ratings.safetyRating?.toFixed(2) || "N/A"}
                      </li>
                      <li>
                        Owner Satisfaction:{" "}
                        {selectedCar.ratings.ownerSatisfactionRating?.toFixed(
                          2
                        ) || "N/A"}
                      </li>
                      <li>
                        <strong>
                          Overall:{" "}
                          {selectedCar.ratings.overallRating?.toFixed(2) ||
                            "N/A"}
                        </strong>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="insight-box">
                  <Info size={16} /> <span>{selectedCar.maintenanceNote}</span>
                  <p>
                    <Shield size={14} /> Insurance Estimate: $
                    {selectedCar.insuranceEstimate.toLocaleString()}/yr
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* AI Chat Sidebar */}
            <div className={`chat-sidebar ${chatSidebarOpen ? "open" : ""}`}>
              <div className="chat-sidebar-header">
                <h3>
                  <MessageCircle size={18} /> Ask AI About This Car
                </h3>
                <button 
                  className="chat-sidebar-close"
                  onClick={() => setChatSidebarOpen(false)}
                  title="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="chat-sidebar-content">
                <div className="chat-messages">
                  {chatMessages.length === 0 ? (
                    <div className="chat-placeholder">
                      <MessageCircle size={32} />
                      <p>Start a conversation about this car!</p>
                      <p className="chat-suggestions">
                        Try asking: "Is this a good deal?" or "What should I know about this car?"
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`chat-message ${
                          msg.role === "user" ? "user-message" : "ai-message"
                        }`}
                      >
                        <div className="message-content">{msg.content}</div>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="chat-message ai-message">
                      <div className="message-content">
                        <span className="typing-indicator">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask about this car..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    disabled={chatLoading}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarListings;
