import React, { useState } from 'react';
import htm from 'htm';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '@/hooks';
import Loading from '@/components/common/Loading.js';
import NotificationManager from '@/components/common/Notification.js';

const html = htm.bind(React.createElement);

// Lazy load account page components
const ProfilePage = React.lazy(() => import('../features/account/pages/ProfilePage.js'));
const BillingPage = React.lazy(() => import('../features/account/pages/BillingPage.js'));
const SecurityPage = React.lazy(() => import('../features/account/pages/SecurityPage.js'));
const QuotaOverviewPage = React.lazy(() => import('../features/account/pages/QuotaOverviewPage.js'));

const AccountDashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: 'fa-user', path: '/account/profile' },
    { id: 'billing', label: 'Billing', icon: 'fa-credit-card', path: '/account/billing' },
    { id: 'security', label: 'Security', icon: 'fa-shield-halved', path: '/account/security' },
    { id: 'quota', label: 'Quota', icon: 'fa-chart-pie', path: '/account/quota' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleSwitchDashboard = () => {
    navigate('/dashboard');
  };

  return html`
    <div className="flex min-h-screen bg-gray-50">
      <!-- Mobile Menu Overlay -->
      ${sidebarOpen && html`
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick=${() => setSidebarOpen(false)}
        ></div>
      `}

      <!-- Sidebar -->
      <aside className=${`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <!-- Sidebar Header -->
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Account Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account</p>
        </div>

        <!-- Navigation Links -->
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          ${menuItems.map((item) => {
            const active = isActive(item.path);
            return html`
              <button
                key=${item.id}
                onClick=${() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className=${`
                  w-full flex items-center px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${active
                    ? 'bg-blue-50 text-blue-600 font-bold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <i className=${`fa-solid ${item.icon} w-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-400'}`}></i>
                <span className="text-sm">${item.label}</span>
              </button>
            `;
          })}
        </nav>

        <!-- Sidebar Footer -->
        <div className="p-4 border-t border-gray-200">
          <button
            onClick=${handleSwitchDashboard}
            className="w-full flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <i className="fa-solid fa-arrow-left w-5 mr-3 text-gray-400"></i>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main className="flex-1 flex flex-col min-h-screen">
        <!-- Header -->
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <!-- Mobile Menu Button -->
            <button
              onClick=${() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>

            <!-- User Info & Actions -->
            <div className="flex items-center space-x-4 ml-auto">
              ${user && html`
                <div className="hidden sm:flex items-center space-x-3">
                  ${user.avatar_url ? html`
                    <img 
                      src=${user.avatar_url} 
                      alt=${user.email || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ` : html`
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      ${(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  `}
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">${user.email || 'User'}</p>
                    ${user.role && html`
                      <p className="text-xs text-gray-500 capitalize">${user.role}</p>
                    `}
                  </div>
                </div>
              `}

              <!-- Logout Button -->
              <button
                onClick=${logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-sign-out-alt mr-2"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <${Suspense} fallback=${React.createElement(Loading)}>
              <${Routes}>
                <${Route} path="profile" element=${React.createElement(ProfilePage)} />
                <${Route} path="billing" element=${React.createElement(BillingPage)} />
                <${Route} path="security" element=${React.createElement(SecurityPage)} />
                <${Route} path="quota" element=${React.createElement(QuotaOverviewPage)} />
                <${Route} path="" element=${React.createElement(Navigate, { to: "profile", replace: true })} />
                <${Route} path="*" element=${React.createElement(Navigate, { to: "profile", replace: true })} />
              </${Routes}>
            </${Suspense}>
          </div>
        </div>
      </main>

      <${NotificationManager} />
    </div>
  `;
};

export default AccountDashboardLayout;
