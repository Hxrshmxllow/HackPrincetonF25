import { useState, useEffect, useMemo } from "react";
import { Save, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { carMakes, carModels } from "./carData";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Navbar from "./Navbar";
import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
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
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        // When logged in, only use Firestore (don't fall back to localStorage)
        try {
          const docRef = doc(db, "profiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as typeof profile);
          }
          // If document doesn't exist, leave profile empty (new user)
        } catch (err) {
          console.error("Error loading profile:", err);
          // Don't fall back to localStorage - it might be from another user
        }
      } else {
        // Only use localStorage when NOT logged in
        const saved = localStorage.getItem("profile");
        if (saved) setProfile(JSON.parse(saved));
      }
    };
    loadProfile();
  }, [user]);

  const availableModels = useMemo(() => {
    return profile.make ? carModels[profile.make] || [] : [];
  }, [profile.make]);

  const validate = () => {
    if (!profile.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (profile.budgetMin && profile.budgetMax && Number(profile.budgetMin) > Number(profile.budgetMax)) {
      setError("Min budget must be less than max budget");
      return false;
    }
    if (profile.yearMin && profile.yearMax && Number(profile.yearMin) > Number(profile.yearMax)) {
      setError("Min year must be less than max year");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    if (!validate()) return;
    if (user) {
      // When logged in, only save to Firestore (don't save to localStorage)
      try {
        await setDoc(doc(db, "profiles", user.uid), {
          ...profile,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error saving profile:", err);
        throw err; // Don't silently fail
      }
    } else {
      // Only use localStorage when NOT logged in
      localStorage.setItem("profile", JSON.stringify(profile));
    }
    setSuccess(true);
    setTimeout(() => navigate("/"), 1000);
  };

  const update = (field: string, value: string) => {
    setError("");
    setSuccess(false);
    if (field === "make") {
      setProfile({ ...profile, make: value, model: "" });
    } else {
      setProfile({ ...profile, [field]: value });
    }
  };

  return (
    <div className="profile-page">
      {/* Animated Gradient Background */}
      <div className="gradient-bg">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <Navbar fixed={false} />

      <div className="profile-container">
        <h1>Your Profile</h1>

        <div className="fields">
          <div className="field full-span">
            <label>Full Name *</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter your name..."
            />
          </div>

          <div className="field">
            <label>Budget Min ($)</label>
            <input
              type="number"
              value={profile.budgetMin}
              onChange={(e) => update("budgetMin", e.target.value)}
              placeholder="e.g., 10000"
              min="0"
            />
          </div>

          <div className="field">
            <label>Budget Max ($)</label>
            <input
              type="number"
              value={profile.budgetMax}
              onChange={(e) => update("budgetMax", e.target.value)}
              placeholder="e.g., 50000"
              min="0"
            />
          </div>

          <div className="field">
            <label>Car Make</label>
            <input
              list="makes-list-profile"
              value={profile.make}
              onChange={(e) => update("make", e.target.value)}
              placeholder="Type to search makes..."
              autoComplete="off"
            />
            <datalist id="makes-list-profile">
              {carMakes.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>

          <div className="field">
            <label>Car Model</label>
            {profile.make && availableModels.length > 0 ? (
              <select value={profile.model} onChange={(e) => update("model", e.target.value)}>
                <option value="">Any Model (Optional)</option>
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value=""
                disabled
                placeholder="Select make first..."
                className="disabled-field"
              />
            )}
          </div>

          <div className="field">
            <label>ZIP Code</label>
            <input
              type="text"
              value={profile.zipCode}
              onChange={(e) => update("zipCode", e.target.value)}
              placeholder="Enter ZIP code..."
              maxLength={5}
            />
          </div>

          <div className="field">
            <label>Model Year Min</label>
            <input
              type="number"
              value={profile.yearMin}
              onChange={(e) => update("yearMin", e.target.value)}
              placeholder="e.g., 2015"
              min="1990"
              max="2025"
            />
          </div>

          <div className="field">
            <label>Model Year Max</label>
            <input
              type="number"
              value={profile.yearMax}
              onChange={(e) => update("yearMax", e.target.value)}
              placeholder="e.g., 2024"
              min="1990"
              max="2025"
            />
          </div>

          <div className="field full-span">
            <label>Comfort Level</label>
            <select value={profile.comfortLevel} onChange={(e) => update("comfortLevel", e.target.value)}>
              <option value="">Select Comfort Level</option>
              <option value="sports">Sports Car - Performance-focused, agile handling</option>
              <option value="luxury">Luxury - Premium comfort, high-end features</option>
              <option value="suv">SUV/Crossover - Spacious, higher seating, versatile</option>
              <option value="sedan">Sedan - Balanced comfort and efficiency</option>
              <option value="truck">Truck - Rugged, utility-focused, towing</option>
              <option value="compact">Compact/Economy - Fuel-efficient, easy parking</option>
              <option value="minivan">Minivan - Family-friendly, maximum space</option>
              <option value="electric">Electric/Hybrid - Eco-friendly, modern tech</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✓ Profile saved successfully!</span>
          </div>
        )}

        <button onClick={handleSave} className="save-btn">
          <Save size={20} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
