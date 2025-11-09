import React, { useEffect, useState } from "react";
import "./InsuranceBreakdown.css";
import { Star, Loader2 } from "lucide-react";

function InsuranceBreakdown({ car }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const insurers = [
    { name: "GEICO", logo: "https://logo.clearbit.com/geico.com" },
    { name: "State Farm", logo: "https://logo.clearbit.com/statefarm.com" },
    { name: "Progressive", logo: "https://logo.clearbit.com/progressive.com" },
    { name: "Allstate", logo: "https://logo.clearbit.com/allstate.com" },
    { name: "USAA", logo: "https://logo.clearbit.com/usaa.com" },
  ];
  const insurer = insurers[car.id % insurers.length];

  // 🔥 Fetch AI Insurance Breakdown
  useEffect(() => {
    if (!car) return;
    const fetchBreakdown = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://127.0.0.1:8000/ai/insurance-breakdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(car),
        });
        if (!response.ok) throw new Error("Failed to fetch insurance breakdown");
        const data = await response.json();
        setBreakdown(data.insuranceBreakdown);
      } catch (err) {
        console.error("❌ Insurance API error:", err);
        setError("Unable to calculate insurance breakdown right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdown();
  }, [car]);

  return (
    <div className="insight-box">
      <div className="rating-display">
        <Star size={16} fill="#fbbf24" color="#fbbf24" />
        <span className="rating-text">{car.maintenanceNote}</span>
      </div>

      {/* ========== INSURANCE HEADER ========== */}
      <div className="insurance-display">
        <span className="insurance-label">Insurance Estimate</span>
        <span className="insurance-amount">
          ${car.insuranceMonthly?.toLocaleString() || "—"}/mo
        </span>
        <span className="insurance-annual">
          (${car.insuranceEstimate?.toLocaleString() || "—"}/yr)
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

      {/* ========== LOADING STATE ========== */}
      {loading && (
        <div className="insurance-loading">
          <Loader2 className="spin" size={20} />
          <p>Calculating detailed insurance breakdown...</p>
        </div>
      )}

      {/* ========== ERROR STATE ========== */}
      {error && <p className="insurance-error">{error}</p>}

      {/* ========== BREAKDOWN DATA ========== */}
      {breakdown && !loading && (
        <div className="insurance-breakdown">
          <h4 className="breakdown-title">Cost Factors</h4>
          <div className="factor-list">
            {[
              { label: "Location", value: breakdown.locationMultiplier },
              { label: "Make/Brand", value: breakdown.makeMultiplier },
              { label: "Body Style", value: breakdown.bodyStyleMultiplier },
              { label: "Engine Size", value: breakdown.engineMultiplier },
              { label: "Vehicle Age", value: breakdown.ageMultiplier },
              { label: "Mileage", value: breakdown.mileageMultiplier },
              { label: "Accidents", value: breakdown.accidentMultiplier },
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

          <div className="explanation-section">
            <h5>AI Insights</h5>
            <ul>
              {Object.entries(breakdown.explanation || {}).map(([k, v]) => (
                <li key={k}>
                  <strong>{k.charAt(0).toUpperCase() + k.slice(1)}:</strong> {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default InsuranceBreakdown;
