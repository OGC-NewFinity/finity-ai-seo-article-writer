import React, { useState } from 'react';
import htm from 'htm';
import api from '../../services/api';

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
      await api.post('/api/auth/forgot-password', { email });
      setMessage('If the email exists, a password reset link has been sent to your inbox.');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return html`
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a reset link
          </p>
        </div>

        ${error && html`
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ${error}
          </div>
        `}

        ${message && html`
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ${message}
          </div>
        `}

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
      </div>
    </div>
  `;
};

export default ForgotPassword;
