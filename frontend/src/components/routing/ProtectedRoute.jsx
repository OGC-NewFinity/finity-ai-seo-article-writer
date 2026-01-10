import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.js';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [checkingCookie, setCheckingCookie] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'adminOnly:', adminOnly, 'loading:', loading);
  }, [isAuthenticated, isAdmin, adminOnly, loading]);

  // Fallback: Check cookie directly and trigger auth re-check if needed
  const { checkAuth } = useAuth();
  React.useEffect(() => {
    if (!isAuthenticated && !loading && !checkingCookie) {
      const token = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      if (token) {
        console.log('ProtectedRoute - Found token in cookie but auth state not updated, re-checking auth...');
        setCheckingCookie(true);
        // Trigger auth re-check and wait for it to complete
        checkAuth().finally(() => {
          // Give React time to process the state update
          setTimeout(() => {
            setCheckingCookie(false);
          }, 300);
        });
      }
    }
  }, [isAuthenticated, loading, checkingCookie, checkAuth]);

  if (loading || checkingCookie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Check if user is authenticated
  const hasToken = document.cookie.split('; ').find(row => row.startsWith('access_token='));
  
  if (!isAuthenticated && !hasToken) {
    console.log('ProtectedRoute - Not authenticated and no token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If we have a token but auth state isn't updated yet, show loading and keep checking
  if (!isAuthenticated && hasToken) {
    console.log('ProtectedRoute - Token exists but auth state not updated, showing loading and re-checking...');
    // Trigger a re-check if not already checking
    if (!checkingCookie) {
      setCheckingCookie(true);
      checkAuth().finally(() => {
        setTimeout(() => {
          setCheckingCookie(false);
        }, 300);
      });
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Authenticating...</div>
      </div>
    );
  }

  // Check admin-only requirement
  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute - Admin access required but user is not admin, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated (and admin if required), render children
  if (isAuthenticated) {
    console.log('ProtectedRoute - User authenticated, rendering protected content');
    return children;
  }

  // Fallback: should not reach here, but just in case
  console.log('ProtectedRoute - Not authenticated, redirecting to login');
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
