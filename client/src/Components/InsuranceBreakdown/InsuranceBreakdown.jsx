import React from "react";
import "./InsuranceBreakdown.css";
import { Star } from "lucide-react";

function InsuranceBreakdown({ car }) {
  if (!car) return null;

  const insurers = [
    { name: "GEICO", logo: "https://logo.clearbit.com/geico.com" },
    { name: "State Farm", logo: "https://logo.clearbit.com/statefarm.com" },
    { name: "Progressive", logo: "https://logo.clearbit.com/progressive.com" },
    { name: "Allstate", logo: "https://logo.clearbit.com/allstate.com" },
    { name: "USAA", logo: "https://logo.clearbit.com/usaa.com" },
  ];
  const insurer = insurers[car.id % insurers.length];

  return (
    <div className="insight-box">
      {/* Rating */}
      <div className="rating-display">
        <Star size={16} fill="#fbbf24" color="#fbbf24" />
        <span className="rating-text">{car.maintenanceNote}</span>
      </div>

      {/* Insurance */}
      <div className="insurance-display">
        <span className="insurance-label">Insurance Estimate</span>
        <span className="insurance-amount">
          ${car.insuranceMonthly?.toLocaleString()}/mo
        </span>
        <span className="insurance-annual">
          (${car.insuranceEstimate?.toLocaleString()}/yr)
        </span>
        <span className="insurance-suggestion">
          Better rates may be available at{" "}
          {insurer && (
            <>
              <img
                src={insurer.logo}
                alt={insurer.name}
                className="insurer-logo"
                onError={(e) => (e.target.style.display = "none")}
              />
              {insurer.name}
            </>
          )}
        </span>
      </div>

      {/* Breakdown (if available) */}
      {car.insuranceBreakdown && (
        <div className="insurance-breakdown">
          <h4 className="breakdown-title">Cost Factors</h4>
          <div className="factor-list">
            {[
              { label: "Location", value: car.insuranceBreakdown.locationMultiplier },
              { label: "Make/Brand", value: car.insuranceBreakdown.makeMultiplier },
              { label: "Body Style", value: car.insuranceBreakdown.bodyStyleMultiplier },
              { label: "Engine Size", value: car.insuranceBreakdown.engineMultiplier },
              { label: "Vehicle Age", value: car.insuranceBreakdown.ageMultiplier },
              { label: "Mileage", value: car.insuranceBreakdown.mileageMultiplier },
              { label: "Accidents", value: car.insuranceBreakdown.accidentMultiplier },
            ]
              .filter((f) => f.value && Math.abs((f.value - 1) * 100) >= 2)
              .map((f) => {
                const impact = (f.value - 1) * 100;
                const isIncrease = impact > 0;
                return (
                  <div key={f.label} className="factor-item">
                    <span className="factor-label">{f.label}</span>
                    <div className="factor-bar-container">
                      <div
                        className={`factor-bar ${
                          isIncrease ? "increase" : "decrease"
                        }`}
                        style={{ width: `${Math.min(Math.abs(impact), 100)}%` }}
                      />
                    </div>
                    <span
                      className={`factor-value ${
                        isIncrease ? "increase" : "decrease"
                      }`}
                    >
                      {impact > 0 ? "+" : ""}
                      {impact.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export default InsuranceBreakdown;
