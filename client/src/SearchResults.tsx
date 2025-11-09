import CarListings from "./CarListings";
import "./SearchResults.css";

const SearchResults: React.FC = () => {
  return (
    <div className="search-page">
      {/* Animated Gradient Background */}
      <div className="gradient-bg">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <CarListings />
    </div>
  );
};

export default SearchResults;
