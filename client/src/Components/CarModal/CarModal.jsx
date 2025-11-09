import React, { useState } from "react";
import "./CarModal.css";
import { X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import ChatSidebar from "../ChatSideBar/ChatSideBar";
import CarDetails from "../CarDetails/CarDetails";
import DepreciationChart from "../DepreciationChart/DepreciationChart";
import RatingsSection from "../RatingsSection/RatingsSection";
import InsuranceBreakdown from "../InsuranceBreakdown/InsuranceBreakdown";

function CarModal({ car, onClose }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${chatOpen ? "chat-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>
        <button className="chat-toggle-btn" onClick={() => setChatOpen(!chatOpen)}>
          <MessageCircle />
        </button>

        <div className="modal-main">
          {/* Carousel */}
          <div className="carousel">
            <button
              className="carousel-btn left"
              onClick={() =>
                setCurrentImage(
                  currentImage === 0 ? car.images.length - 1 : currentImage - 1
                )
              }
            >
              <ChevronLeft />
            </button>
            <img src={car.images[currentImage]} alt={`${car.make}-${car.model}`} />
            <button
              className="carousel-btn right"
              onClick={() =>
                setCurrentImage((currentImage + 1) % car.images.length)
              }
            >
              <ChevronRight />
            </button>
          </div>

          {/* Content */}
          <div className="modal-columns">
            <CarDetails car={car} />
            <DepreciationChart car={car} />
            <RatingsSection car={car} />
            <InsuranceBreakdown car={car} />
          </div>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar open={chatOpen} car={car} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}

export default CarModal;
