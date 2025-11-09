import React, { useState, useEffect } from "react";
import "./ModernCarousel.css";

function ModernCarousel({ images = [] }) {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="modern-carousel">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <img key={i} src={src} alt={`slide-${i}`} />
        ))}
      </div>

      <div className="carousel-dots">
        {images.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default ModernCarousel;
