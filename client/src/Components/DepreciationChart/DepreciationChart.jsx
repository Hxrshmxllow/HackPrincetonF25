import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingDown } from "lucide-react";
import "./DepreciationChart.css";

/**
 * Calculates estimated vehicle value over time using a dual-exponential model.
 */
function calculateDepreciation(currentPrice, currentAge, baseMsrp) {
  const alpha = 0.7;
  const beta = 0.5;
  const gamma = 0.08;

  let V0;
  if (baseMsrp && baseMsrp > currentPrice) {
    V0 = baseMsrp;
  } else {
    const depreciationFactor =
      alpha * Math.exp(-beta * currentAge) +
      (1 - alpha) * Math.exp(-gamma * currentAge);
    V0 = (currentPrice - currentPrice * 0.15) / depreciationFactor;
  }

  const S = V0 * 0.15; // Salvage value ~15%
  const maxAge = Math.max(15, currentAge + 10);

  return Array.from({ length: maxAge + 1 }, (_, t) => {
    const value =
      V0 *
        (alpha * Math.exp(-beta * t) + (1 - alpha) * Math.exp(-gamma * t)) +
      S;
    return {
      year: t,
      value: Math.round(value),
      isCurrent: t === currentAge,
    };
  });
}

/**
 * Renders a value depreciation chart for a given car.
 */
function DepreciationChart({ car }) {
  if (!car) return null;

  const currentAge = new Date().getFullYear() - car.year;
  const data = calculateDepreciation(car.price, currentAge, car.baseMsrp);

  return (
    <div className="depreciation-section">
      <h3 className="depreciation-title">
        <TrendingDown size={18} /> Value Over Time
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            label={{
              value: "Vehicle age (years)",
              position: "insideBottom",
              offset: -5,
              fontSize: 12,
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(val) => [`$${val.toLocaleString()}`, "Est. Value"]}
            labelFormatter={(label) => `${label} yrs old`}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return payload.isCurrent ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ) : null;
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="depreciation-note">
        <span className="dot" /> Current age: {currentAge} yrs • Est. value{" "}
        <strong>${car.price.toLocaleString()}</strong>
      </p>
    </div>
  );
}

export default DepreciationChart;
