import React, { useState, useEffect } from "react";
import "./AiCarAnalysis.css";
import { Brain, Loader2 } from "lucide-react";

function AiCarAnalysis({ car }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!car) return;

    const fetchAiAnalysis = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://127.0.0.1:8000/ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(car),
        });

        if (!response.ok) throw new Error("Failed to get AI analysis");

        const data = await response.json();
        setAnalysis(data.aiAnalysis);
      } catch (err) {
        console.error("AI fetch error:", err);
        setError("Unable to analyze this car right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAiAnalysis();
  }, [car]);

  return (
    <div className="ai-analysis">
      <div className="ai-header">
        <Brain size={20} />
        <h3>AI Vehicle Insight</h3>
      </div>

      {loading && (
        <div className="ai-loading">
          <Loader2 className="spin" size={20} />
          <p>Analyzing this listing...</p>
        </div>
      )}

      {error && <p className="ai-error">{error}</p>}

      {!loading && !error && analysis && (
        <div className="ai-body">
          <p className="ai-summary">{analysis.summary}</p>

          <div className="ai-section">
            <h4>✅ Pros</h4>
            <ul>{analysis.pros?.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>

          <div className="ai-section">
            <h4>⚠️ Cons</h4>
            <ul>{analysis.cons?.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>

          <div className="ai-section">
            <h4>💬 Competitor Comparison</h4>
            <p>{analysis.competitorComparison}</p>
          </div>

          <div className="ai-section">
            <h4>🔧 Common Issues</h4>
            <ul>{analysis.commonIssues?.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
          </div>

          <div className="ai-section">
            <h4>👤 Ideal Buyer</h4>
            <p>{analysis.idealBuyer}</p>
          </div>

          <div className="ai-section verdict">
            <h4>🏁 Verdict</h4>
            <p>{analysis.verdict}</p>
          </div>

          <div className="ai-confidence">
            <span>Model Confidence: {(analysis.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiCarAnalysis;
