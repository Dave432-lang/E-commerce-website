import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Shirt, ClipboardList, Users, ArrowLeft, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Trigger */}
      <button className="admin-sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h3>Boutique Admin</h3>
          <p>Store Manager</p>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Shirt size={20} />
            <span>Products</span>
          </NavLink>

          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <ClipboardList size={20} />
            <span>Orders</span>
          </NavLink>

          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Users size={20} />
            <span>Users</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item return-store-btn">
            <ArrowLeft size={18} />
            <span>Return to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {sidebarOpen && <div className="admin-sidebar-overlay" onClick={closeSidebar} />}
        <div className="admin-content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
