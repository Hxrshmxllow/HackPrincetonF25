import { Car, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function NavBar() {
  const navigate = useNavigate();
  const hasProfile = localStorage.getItem("profile");

  return (
    <nav className="navbar">
      <div className="logo">
        <Car size={28} />
        <span>CarFacts</span>
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
    </nav>
  );
}

export default NavBar;
