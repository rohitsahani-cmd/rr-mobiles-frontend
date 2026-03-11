import React from "react";
import './Support.css'
const Support = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>

      <div className="contact-card">
        <p><strong>Phone:</strong> +91 7032350441</p>
        <p><strong>Email:</strong> rrmobilessolutions2629@gmail.com</p>
        <p><strong>Location:</strong> Visakhapatnam, Andhra Pradesh</p>
      </div>

      <div className="contact-buttons">
        <a 
          href="https://wa.me/917032350441" 
          target="_blank" 
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          Chat on WhatsApp
        </a>

        <a 
          href="tel:+917032350441" 
          className="call-btn"
        >
          Call Now
        </a>
      </div>
    </div>
  );
};

export default Support;