import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { carMakes, carModels } from "./carData";
import { useAuth } from "./AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./ProfileSetup.css";

const ProfileSetup: React.FC = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    budgetMin: "",
    budgetMax: "",
    make: "",
    model: "",
    zipCode: "",
    yearMin: "",
    yearMax: "",
    comfortLevel: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const availableModels = useMemo(() => {
    return profile.make ? carModels[profile.make] || [] : [];
  }, [profile.make]);

  const validate = () => {
    setError("");
    if (step === 0 && !profile.name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (step === 1) {
      if (!profile.budgetMin || !profile.budgetMax) {
        setError("Please enter both min and max budget");
        return false;
      }
      if (Number(profile.budgetMin) > Number(profile.budgetMax)) {
        setError("Min budget must be less than max budget");
        return false;
      }
    }
    if (step === 2 && !profile.make) {
      setError("Please select a car make");
      return false;
    }
    if (step === 3 && !profile.zipCode.trim()) {
      setError("Please enter your ZIP code");
      return false;
    }
    if (step === 4) {
      if (!profile.yearMin || !profile.yearMax) {
        setError("Please enter both min and max year");
        return false;
      }
      if (Number(profile.yearMin) > Number(profile.yearMax)) {
        setError("Min year must be less than max year");
        return false;
      }
    }
    if (step === 5 && !profile.comfortLevel) {
      setError("Please select a comfort level");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step < 5) setStep(step + 1);
    else {
      if (user) {
        // When logged in, only save to Firestore (don't save to localStorage)
        try {
          await setDoc(doc(db, "profiles", user.uid), {
            ...profile,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error saving profile:", err);
          // Don't silently fail - show error to user
        }
      } else {
        // Only use localStorage when NOT logged in
        localStorage.setItem("profile", JSON.stringify(profile));
      }
      navigate("/");
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) setStep(step - 1);
    else navigate("/");
  };

  const update = (field: string, value: string) => {
    setError("");
    if (field === "make") {
      setProfile({ ...profile, make: value, model: "" });
    } else {
      setProfile({ ...profile, [field]: value });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <h2>What's your full name?</h2>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter your name..."
              autoFocus
            />
          </>
        );
      case 1:
        return (
          <>
            <h2>What's your budget range?</h2>
            <p className="step-description">Enter your minimum and maximum budget in USD</p>
            <div className="range-inputs">
              <div className="input-wrapper">
                <span className="currency">$</span>
                <input
                  type="number"
                  value={profile.budgetMin}
                  onChange={(e) => update("budgetMin", e.target.value)}
                  placeholder="10,000"
                  min="0"
                />
              </div>
              <span className="range-separator">to</span>
              <div className="input-wrapper">
                <span className="currency">$</span>
                <input
                  type="number"
                  value={profile.budgetMax}
                  onChange={(e) => update("budgetMax", e.target.value)}
                  placeholder="50,000"
                  min="0"
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2>What car are you looking for?</h2>
            <p className="step-description">Type or select make, then choose a specific model (optional)</p>
            <input
              list="makes-list"
              value={profile.make}
              onChange={(e) => update("make", e.target.value)}
              placeholder="Type to search makes..."
              className="searchable-select"
              autoComplete="off"
            />
            <datalist id="makes-list">
              {carMakes.map(m => <option key={m} value={m} />)}
            </datalist>
            {profile.make && availableModels.length > 0 && (
              <select
                value={profile.model}
                onChange={(e) => update("model", e.target.value)}
                className="full-width model-select"
              >
                <option value="">Any Model (Optional)</option>
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </>
        );
      case 3:
        return (
          <>
            <h2>What's your location?</h2>
            <p className="step-description">Enter your ZIP code to find cars near you</p>
            <input
              type="text"
              value={profile.zipCode}
              onChange={(e) => update("zipCode", e.target.value)}
              placeholder="Enter ZIP code..."
              maxLength={5}
            />
          </>
        );
      case 4:
        return (
          <>
            <h2>What model years are you interested in?</h2>
            <p className="step-description">Select the range of car years you're considering</p>
            <div className="range-inputs">
              <input
                type="number"
                value={profile.yearMin}
                onChange={(e) => update("yearMin", e.target.value)}
                placeholder="2015"
                min="1990"
                max="2025"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                value={profile.yearMax}
                onChange={(e) => update("yearMax", e.target.value)}
                placeholder="2024"
                min="1990"
                max="2025"
              />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h2>What's your preferred comfort level?</h2>
            <p className="step-description">Select the type of driving experience you're looking for</p>
            <div className="comfort-options">
              {[
                { value: "sports", label: "Sports Car", desc: "Performance-focused, agile handling, thrilling drive" },
                { value: "luxury", label: "Luxury", desc: "Premium comfort, high-end features, refined experience" },
                { value: "suv", label: "SUV/Crossover", desc: "Spacious interior, higher seating, versatile" },
                { value: "sedan", label: "Sedan", desc: "Balanced comfort and efficiency, smooth ride" },
                { value: "truck", label: "Truck", desc: "Rugged, utility-focused, towing capability" },
                { value: "compact", label: "Compact/Economy", desc: "Fuel-efficient, easy parking, affordable" },
                { value: "minivan", label: "Minivan", desc: "Family-friendly, maximum passenger space" },
                { value: "electric", label: "Electric/Hybrid", desc: "Eco-friendly, quiet operation, modern tech" }
              ].map(option => (
                <div
                  key={option.value}
                  className={`comfort-card ${profile.comfortLevel === option.value ? "selected" : ""}`}
                  onClick={() => update("comfortLevel", option.value)}
                >
                  <h3>{option.label}</h3>
                  <p>{option.desc}</p>
                </div>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="setup-page">
      <nav className="navbar">
        <div className="logo">
          <Car size={28} />
          <span>CarInsight</span>
        </div>
      </nav>

      <div className="setup-container">
        <div className="progress">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`dot ${i <= step ? "active" : ""}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="question-container"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="buttons">
          <button onClick={handleBack} className="btn-secondary">
            <ArrowLeft size={20} />
            {step === 0 ? "Home" : "Back"}
          </button>
          <button onClick={handleNext} className="btn-primary">
            {step === 5 ? "Finish" : "Next"}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
