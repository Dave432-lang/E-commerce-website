import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/Loader/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="admin-error-container">{error}</div>;

  const { totalSales, totalOrders, totalUsers, averageOrderValue, recentOrders } = stats || {
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    recentOrders: []
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-page-subtitle">Overview of your store's performance metrics</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-icon bg-indigo">
            <DollarSign size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Revenue</span>
            <h3 className="stat-value">${Number(totalSales).toFixed(2)}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon bg-purple">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Orders</span>
            <h3 className="stat-value">{totalOrders}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon bg-emerald">
            <Users size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Customers</span>
            <h3 className="stat-value">{totalUsers}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon bg-amber">
            <TrendingUp size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Average Order</span>
            <h3 className="stat-value">${Number(averageOrderValue).toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="admin-dashboard-details">
        <div className="admin-card recent-orders-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
            <button className="btn-text-link" onClick={() => navigate('/admin/orders')}>
              View All Orders <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="admin-table-wrapper">
            {recentOrders.length === 0 ? (
              <p className="no-data-text">No recent orders found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td><span className="order-id-label">{order.id}</span></td>
                      <td>{order.customerName}</td>
                      <td>{order.date}</td>
                      <td>${Number(order.total).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge badge-${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
