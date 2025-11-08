import { useState, useEffect } from "react";
import { Car, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const labels = ["Name", "Budget Range", "Car Type", "Location", "Primary Use"];

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<string[]>(Array(5).fill(""));
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("profile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem("profile", JSON.stringify(profile));
    navigate("/");
  };

  const updateField = (index: number, value: string) => {
    const updated = [...profile];
    updated[index] = value;
    setProfile(updated);
  };

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/")}>
          <Car size={28} />
          <span>CarInsight</span>
        </div>
      </nav>

      <div className="profile-container">
        <h1>Your Profile</h1>

        <div className="fields">
          {labels.map((label, i) => (
            <div key={i} className="field">
              <label>{label}</label>
              <input
                type="text"
                value={profile[i]}
                onChange={(e) => updateField(i, e.target.value)}
                placeholder={`Enter your ${label.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="save-btn">
          <Save size={20} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
