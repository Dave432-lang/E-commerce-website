import React from 'react';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <ShoppingBag className="icon-primary" size={28} />
          <span className="logo-text">Boutique</span>
        </div>

        {/* Navigation Links - Hidden on Mobile */}
        <div className="navbar-links">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Shop</a>
          <a href="#" className="nav-link">Collections</a>
          <a href="#" className="nav-link">About</a>
        </div>

        {/* Icons */}
        <div className="navbar-actions">
          <button className="icon-btn">
            <Search size={22} />
          </button>
          <button className="icon-btn">
            <User size={22} />
          </button>
          <button className="icon-btn cart-btn">
            <ShoppingBag size={22} />
            <span className="cart-badge">0</span>
          </button>
          <button className="icon-btn mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
