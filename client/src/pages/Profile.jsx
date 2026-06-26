import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { wishlistService } from '../services/wishlistService';
import { authService } from '../services/authService';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Package, User, Settings, LogOut, ChevronRight, MapPin, Heart, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, login } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsForm, setSettingsForm] = useState({ name: '', email: '' });

  // Sync form with user data when user is available
  useEffect(() => {
    if (user) {
      setSettingsForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to load real database orders:', error);
      }
    };

    const fetchWishlist = async () => {
      try {
        const data = await wishlistService.getWishlist();
        setWishlist(data);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };

    fetchMyOrders();
    fetchWishlist();
  }, [user, navigate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setIsUpdating(true);
    try {
      const updatedUser = await authService.updateProfile(settingsForm.name, settingsForm.email);
      // Sync auth context with updated user data (re-store in localStorage)
      localStorage.setItem('boutique_user', JSON.stringify(updatedUser));
      // Trigger a re-fresh of context by calling getProfile silently
      showToast('Profile updated successfully!');
    } catch (err) {
      setSettingsError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.id !== productId));
      showToast('Removed from wishlist.');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddWishlistItemToCart = (item) => {
    addToCart(item, 1, item.sizes?.[0] || 'M', item.colors?.[0] || 'Default');
    showToast(`${item.name} added to cart!`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-user-info">
          <div className="profile-avatar">
            {user.name.charAt(0)}
          </div>
          <div className="profile-text">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </div>
        <button className="logout-btn-profile" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="profile-content">
        <aside className="profile-sidebar">
          <button
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={20} /> My Orders
          </button>
          <button
            className={`sidebar-link ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={20} /> Wishlist {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
          </button>
          <button
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} /> Account Settings
          </button>
        </aside>

        <main className="profile-main">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>My Orders</h2>
              {orders.length === 0 ? (
                <div className="empty-orders">
                  <ShoppingBag size={48} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-info-group">
                          <span className="label">Order Number</span>
                          <span className="value">{order.id}</span>
                        </div>
                        <div className="order-info-group">
                          <span className="label">Date</span>
                          <span className="value">{order.date}</span>
                        </div>
                        <div className="order-info-group">
                          <span className="label">Total</span>
                          <span className="value">${order.total.toFixed(2)}</span>
                        </div>
                        <div className={`order-status-badge status-${order.status?.toLowerCase()}`}>
                          {order.status}
                        </div>
                      </div>

                      <div className="order-card-body">
                        <div className="order-items-preview">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item-thumb">
                              <img src={item.image} alt={item.name} />
                              <span className="item-qty-badge">{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-meta-info">
                          {order.shippingAddress && <p><MapPin size={14} /> {order.shippingAddress}</p>}
                          {order.paymentMethod && <p><ChevronRight size={14} /> Paid via {order.paymentMethod}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="wishlist-section">
              <h2>My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="empty-orders">
                  <Heart size={48} />
                  <p>Your wishlist is empty. Start adding items you love!</p>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map(item => (
                    <div key={item.id} className="wishlist-item-card">
                      <div className="wishlist-item-img-wrap">
                        <img src={item.image} alt={item.name} />
                        <button
                          className="wishlist-remove-btn"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          title="Remove from wishlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="wishlist-item-info">
                        <h3>{item.name}</h3>
                        <p className="wishlist-price">${item.price.toFixed(2)}</p>
                        <button
                          className="btn-primary btn-small"
                          onClick={() => handleAddWishlistItemToCart(item)}
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <form className="settings-form" onSubmit={handleUpdateProfile}>
                {settingsError && (
                  <div className="auth-error" style={{ marginBottom: '1rem' }}>{settingsError}</div>
                )}
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={e => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={e => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  {isUpdating ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Profile;
