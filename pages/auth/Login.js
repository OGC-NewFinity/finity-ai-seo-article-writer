import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const html = htm.bind(React.createElement);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle OAuth errors from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setError(`OAuth login failed: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login successful, preparing navigation...');
        setLoading(false);
        
        // Wait for auth state to propagate, then navigate
        // Use a more reliable approach: wait for the auth context to update
        const waitForAuthAndNavigate = async () => {
          // Check both cookie and wait a bit for React state to update
          const token = document.cookie.split('; ').find(row => row.startsWith('access_token='));
          if (!token) {
            console.error('No token found after login, this should not happen');
            setError('Login succeeded but authentication token was not set. Please try again.');
            return;
          }
          
          console.log('Token confirmed in cookie, waiting for React state update...');
          
          // Give React time to process the state update from AuthContext
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Now navigate - the useEffect hook will handle redirect if needed
          console.log('Navigating to dashboard...');
          navigate('/dashboard', { replace: true });
        };
        
        // Start navigation process
        waitForAuthAndNavigate();
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Login form error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Redirect if already authenticated (this handles the case where user is already logged in)
  useEffect(() => {
    // Check both state and cookie as fallback
    const hasToken = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    if ((isAuthenticated || hasToken) && !loading) {
      console.log('Login page - User already authenticated (state:', isAuthenticated, 'cookie:', !!hasToken, '), redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, loading]);

  const handleSocialLogin = async (provider) => {
    try {
      const response = await api.get(`/auth/social/${provider}`);
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to initiate social login');
    }
  };

  return html`
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        ${error && html`
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ${error}
          </div>
        `}

        <form className="mt-8 space-y-6" onSubmit=${handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
                value=${email}
                onChange=${e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value=${password}
                onChange=${e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled=${loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ${loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</a>
        </p>
      </div>
    </div>
  `;
};

export default Login;
