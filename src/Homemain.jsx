import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";
import { useNavigate } from "react-router-dom";
const Homemain = () => {
  const phoneNumber = "917032350441"; // replace with your number (no +, no spaces)

  const handleWhatsApp = () => {
    const message = `Hello RR Mobile Solutions 👋

I would like to book a repair appointment.

Device:
Issue:
Preferred Date:
Preferred Time:
location:

Please confirm availability.`;

    const encodedMessage = encodeURIComponent(message);

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };
  const navigate = useNavigate();
 const handleContact = () => {
  navigate("/home/support");
};


  return (
    <>
      <section className="hero-wrapper">
        {/* LEFT */}
        <div className="hero-left">
          <div className="hero-left-overlay">
            <div className="hero-content">
              <p className="hero-tag">RR MOBILE SOLUTIONS</p>

              <h1 className="hero-title">
                Trusted Door Step Mobile Services
              </h1>

              <p className="hero-subtitle">
                Screen replacement, battery issues, software problems, water
                damage, and complete mobile repair support at affordable prices.
              </p>

              <div className="hero-buttons">
                <button onClick={handleWhatsApp} className="book-btn">
                  Book Appointment
                </button>

                <button onClick={handleContact} className="hero-btn secondary-btn">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-right">
          <div className="hero-right-overlay">
            <div className="shop-card">
              <p className="shop-tag">SHOP ONLINE</p>

              <h2 className="shop-title">
                Mobile Accessories
                <br />
                &amp; Electronics
              </h2>

              <p className="shop-subtitle">
                Explore chargers, earphones, cases, power banks, smart gadgets,
                and essential electronics at great prices.
              </p>

              <Link to="/home/products" className="shop-btn-link">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>RR MOBILE SOLUTIONS</h2>
            <p>
              Fast mobile repair services, trusted accessories, and quality
              electronics for everyday needs.
            </p>
          </div>



          <div className="footer-links">
            <h3>Services</h3>
            <ul>
              <li>Screen Replacement</li>
              <li>Battery Repair</li>
              <li>Software Fixes</li>
              <li>Accessories</li>
              <li>Electronics</li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact</h3>
            <p>Pedagantyada, Opp Banglore Iyengar Bakery, Visakhapatnam, Andhra Pradesh</p>
            <p>+91 7032350441</p>
            <p>rrmobilessolutions2629@gmail.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 RR Mobile Solutions. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Homemain;