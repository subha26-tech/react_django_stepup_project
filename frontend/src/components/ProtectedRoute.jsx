import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * If unauthenticated, redirects to /login and saves the intended path
 * so we can redirect back after a successful login.
 */
export default function ProtectedRoute({ children, staffOnly = false }) {
  const { isAuthenticated, user, authInitializing } = useAuth();
  const location = useLocation();

  if (authInitializing) {
    return <p role="status" style={{ padding: '36px', textAlign: 'center' }}>Checking account access…</p>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (staffOnly && !user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
}
