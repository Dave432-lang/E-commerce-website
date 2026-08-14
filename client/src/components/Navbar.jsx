import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('boutique_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('boutique_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const fetchSearchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products for navbar search:', error);
      }
    };
    fetchSearchProducts();
  }, []);

  const searchResults = searchQuery 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
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
          <Link to="/women" className="nav-link">Women</Link>
          <Link to="/men" className="nav-link">Men</Link>
          <Link to="/new-arrivals" className="nav-link">New Arrivals</Link>
          <Link to="/sale" className="nav-link">Sale</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
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
                              <p className="item-price">GH₵{product.price}</p>
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
              {user.role === 'admin' && (
                <Link to="/admin" className="admin-nav-badge" title="Access Admin Dashboard">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="user-name-nav" title="View Profile">
                Hi, {user.name.split(' ')[0]}
              </Link>
              <button className="icon-btn" onClick={logout} title="Logout">
                <User size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="icon-btn" title="Sign In">
              <User size={20} />
            </Link>
          )}

          <button 
            className="icon-btn theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={19} className="icon-warning" /> : <Moon size={19} />}
          </button>

          <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)} title="View Shopping Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="icon-btn mobile-menu-btn" title="Open Menu">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
