import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  element: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen tech-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{element}</>;
};

export default AdminRoute; 