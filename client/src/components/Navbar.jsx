import React from 'react';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
          <ShoppingBag className="icon-primary" size={28} />
          <span className="logo-text">Boutique</span>
        </Link>

        {/* Navigation Links - Hidden on Mobile */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          <a href="#collections" className="nav-link">Collections</a>
          <a href="#about" className="nav-link">About</a>
        </div>

        {/* Icons */}
        <div className="navbar-actions">
          <button className="icon-btn">
            <Search size={22} />
          </button>
          <button className="icon-btn">
            <User size={22} />
          </button>
          <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
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
