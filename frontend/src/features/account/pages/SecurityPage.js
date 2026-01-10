import React, { useState } from 'react';
import htm from 'htm';
import { useAuth } from '@/hooks';
import api from '@/services/api';
import { getErrorMessage, showError } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

const SecurityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Password reset form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OAuth connections (mock data for now)
  const [oauthConnections] = useState([
    { provider: 'google', connected: false, email: null },
    { provider: 'discord', connected: false, email: null },
  ]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint when available
      // await api.post('/users/me/change-password', {
      //   current_password: currentPassword,
      //   new_password: newPassword
      // });
      
      alert('Password reset functionality will be available soon.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(err, 'NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectOAuth = (provider) => {
    // TODO: Implement OAuth connection
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  const handleDisconnectOAuth = async (provider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) {
      return;
    }

    try {
      // TODO: Replace with actual API endpoint when available
      // await api.post(`/users/me/disconnect-oauth`, { provider });
      alert(`OAuth disconnect functionality for ${provider} will be available soon.`);
    } catch (err) {
      showError(err, 'NETWORK_ERROR');
    }
  };

  return html`
    <div className="space-y-8 animate-fadeIn">
      <!-- Page Header -->
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Security</h1>
        <p className="text-gray-500 mt-2">Manage your account security and authentication settings</p>
      </div>

      <!-- Password Reset Section -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
        <form onSubmit=${handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value=${currentPassword}
              onChange=${(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your current password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value=${newPassword}
              onChange=${(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password (min 8 characters)"
              required
              minLength="8"
            />
            <p className="text-xs text-gray-500 mt-2">
              Password must be at least 8 characters long
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value=${confirmPassword}
              onChange=${(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your new password"
              required
              minLength="8"
            />
          </div>
          <button
            type="submit"
            disabled=${loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
            Update Password
          </button>
        </form>
      </div>

      <!-- OAuth Connections Section -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connected Accounts</h2>
        <p className="text-sm text-gray-500 mb-6">
          Connect your accounts to enable quick sign-in options
        </p>

        <div className="space-y-4">
          ${oauthConnections.map((connection) => {
            const providerName = connection.provider.charAt(0).toUpperCase() + connection.provider.slice(1);
            const providerIcon = connection.provider === 'google' ? 'fa-google' : 'fa-discord';
            const providerColor = connection.provider === 'google' ? 'text-red-500' : 'text-indigo-500';

            return html`
              <div
                key=${connection.provider}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className=${`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${providerColor}`}>
                    <i className=${`fa-brands ${providerIcon} text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">${providerName}</h3>
                    ${connection.connected ? html`
                      <p className="text-sm text-gray-500">
                        Connected ${connection.email ? `as ${connection.email}` : ''}
                      </p>
                    ` : html`
                      <p className="text-sm text-gray-500">Not connected</p>
                    `}
                  </div>
                </div>
                ${connection.connected ? html`
                  <button
                    onClick=${() => handleDisconnectOAuth(connection.provider)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                ` : html`
                  <button
                    onClick=${() => handleConnectOAuth(connection.provider)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                `}
              </div>
            `;
          })}
        </div>
      </div>

      <!-- Two-Factor Authentication Section (Placeholder) -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add an extra layer of security to your account with two-factor authentication
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <i className="fa-solid fa-info-circle text-amber-600 text-xl mt-1"></i>
            <div className="flex-1">
              <h3 className="font-medium text-amber-900 mb-2">Coming Soon</h3>
              <p className="text-sm text-amber-700">
                Two-factor authentication (2FA) will be available in a future update. This feature will allow you to secure your account with an additional authentication step.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            disabled
            className="px-6 py-3 bg-gray-200 text-gray-500 rounded-xl font-medium cursor-not-allowed"
          >
            <i className="fa-solid fa-lock mr-2"></i>
            Enable 2FA (Coming Soon)
          </button>
        </div>
      </div>

      <!-- Security Activity Section (Placeholder) -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Security Activity</h2>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <i className="fa-solid fa-shield-halved text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-600 font-medium mb-2">Security activity logs</p>
          <p className="text-sm text-gray-500">
            View recent login attempts and security events
          </p>
        </div>
      </div>
    </div>
  `;
};

export default SecurityPage;
