import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { useAuth } from '@/hooks';
import api from '@/services/api';
import { getErrorMessage, showError } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  // Delete account confirmation
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setName(user.name || user.username || '');
    }
  }, [user]);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint when available
      // const response = await api.patch('/users/me', { email });
      // updateUser(response.data);
      
      // Temporary placeholder
      alert('Email update functionality will be available soon.');
    } catch (err) {
      showError(err, 'NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint when available
      // await api.post('/users/me/change-password', {
      //   current_password: currentPassword,
      //   new_password: password
      // });
      
      // Temporary placeholder
      alert('Password update functionality will be available soon.');
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err) {
      showError(err, 'NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint when available
      // const response = await api.patch('/users/me', { name });
      // updateUser(response.data);
      
      // Temporary placeholder
      alert('Name update functionality will be available soon.');
    } catch (err) {
      showError(err, 'NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion');
      return;
    }

    setDeleteLoading(true);

    try {
      // TODO: Replace with actual API endpoint when available
      // await api.delete('/users/me');
      // logout();
      
      // Temporary placeholder
      alert('Account deletion functionality will be available soon. Please contact support.');
      setShowDeleteModal(false);
      setDeleteConfirm('');
    } catch (err) {
      showError(err, 'NETWORK_ERROR');
    } finally {
      setDeleteLoading(false);
    }
  };

  return html`
    <div className="space-y-8 animate-fadeIn">
      <!-- Page Header -->
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and account settings</p>
      </div>

      <!-- Profile Information -->
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
        
        <!-- Profile Picture Section -->
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
          ${user?.avatar_url ? html`
            <img 
              src=${user.avatar_url} 
              alt=${user.email || 'User'}
              className="w-20 h-20 rounded-full"
            />
          ` : html`
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl">
              ${(user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          `}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">${user?.email || 'User'}</h3>
            <p className="text-sm text-gray-500 mt-1">Profile picture updates coming soon</p>
          </div>
        </div>

        <!-- Name Update Form -->
        <form onSubmit=${handleUpdateName} className="mb-8 pb-8 border-b border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value=${name}
              onChange=${(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <button
            type="submit"
            disabled=${loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
            Update Name
          </button>
        </form>

        <!-- Email Update Form -->
        <form onSubmit=${handleUpdateEmail} className="mb-8 pb-8 border-b border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value=${email}
              onChange=${(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              You'll need to verify your new email address after updating
            </p>
          </div>
          <button
            type="submit"
            disabled=${loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
            Update Email
          </button>
        </form>

        <!-- Password Update Form -->
        <form onSubmit=${handleUpdatePassword}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value=${currentPassword}
                onChange=${(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value=${password}
                onChange=${(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password (min 8 characters)"
                required
                minLength="8"
              />
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
                placeholder="Confirm new password"
                required
                minLength="8"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled=${loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
            Update Password
          </button>
        </form>
      </div>

      <!-- Delete Account Section -->
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 lg:p-8">
        <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-700 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick=${() => setShowDeleteModal(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          <i className="fa-solid fa-trash mr-2"></i>
          Delete Account
        </button>
      </div>

      <!-- Delete Confirmation Modal -->
      ${showDeleteModal && html`
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-red-900">Delete Account</h3>
            <p className="text-gray-600">
              This action cannot be undone. This will permanently delete your account and all associated data.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-black">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value=${deleteConfirm}
                onChange=${(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="DELETE"
              />
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                onClick=${handleDeleteAccount}
                disabled=${deleteConfirm !== 'DELETE' || deleteLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ${deleteLoading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
                Delete Account
              </button>
              <button
                onClick=${() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
};

export default ProfilePage;
