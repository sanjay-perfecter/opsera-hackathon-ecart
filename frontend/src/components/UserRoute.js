import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

const UserRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Prevent admins from using the store/user-only areas
  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
