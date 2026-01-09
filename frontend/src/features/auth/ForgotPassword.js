import React, { useState } from 'react';
import htm from 'htm';
import api from '../../services/api.js';
import AuthLayout from './AuthLayout.js';
import { getErrorMessage } from '../../utils/errorHandler.js';

const html = htm.bind(React.createElement);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If the email exists, a password reset link has been sent to your inbox.');
    } catch (err) {
      setError(getErrorMessage(err, 'NETWORK_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  return html`
    <${AuthLayout} title="Forgot Password" subtitle="Enter your email to receive a reset link" error=${error} message=${message}>

        <form className="mt-8 space-y-6" onSubmit=${handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
              value=${email}
              onChange=${e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled=${loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ${loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          Remember your password? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
        </p>
    </${AuthLayout}>
  `;
};

export default ForgotPassword;
