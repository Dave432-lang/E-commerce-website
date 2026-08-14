import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Shirt, ClipboardList, Users, ArrowLeft, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    // On mobile, toggle mobile drawer. On desktop, toggle collapse mode.
    if (window.innerWidth <= 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo-badge">B</div>
          {!isCollapsed && (
            <div className="admin-header-titles">
              <h3>Boutique Admin</h3>
              <p>Store Manager</p>
            </div>
          )}
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileSidebar}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileSidebar}
            title="Products"
          >
            <Shirt size={20} />
            {!isCollapsed && <span>Products</span>}
          </NavLink>

          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileSidebar}
            title="Orders"
          >
            <ClipboardList size={20} />
            {!isCollapsed && <span>Orders</span>}
          </NavLink>

          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileSidebar}
            title="Users"
          >
            <Users size={20} />
            {!isCollapsed && <span>Users</span>}
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item return-store-btn" title="Return to Store">
            <ArrowLeft size={18} />
            {!isCollapsed && <span>Return to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`admin-main ${isCollapsed ? 'collapsed' : ''}`}>
        {mobileOpen && <div className="admin-sidebar-overlay" onClick={closeMobileSidebar} />}
        
        {/* Admin Top Navigation Bar */}
        <header className="admin-top-bar">
          <button 
            className="admin-sidebar-toggle-btn" 
            onClick={toggleSidebar}
            title={(mobileOpen || !isCollapsed) ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {(mobileOpen || isCollapsed) ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="admin-top-bar-right">
            <span className="admin-status-indicator">● Store Active</span>
          </div>
        </header>

        <div className="admin-content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
