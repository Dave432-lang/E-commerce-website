import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader/Loader';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  // Redirect to login if user is not authenticated or not an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
