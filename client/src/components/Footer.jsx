import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <div className="navbar-logo" style={{ marginBottom: '1rem' }}>
              <ShoppingBag className="icon-primary" size={28} />
              <span className="logo-text">Boutique</span>
            </div>
            <p className="footer-description">
              Elevating everyday aesthetics. Premium quality clothing designed for the modern individual.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><FaInstagram size={20} /></a>
              <a href="#" className="social-icon"><FaTwitter size={20} /></a>
              <a href="#" className="social-icon"><FaFacebook size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Shop</h4>
            <a href="#" className="footer-link">New Arrivals</a>
            <a href="#" className="footer-link">Best Sellers</a>
            <a href="#" className="footer-link">Sale</a>
            <a href="#" className="footer-link">Collections</a>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Help</h4>
            <a href="#" className="footer-link">FAQ</a>
            <a href="#" className="footer-link">Shipping & Returns</a>
            <a href="#" className="footer-link">Track Order</a>
            <a href="#" className="footer-link">Contact Us</a>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4 className="footer-heading">Join Our Newsletter</h4>
            <p className="footer-description" style={{ marginBottom: '1rem' }}>
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="newsletter-input" />
              <button type="submit" className="newsletter-btn">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Boutique. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
