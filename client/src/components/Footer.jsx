import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '1rem', textDecoration: 'none' }}>
              <ShoppingBag className="icon-primary" size={28} />
              <span className="logo-text">Boutique</span>
            </Link>
            <p className="footer-description">
              Elevating everyday aesthetics. Premium quality clothing designed for the modern individual.
            </p>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram"><FaInstagram size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter"><FaTwitter size={18} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook"><FaFacebook size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Departments</h4>
            <Link to="/women" className="footer-link">Women's Fashion</Link>
            <Link to="/men" className="footer-link">Men's Apparel</Link>
            <Link to="/new-arrivals" className="footer-link">New Arrivals</Link>
            <Link to="/sale" className="footer-link">Special Offers & Sale</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Customer Care</h4>
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/about" className="footer-link">About Ghana Boutique</Link>
            <Link to="/about" className="footer-link">Regional Delivery Info</Link>
            <Link to="/contact" className="footer-link">MTN MoMo & Card Help</Link>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4 className="footer-heading">Boutique VIP Club</h4>
            <p className="footer-description" style={{ marginBottom: '1rem' }}>
              Subscribe for exclusive drops, VIP promo codes, and luxury fashion updates in Ghana.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Boutique Ghana. All rights reserved. Express Regional Delivery (GH₵).</p>
          <div className="footer-bottom-links">
            <Link to="/about">Privacy Policy</Link>
            <Link to="/contact">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
