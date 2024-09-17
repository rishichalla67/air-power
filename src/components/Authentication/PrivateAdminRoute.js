import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateAdminRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    // Not logged in
    return <Navigate to="/login" />;
  }

  if (!userData) {
    // User data not yet loaded
    return <div>Loading...</div>;
  }

  if (!userData.isAdmin) {
    // Logged in but not an admin
    return <Navigate to="/" />;
  }

  // User is logged in and is an admin
  return children;
};

export default PrivateAdminRoute;