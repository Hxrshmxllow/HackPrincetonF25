import React from "react";
import { Star } from "lucide-react";
import "./RatingsSection.css";

function RatingsSection({ car }) {
  if (!car?.ratings) return null;

  const { ratings, maintenanceNote } = car;

  const ratingFields = [
    { label: "Deal", value: ratings.dealRating },
    { label: "Fuel Economy", value: ratings.fuelEconomyRating },
    { label: "Maintenance", value: ratings.maintenanceRating },
    { label: "Safety", value: ratings.safetyRating },
    { label: "Owner Satisfaction", value: ratings.ownerSatisfactionRating },
  ];

  return (
    <div className="ratings-section">
      <h3 className="ratings-title">
        <Star size={18} color="#fbbf24" fill="#fbbf24" />
        Ratings & Insights
      </h3>

      <ul className="ratings-list">
        {ratingFields.map((field) => (
          <li key={field.label} className="rating-item">
            <span className="rating-label">{field.label}</span>
            <span className="rating-value">
              {field.value ? field.value.toFixed(2) : "N/A"}
            </span>
          </li>
        ))}

        <li className="rating-item overall">
          <span className="rating-label">Overall</span>
          <span className="rating-value strong">
            {ratings.overallRating ? ratings.overallRating.toFixed(2) : "N/A"}
          </span>
        </li>
      </ul>

      <div className="rating-summary">
        <Star size={16} fill="#fbbf24" color="#fbbf24" />
        <span>{maintenanceNote}</span>
      </div>
    </div>
  );
}

export default RatingsSection;
