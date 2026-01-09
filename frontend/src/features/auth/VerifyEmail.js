import React, { useState, useEffect } from 'react';
import htm from 'htm';
import api from '../../services/api.js';
import AuthLayout from './AuthLayout.js';
import { getErrorMessage } from '../../utils/errorHandler.js';

const html = htm.bind(React.createElement);

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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
      await api.post(`/auth/verify?token=${encodeURIComponent(tokenParam)}`);
      setMessage('Email verified successfully! You can now sign in.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'AUTH_TOKEN_INVALID'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError(getErrorMessage('Email address is required to resend verification', 'VALIDATION_ERROR'));
      return;
    }

    setResending(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);
      if (response.data.success) {
        setMessage('Verification email has been resent! Please check your inbox.');
      } else {
        setError(getErrorMessage(response.data.message || 'Failed to resend verification email', 'NETWORK_ERROR'));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'NETWORK_ERROR'));
    } finally {
      setResending(false);
    }
  };

  return html`
    <${AuthLayout} title="Verify Email" error=${error} message=${message}>

        ${loading && html`<p className="text-center">Verifying email...</p>`}

        ${email && !token && !loading && html`
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Didn't receive the verification email?
            </p>
            <button
              type="button"
              onClick=${handleResendVerification}
              disabled=${resending}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ${resending && html`
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              `}
              ${resending ? 'Resending...' : 'Resend Verification Email'}
            </button>
            <p className="mt-4 text-center text-sm text-gray-600">
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Back to Sign In</a>
            </p>
          </div>
        `}

        ${!token && !email && html`
          <div>
            <p className="text-center text-sm text-gray-600">No verification token found.</p>
            <p className="mt-2 text-center text-sm text-gray-600">
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Back to Sign In</a>
            </p>
          </div>
        `}
    </${AuthLayout}>
  `;
};

export default VerifyEmail;
