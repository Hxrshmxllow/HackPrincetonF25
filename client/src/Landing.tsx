import { useState } from "react";
import { motion } from "framer-motion";
import { Car, MessageCircle, TrendingUp, ShieldCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import "./App.css";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
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

      <Navbar fixed={true} onSignInClick={() => setShowAuth(true)} />

      <section className="hero">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          The world's most honest car dealer.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Discover the smartest way to buy your next car. Get real insights,
          pricing predictions, and expert-level conversations — all personalized for you.
        </motion.p>

        <motion.button
          className="cta"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          onClick={() => {
            if (user) {
              navigate(hasProfile ? "/listings" : "/setup");
            } else {
              setShowAuth(true);
            }
          }}
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
          <MessageCircle size={36} color="#eab308" />
          <h3>AI Chat Assistant</h3>
          <p>
            Chat with our AI-powered virtual car dealer to get personalized
            recommendations, ask questions, and find the perfect car for you.
          </p>
        </div>

        <div className="card">
          <TrendingUp size={36} color="#16a34a" />
          <h3>Price & Negotiation Guide</h3>
          <p>
            Our algorithm estimates depreciation and insurance costs for each car, helping you make a more informed decision.
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
