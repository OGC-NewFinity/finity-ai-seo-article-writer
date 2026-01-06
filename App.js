
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

const html = htm.bind(React.createElement);

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' }, 'Loading...');
  }

  if (!isAuthenticated) {
    return React.createElement(Navigate, { to: "/login", replace: true });
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
          path: "/*",
          element: React.createElement(PrivateRoute, null, React.createElement(AppContent))
        }),
        React.createElement(Route, { path: "/", element: React.createElement(Navigate, { to: "/login", replace: true }) })
      )
    )
  );
};

export default App;
