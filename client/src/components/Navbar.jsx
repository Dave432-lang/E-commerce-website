import React, { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { newArrivals, bestSellers, trendingNow } from '../utils/dummyData';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const allProducts = [...newArrivals, ...bestSellers, ...trendingNow];
  const searchResults = searchQuery 
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

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
          <div className="search-container">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon-nav" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                />
                {searchQuery && (
                  <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {showSearchDropdown && searchQuery && (
              <>
                <div className="search-dropdown-backdrop" onClick={() => setShowSearchDropdown(false)} />
                <div className="search-results-dropdown">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="dropdown-items">
                        {searchResults.map(product => (
                          <Link 
                            key={product.id} 
                            to={`/product/${product.id}`} 
                            className="search-result-item"
                            onClick={() => setShowSearchDropdown(false)}
                          >
                            <img src={product.image} alt={product.name} />
                            <div className="item-details">
                              <p className="item-name">{product.name}</p>
                              <p className="item-price">${product.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button 
                        className="see-all-results"
                        onClick={handleSearchSubmit}
                      >
                        See all results for "{searchQuery}"
                      </button>
                    </>
                  ) : (
                    <div className="no-search-results">
                      No products found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {user ? (
            <div className="user-dropdown-container">
              <Link to="/profile" className="user-name-nav">Hi, {user.name.split(' ')[0]}</Link>
              <button className="icon-btn" onClick={logout} title="Logout">
                <User size={22} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="icon-btn">
              <User size={22} />
            </Link>
          )}

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
