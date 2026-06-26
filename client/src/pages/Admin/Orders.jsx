import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronUp, AlertCircle, Calendar, MapPin, CreditCard } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/Loader/Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load store orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const dbId = order.rawId;
      await adminService.updateOrderStatus(dbId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err.message || 'Error occurred while updating order status.');
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const validStatuses = ['pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (loading && orders.length === 0) return <Loader />;

  return (
    <div className="admin-orders-page">
      <div className="admin-page-header">
        <div>
          <h1>Customer Orders</h1>
          <p className="admin-page-subtitle">Track payments, shipping details, and update fulfillment statuses</p>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrapper">
          {orders.length === 0 ? (
            <p className="no-data-text">No customer orders have been placed yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      <tr className={isExpanded ? 'expanded-row-parent' : ''}>
                        <td>
                          <button className="icon-btn" onClick={() => toggleExpandOrder(order.id)}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td>
                          <span className="order-id-label">{order.id}</span>
                        </td>
                        <td>
                          <div className="customer-info-cell">
                            <b>{order.customerName}</b>
                            <p>{order.customerEmail}</p>
                          </div>
                        </td>
                        <td>{order.date}</td>
                        <td><b>${Number(order.total).toFixed(2)}</b></td>
                        <td>
                          <span className={`status-badge badge-${order.status?.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`order-status-select select-${order.status?.toLowerCase()}`}
                          >
                            {validStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>

                      {/* Expanded Order Details Row */}
                      {isExpanded && (
                        <tr className="expanded-row-details">
                          <td colSpan="7">
                            <div className="order-expanded-content">
                              <div className="expanded-grid">
                                {/* Order items */}
                                <div className="expanded-col-items">
                                  <h4>Ordered Items</h4>
                                  <div className="order-items-list-admin">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="order-item-detail-row">
                                        <div className="item-detail-img">
                                          <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="item-detail-info">
                                          <p className="item-name"><b>{item.name}</b></p>
                                          <p className="item-meta">Size: {item.size} | Color: {item.color || 'Default'} | Qty: {item.quantity}</p>
                                        </div>
                                        <div className="item-detail-price">
                                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                                          <p className="item-price-unit">${item.price.toFixed(2)} each</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Shipping & Payment */}
                                <div className="expanded-col-shipping">
                                  <h4>Shipping & Delivery</h4>
                                  <div className="shipping-info-block">
                                    <p className="info-row"><MapPin size={16} /> <span>{order.shippingAddress}</span></p>
                                    <p className="info-row"><CreditCard size={16} /> <span>Paid via <b>{order.paymentMethod}</b></span></p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
