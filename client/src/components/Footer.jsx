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
            <h4 className="footer-heading">Shop</h4>
            <Link to="/shop" className="footer-link">New Arrivals</Link>
            <Link to="/shop" className="footer-link">Best Sellers</Link>
            <Link to="/shop" className="footer-link">Sale</Link>
            <Link to="/shop" className="footer-link">Collections</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Help</h4>
            <Link to="/about" className="footer-link">FAQ</Link>
            <Link to="/about" className="footer-link">Shipping & Returns</Link>
            <Link to="/about" className="footer-link">Track Order</Link>
            <Link to="/about" className="footer-link">Contact Us</Link>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4 className="footer-heading">Join Our Newsletter</h4>
            <p className="footer-description" style={{ marginBottom: '1rem' }}>
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
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
          <p>&copy; {new Date().getFullYear()} Boutique. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
