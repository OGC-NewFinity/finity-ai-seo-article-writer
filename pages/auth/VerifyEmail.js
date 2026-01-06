import React, { useState, useEffect } from 'react';
import htm from 'htm';
import api from '../../services/api';

const html = htm.bind(React.createElement);

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');
    
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    } else if (emailParam) {
      setEmail(emailParam);
      setMessage(`A verification email has been sent to ${emailParam}. Please check your inbox and click the verification link.`);
    }
  }, []);

  const verifyEmail = async (tokenParam) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post(`/auth/verify-email?token=${encodeURIComponent(tokenParam)}`);
      setMessage('Email verified successfully! You can now sign in.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification token.');
    } finally {
      setLoading(false);
    }
  };

  return html`
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Email
          </h2>
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

        ${loading && html`<p className="text-center">Verifying email...</p>`}

        ${!token && !email && html`
          <div>
            <p className="text-center text-sm text-gray-600">No verification token found.</p>
            <p className="mt-2 text-center text-sm text-gray-600">
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Back to Sign In</a>
            </p>
          </div>
        `}
      </div>
    </div>
  `;
};

export default VerifyEmail;
