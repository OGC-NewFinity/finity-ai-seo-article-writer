import React, { useState } from 'react';
import htm from 'htm';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const html = htm.bind(React.createElement);

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.agreedToTerms) {
      setError('You must agree to the Privacy Policy, Terms of Service, and Return & Refund Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    const result = await register({
      email: formData.email,
      username: formData.username || undefined,
      full_name: formData.fullName || undefined,
      password: formData.password,
      agreed_to_terms: formData.agreedToTerms
    });

    setLoading(false);

    if (result.success) {
      window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`;
    } else {
      setError(result.error);
    }
  };

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
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up to get started
          </p>
        </div>

        ${error && html`
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ${error}
          </div>
        `}

        <form className="mt-8 space-y-6" onSubmit=${handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
                value=${formData.email}
                onChange=${handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Choose a username"
                value=${formData.username}
                onChange=${handleChange}
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your full name"
                value=${formData.fullName}
                onChange=${handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="8"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="At least 8 characters"
                value=${formData.password}
                onChange=${handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
                value=${formData.confirmPassword}
                onChange=${handleChange}
              />
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked=${formData.agreedToTerms}
                onChange=${handleChange}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreedToTerms" className="font-medium text-gray-700">
                By creating an account, you agree to our{' '}
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                ,{' '}
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                , and{' '}
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">Return & Refund Policy</a>
                . *
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled=${loading || !formData.agreedToTerms}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ${loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick=${() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Google
            </button>
            <button
              type="button"
              onClick=${() => handleSocialLogin('discord')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Discord
            </button>
            <button
              type="button"
              onClick=${() => handleSocialLogin('twitter')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              X (Twitter)
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
        </p>
      </div>
    </div>
  `;
};

export default Register;
