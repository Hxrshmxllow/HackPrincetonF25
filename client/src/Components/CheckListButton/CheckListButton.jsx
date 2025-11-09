import React, { useState } from "react";
import { Loader2, FileDown } from "lucide-react";
import "./CheckListButton.css"; // or wherever your button styles are

function ChecklistButton({ car }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownloadChecklist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/ai/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });

      if (!res.ok) throw new Error("Checklist generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${car.make}_${car.model}_Checklist.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      setError("Failed to generate checklist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checklist-download-container">
      <button
        onClick={handleDownloadChecklist}
        className="btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="spin" size={18} />
            <span>Generating Checklist...</span>
          </>
        ) : (
          <>
            <FileDown size={18} />
            <span>Download Buyer Checklist</span>
          </>
        )}
      </button>

      {error && <p className="ai-error">{error}</p>}
    </div>
  );
}

export default ChecklistButton;
