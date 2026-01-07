
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import Sidebar from './components/Sidebar.js';
import Dashboard from './components/Dashboard.js';
import Writer from './components/writer/Writer.js';
import Research from './components/Research.js';
import MediaHub from './components/MediaHub.js';
import AccountPage from './components/Account/AccountPage.js';
import SettingsPanel from './components/Settings/SettingsPanel.js';
import NotificationManager from './components/common/Notification.js';
import Login from './pages/auth/Login.js';
import Register from './pages/auth/Register.js';
import ForgotPassword from './pages/auth/ForgotPassword.js';
import ResetPassword from './pages/auth/ResetPassword.js';
import VerifyEmail from './pages/auth/VerifyEmail.js';
import Subscription from './pages/Subscription.js';
import AdminDashboard from './pages/AdminDashboard.js';
import LandingPage from './pages/LandingPage/LandingPage';

const html = htm.bind(React.createElement);

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [checkingCookie, setCheckingCookie] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'loading:', loading);
  }, [isAuthenticated, loading]);

  // Fallback: Check cookie directly and trigger auth re-check if needed
  const { checkAuth } = useAuth();
  React.useEffect(() => {
    if (!isAuthenticated && !loading && !checkingCookie) {
      const token = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      if (token) {
        console.log('PrivateRoute - Found token in cookie but auth state not updated, re-checking auth...');
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

  // Check cookie as fallback if state hasn't updated
  const hasToken = document.cookie.split('; ').find(row => row.startsWith('access_token='));
  
  if (!isAuthenticated && !hasToken) {
    console.log('PrivateRoute - Not authenticated and no token, redirecting to login');
    return React.createElement(Navigate, { to: "/login", replace: true });
  }

  // If we have a token but auth state isn't updated yet, show loading and keep checking
  if (!isAuthenticated && hasToken) {
    console.log('PrivateRoute - Token exists but auth state not updated, showing loading and re-checking...');
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

  // If authenticated, render children
  if (isAuthenticated) {
    console.log('PrivateRoute - User authenticated, rendering protected content');
    return children;
  }

  // Fallback: should not reach here, but just in case
  console.log('PrivateRoute - Not authenticated, redirecting to login');
  return React.createElement(Navigate, { to: "/login", replace: true });
};

// Admin Route Component - requires authentication and admin role
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' }, 'Loading...');
  }

  if (!isAuthenticated) {
    return React.createElement(Navigate, { to: "/login", replace: true });
  }

  if (user?.role !== 'admin') {
    return React.createElement(Navigate, { to: "/dashboard", replace: true });
  }

  return children;
};

// Main App Content (protected)
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('finity_settings');
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
    localStorage.setItem('finity_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSaveSettings = () => {
    alert('Finity Agent Configuration synchronized successfully.');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return html`<${Dashboard} />`;
      case 'writer': return html`<${Writer} settings=${settings} />`;
      case 'research': return html`<${Research} />`;
      case 'mediahub': return html`<${MediaHub} />`;
      case 'account': return html`<${AccountPage} />`;
      case 'subscription': return html`<${Subscription} />`;
      case 'settings': return html`<${SettingsPanel} settings=${settings} onSettingsChange=${setSettings} onSave=${handleSaveSettings} />`;
      default: return html`<${Dashboard} />`;
    }
  };

  return html`
    <div className="flex min-h-screen bg-gray-50 selection:bg-blue-100 selection:text-blue-900">
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
  return React.createElement(AuthProvider, null,
    React.createElement(Router, null,
      React.createElement(Routes, null,
        React.createElement(Route, { path: "/login", element: React.createElement(Login) }),
        React.createElement(Route, { path: "/register", element: React.createElement(Register) }),
        React.createElement(Route, { path: "/forgot-password", element: React.createElement(ForgotPassword) }),
        React.createElement(Route, { path: "/reset-password", element: React.createElement(ResetPassword) }),
        React.createElement(Route, { path: "/verify-email", element: React.createElement(VerifyEmail) }),
        React.createElement(Route, {
          path: "/subscription",
          element: React.createElement(PrivateRoute, null, React.createElement(Subscription))
        }),
        React.createElement(Route, {
          path: "/subscription/confirm",
          element: React.createElement(PrivateRoute, null, React.createElement(Subscription))
        }),
        React.createElement(Route, {
          path: "/admin",
          element: React.createElement(AdminRoute, null, 
            React.createElement('div', { className: 'min-h-screen bg-gray-50 p-8 lg:p-12' },
              React.createElement('div', { className: 'max-w-7xl mx-auto' },
                React.createElement(AdminDashboard)
              )
            )
          )
        }),
        React.createElement(Route, {
          path: "/dashboard",
          element: React.createElement(PrivateRoute, null, React.createElement(AppContent))
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
          element: React.createElement(PrivateRoute, null, React.createElement(AppContent))
        })
      )
    )
  );
};

export default App;
