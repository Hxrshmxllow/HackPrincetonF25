import { useState } from "react";
import { motion } from "framer-motion";
import { Car, AlertTriangle, TrendingUp, ShieldCheck, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./App.css";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const hasProfile = user || localStorage.getItem("profile");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      setShowAuth(false);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="page">
      {/* Animated Gradient Background */}
      <div className="gradient-bg">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          <Car size={28} />
          <span>CarInsight</span>
        </div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Contact</a>
        </div>
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
            <button className="nav-btn" onClick={() => setShowAuth(true)}>
              Sign In
            </button>
            <button className="nav-btn" onClick={() => navigate("/setup")} style={{ marginLeft: "8px" }}>
              Get Started
            </button>
          </>
        )}
      </nav>

      <section className="hero">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Drive Smarter. Buy Confidently.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Discover the smartest way to buy your next car. Get real insights,
          pricing predictions, and scam alerts — all personalized for you.
        </motion.p>

        <motion.button
          className="cta"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          onClick={() => navigate(hasProfile ? "/listings" : "/setup")}
        >
          Start Your Search
        </motion.button>
      </section>

      <section className="features">
        <div className="card">
          <Car size={36} color="#2563eb" />
          <h3>Smart Car Insights</h3>
          <p>
            See maintenance history, known issues, and real-world reliability
            scores for every make and model.
          </p>
        </div>

        <div className="card">
          <AlertTriangle size={36} color="#eab308" />
          <h3>Scam Detection</h3>
          <p>
            We flag suspicious listings and show hidden red flags before you
            make your purchase.
          </p>
        </div>

        <div className="card">
          <TrendingUp size={36} color="#16a34a" />
          <h3>Price & Negotiation Guide</h3>
          <p>
            Our algorithm estimates fair market value and helps you negotiate
            with confidence.
          </p>
        </div>
      </section>

      <section className="trust">
        <ShieldCheck size={40} color="white" />
        <h2>Trusted by Smart Car Buyers Nationwide</h2>
        <p>
          Data you can trust. Insights that matter. Decisions you'll feel good
          about.
        </p>
      </section>

      <footer className="footer">
        <span>
          © {new Date().getFullYear()} CarInsight — Empowering Smarter Car
          Ownership
        </span>
      </footer>

      {showAuth && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "400px",
            width: "90%"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              {authError && <p style={{ color: "red", marginBottom: "1rem" }}>{authError}</p>}
              <button type="submit" style={{
                width: "100%",
                padding: "0.75rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginBottom: "0.5rem"
              }}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{
                width: "100%",
                padding: "0.5rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#2563eb"
              }}>
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
