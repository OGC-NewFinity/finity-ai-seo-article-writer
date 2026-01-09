
import React, { useState, useEffect, Suspense, lazy } from 'react';
import htm from 'htm';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from '@/context/ThemeContext.js';
import { SettingsProvider } from '@/context/SettingsContext.js';
import Sidebar from './components/Sidebar.js';
import Loading from './components/common/Loading.js';
import NotificationManager from './components/common/Notification.js';
import { Login, Register, ForgotPassword, ResetPassword, VerifyEmail, Unauthorized } from '@/features/auth';
import LandingPage from './pages/LandingPage/LandingPage.jsx';

// Lazy load route-level components
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard.js'));
const Writer = lazy(() => import('@/features/writer').then(module => ({ default: module.WriterMain })));
const Research = lazy(() => import('./components/Research.js'));
const MediaHub = lazy(() => import('@/features/media').then(module => ({ default: module.MediaHubMain })));
const MediaLayout = lazy(() => import('@/features/media/MediaLayout.js'));
const SettingsPanel = lazy(() => import('./components/Settings/SettingsPanel.js'));
const AdminDashboard = lazy(() => import('@/features/admin-dashboard/AdminDashboard.js'));
const AccountPage = lazy(() => import('./components/Account/AccountPage.js'));
const Subscription = lazy(() => import('@/features/account').then(module => ({ default: module.Subscription })));

const html = htm.bind(React.createElement);

// Protected Route Component - handles both regular and admin-only routes
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
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' }, 'Loading...');
  }

  // Check if user is authenticated
  const hasToken = document.cookie.split('; ').find(row => row.startsWith('access_token='));
  
  if (!isAuthenticated && !hasToken) {
    console.log('ProtectedRoute - Not authenticated and no token, redirecting to login');
    return React.createElement(Navigate, { to: "/login", replace: true });
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
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' }, 'Authenticating...');
  }

  // Check admin-only requirement
  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute - Admin access required but user is not admin, redirecting to unauthorized');
    return React.createElement(Navigate, { to: "/unauthorized", replace: true });
  }

  // If authenticated (and admin if required), render children
  if (isAuthenticated) {
    console.log('ProtectedRoute - User authenticated, rendering protected content');
    return children;
  }

  // Fallback: should not reach here, but just in case
  console.log('ProtectedRoute - Not authenticated, redirecting to login');
  return React.createElement(Navigate, { to: "/login", replace: true });
};

// Main App Content (protected)
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('nova_xfinity_settings');
    return saved ? JSON.parse(saved) : {
      apiContext: '************************',
      provider: 'gemini',
      focusKeyphrase: '',
      openaiKey: '',
      claudeKey: '',
      llamaKey: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('nova_xfinity_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSaveSettings = () => {
    alert('Nova‑XFinity Agent Configuration synchronized successfully.');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(Dashboard)
        );
      case 'writer': 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(Writer, { settings })
        );
      case 'research': 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(Research)
        );
      case 'mediahub': 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(MediaHub)
        );
      case 'account': 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(AccountPage)
        );
      case 'subscription': 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(Subscription)
        );
      case 'settings': 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(SettingsPanel, { settings, onSettingsChange: setSettings, onSave: handleSaveSettings })
        );
      default: 
        return React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
          React.createElement(Dashboard)
        );
    }
  };

  return html`
    <div className="flex min-h-screen bg-slate-950 selection:bg-blue-500/20 selection:text-blue-200">
      <${Sidebar} activeTab=${activeTab} setActiveTab=${setActiveTab} />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          ${renderContent()}
        </div>
      </main>
      <${NotificationManager} />
    </div>
  `;
};

// Main App Component with Routing
const App = () => {
  return React.createElement(ThemeProvider, null,
    React.createElement(SettingsProvider, null,
      React.createElement(AuthProvider, null,
        React.createElement(Router, null,
          React.createElement(Routes, null,
            React.createElement(Route, { path: "/login", element: React.createElement(Login) }),
            React.createElement(Route, { path: "/register", element: React.createElement(Register) }),
            React.createElement(Route, { path: "/forgot-password", element: React.createElement(ForgotPassword) }),
            React.createElement(Route, { path: "/reset-password", element: React.createElement(ResetPassword) }),
            React.createElement(Route, { path: "/verify-email", element: React.createElement(VerifyEmail) }),
            React.createElement(Route, { path: "/unauthorized", element: React.createElement(Unauthorized) }),
            React.createElement(Route, {
              path: "/subscription",
              element: React.createElement(ProtectedRoute, null, 
                React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
                  React.createElement(Subscription)
                )
              )
            }),
            React.createElement(Route, {
              path: "/subscription/confirm",
              element: React.createElement(ProtectedRoute, null, 
                React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
                  React.createElement(Subscription)
                )
              )
            }),
            React.createElement(Route, {
              path: "/admin",
              element: React.createElement(ProtectedRoute, { adminOnly: true }, 
                React.createElement(Suspense, { fallback: React.createElement(Loading) },
                  React.createElement('div', { className: 'min-h-screen bg-gray-50 p-8 lg:p-12' },
                    React.createElement('div', { className: 'max-w-7xl mx-auto' },
                      React.createElement(AdminDashboard)
                    )
                  )
                )
              )
            }),
            React.createElement(Route, {
              path: "/media/*",
              element: React.createElement(ProtectedRoute, null, 
                React.createElement(Suspense, { fallback: React.createElement(Loading) }, 
                  React.createElement(MediaLayout)
                )
              )
            }),
            React.createElement(Route, {
              path: "/dashboard",
              element: React.createElement(ProtectedRoute, null, React.createElement(AppContent))
            }),
            React.createElement(Route, {
              path: "/",
              element: React.createElement(() => {
                const { isAuthenticated, loading } = useAuth();
                if (loading) {
                  return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' }, 'Loading...');
                }
                if (isAuthenticated) {
                  return React.createElement(Navigate, { to: "/dashboard", replace: true });
                }
                return React.createElement(LandingPage);
              })
            }),
            React.createElement(Route, {
              path: "/*",
              element: React.createElement(ProtectedRoute, null, React.createElement(AppContent))
            })
          )
        )
      )
    )
  );
};

export default App;
