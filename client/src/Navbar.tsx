import { useNavigate } from "react-router-dom";
import { Car, User } from "lucide-react";
import { useAuth } from "./AuthContext";

interface NavbarProps {
  fixed?: boolean;
  onSignInClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ fixed = false, onSignInClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const hasProfile = user || localStorage.getItem("profile");

  const handleSignInClick = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      navigate("/");
    }
  };

  return (
    <nav className={`navbar ${fixed ? 'navbar-fixed' : 'navbar-static'}`}>
      <div className="logo" onClick={() => navigate("/")}>
        <Car size={28} />
        <span>CarInsight</span>
      </div>
      <div className="nav-links">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
        <a href="#">Features</a>
        <a href="#">Contact</a>
      </div>
      <div className="nav-actions">
        {user ? (
          <>
            <button className="profile-icon" onClick={() => navigate("/profile")}>
              <User size={24} />
            </button>
            <button className="nav-btn" onClick={logout} style={{ marginLeft: "8px" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            {hasProfile && (
              <button className="profile-icon" onClick={() => navigate("/profile")}>
                <User size={24} />
              </button>
            )}
            <button className="nav-btn" onClick={handleSignInClick} style={{ marginLeft: hasProfile ? "8px" : "0" }}>
              Sign In
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

