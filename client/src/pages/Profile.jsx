import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Package, User, Settings, LogOut, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('boutique_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

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
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} /> Account Settings
          </button>
        </aside>

        <main className="profile-main">
          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Recent Orders</h2>
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
                        <div className="order-status-badge">
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
                          <p><MapPin size={14} /> {order.shippingAddress}</p>
                          <p><ChevronRight size={14} /> Paid via {order.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue={user.name} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" defaultValue={user.email} />
                </div>
                <button className="btn-primary">Update Profile</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
