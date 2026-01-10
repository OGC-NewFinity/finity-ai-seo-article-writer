import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.js';

const MainNavbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50" role="navigation">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/brand-identity/logo/nova-logo.png"
              alt="Nova‑XFinity AI Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-white font-bold text-lg">Nova‑XFinity AI</span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/docs"
                  className="text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Docs
                </Link>
                <Link
                  to="/pricing"
                  className="text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/contact"
                  className="text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
