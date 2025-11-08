import { useNavigate } from "react-router-dom";
import { Car, User, SlidersHorizontal } from "lucide-react";
import "./SearchResults.css";

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const hasProfile = localStorage.getItem("profile");

  return (
    <div className="search-page">
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/")}>
          <Car size={28} />
          <span>CarInsight</span>
        </div>
        <div className="nav-actions">
          <button className="filter-btn">
            <SlidersHorizontal size={20} />
            Filters
          </button>
          {hasProfile && (
            <button className="profile-icon" onClick={() => navigate("/profile")}>
              <User size={24} />
            </button>
          )}
        </div>
      </nav>

      <div className="search-container">
        <div className="search-header">
          <h1>Find Your Perfect Car</h1>
          <p>Showing results based on your preferences</p>
        </div>

        <div className="results-grid">
          {/* Car listings will be populated here */}
          <div className="empty-state">
            <Car size={64} color="#9ca3af" />
            <h2>Ready to show you cars!</h2>
            <p>Car listings will appear here once integrated with the cars.com API</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
