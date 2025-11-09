import React, { useState, useEffect, useRef } from "react";
import "./CarModal.css";
import { X, MessageCircle } from "lucide-react";
import ChatSidebar from "../ChatSideBar/ChatSideBar";
import CarDetails from "../CarDetails/CarDetails";
import DepreciationChart from "../DepreciationChart/DepreciationChart";
import RatingsSection from "../RatingsSection/RatingsSection";
import InsuranceBreakdown from "../InsuranceBreakdown/InsuranceBreakdown";
import ModernCarousel from "../ModernCarousel/ModernCarousel";
import AICarAnalysis from "../AICarAnalysis/AICarAnalysis";
import CheckListButton from "../CheckListButton/CheckListButton";

function CarModal({ car, onClose }) {
  const [chatOpen, setChatOpen] = useState(false);
  const modalRef = useRef(null);

  // ✅ Scroll modal to top on open
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [car]); // runs whenever a new car is selected

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}  // attach ref here
        className={`modal ${chatOpen ? "chat-open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>
        <button
          className="chat-toggle-btn"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <MessageCircle />
        </button>

        <div className="modal-carousel-wrapper">
          <ModernCarousel images={car.images || [car.image]} />
        </div>

        <div className="modal-main">
          <div className="modal-columns">
            <CarDetails car={car} />
            <DepreciationChart car={car} />
            <RatingsSection car={car} />
            <InsuranceBreakdown car={car} />
            <AICarAnalysis car={car} />
            <CheckListButton car={car} />
          </div>
        </div>

        <ChatSidebar
          open={chatOpen}
          car={car}
          onClose={() => setChatOpen(false)}
        />
      </div>
    </div>
  );
}

export default CarModal;
