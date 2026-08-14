import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { wishlistService } from '../services/wishlistService';
import { authService } from '../services/authService';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Package, User, Settings, LogOut, ChevronRight, MapPin, Heart, CheckCircle, Loader2, Trash2, Download } from 'lucide-react';
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
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.size || 'M'}, ${item.color || 'Default'})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
            .total { text-align: right; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BOUTIQUE</div>
            <div>
              <h2>INVOICE</h2>
              <p><b>Order ID:</b> ${order.id}</p>
              <p><b>Date:</b> ${order.date}</p>
            </div>
          </div>
          <div class="info-grid">
            <div>
              <h4>Billed To:</h4>
              <p><b>${user.name}</b></p>
              <p>${user.email}</p>
              <p>${order.shippingAddress || 'Ghana'}</p>
            </div>
            <div>
              <h4>Payment Info:</h4>
              <p><b>Method:</b> ${order.paymentMethod || 'Paystack'}</p>
              <p><b>Status:</b> ${order.status}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total">
            Total Paid: $${Number(order.total).toFixed(2)}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
      localStorage.setItem('boutique_user', JSON.stringify(updatedUser));
      showToast('Profile updated successfully!');
    } catch (err) {
      setSettingsError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    setIsChangingPassword(true);
    try {
      await authService.updateProfile(user.name, user.email, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Check your current password.');
    } finally {
      setIsChangingPassword(false);
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
                        <div className="order-meta-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                          <div>
                            {order.shippingAddress && <p style={{ margin: 0, fontSize: '0.85rem' }}><MapPin size={14} /> {order.shippingAddress}</p>}
                            {order.paymentMethod && <p style={{ margin: 0, fontSize: '0.85rem' }}><ChevronRight size={14} /> Paid via {order.paymentMethod}</p>}
                          </div>
                          <button
                            className="btn-secondary btn-small"
                            onClick={() => handlePrintInvoice(order)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            <Download size={14} /> Invoice PDF
                          </button>
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

              {/* Change Password Section */}
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Change Password</h3>
                <form className="settings-form" onSubmit={handleChangePassword}>
                  {passwordError && (
                    <div className="auth-error" style={{ marginBottom: '1rem' }}>{passwordError}</div>
                  )}
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password (min. 6 chars)"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-secondary" disabled={isChangingPassword}>
                    {isChangingPassword ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
                  </button>
                </form>
              </div>
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
