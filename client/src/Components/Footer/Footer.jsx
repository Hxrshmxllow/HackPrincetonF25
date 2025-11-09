import React from "react";
import "./Footer.css"; // or create a separate Footer.css if you prefer

function Footer() {
  return (
    <footer className="footer">
      <span>
        © {new Date().getFullYear()} CarInsight — Empowering Smarter Car Ownership
      </span>
    </footer>
  );
}

export default Footer;