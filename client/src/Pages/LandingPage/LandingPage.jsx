import { motion } from "framer-motion";
import { Car, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const hasProfile = localStorage.getItem("profile");

  return (
    <div className="page">
      <NavBar />

      {/* Hero Section */}
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

      {/* Feature Cards */}
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

      {/* Trust Section */}
      <section className="trust">
        <ShieldCheck size={40} color="white" />
        <h2>Trusted by Smart Car Buyers Nationwide</h2>
        <p>
          Data you can trust. Insights that matter. Decisions you'll feel good
          about.
        </p>
      </section>

        <Footer />
    </div>
  );
}

export default LandingPage;
