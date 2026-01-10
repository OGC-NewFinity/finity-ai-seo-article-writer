import React, { useState, useEffect } from 'react';
import htm from 'htm';
import api from '@/services/api.js';
import AuthLayout from './AuthLayout.js';
import { getErrorMessage } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (!tokenParam) {
      setError(getErrorMessage('Invalid reset token', 'AUTH_TOKEN_INVALID'));
    } else {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError(getErrorMessage('Passwords do not match', 'VALIDATION_ERROR'));
      return;
    }

    if (password.length < 8) {
      setError(getErrorMessage('Password must be at least 8 characters long', 'VALIDATION_ERROR'));
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        password: password
      });
      setMessage('Password has been reset successfully. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'AUTH_FAILED'));
    } finally {
      setLoading(false);
    }
  };

  return html`
    <${AuthLayout} title="Reset Password" subtitle="Enter your new password" error=${error} message=${message}>

        <form className="mt-8 space-y-6" onSubmit=${handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="8"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="At least 8 characters"
                value=${password}
                onChange=${e => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
                value=${confirmPassword}
                onChange=${e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled=${loading || !token}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ${loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Back to Sign In</a>
        </p>
    </${AuthLayout}>
  `;
};

export default ResetPassword;
