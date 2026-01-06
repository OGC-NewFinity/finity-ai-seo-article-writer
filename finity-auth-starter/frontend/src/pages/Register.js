import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import '../App.css';

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
  const navigate = useNavigate();

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
      navigate('/verify-email', { state: { email: formData.email } });
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

  return (
    <div className="form-container">
      <ThemeToggle />
      <h1 className="form-title">Create Account</h1>
      <p className="form-subtitle">Sign up to get started</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            className="form-input"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            className="form-input"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="agreedToTerms"
            id="agreedToTerms"
            className="checkbox-input"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            required
          />
          <label htmlFor="agreedToTerms" className="checkbox-label">
            By creating an account, you agree to our{' '}
            <a href="#" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            ,{' '}
            <a href="#" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            , and{' '}
            <a href="#" target="_blank" rel="noopener noreferrer">Return & Refund Policy</a>
            . *
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || !formData.agreedToTerms}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="social-login">
        <div className="social-divider">
          <span>Or continue with</span>
        </div>
        <div className="social-buttons">
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin('google')}
          >
            Google
          </button>
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin('discord')}
          >
            Discord
          </button>
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin('twitter')}
          >
            X (Twitter)
          </button>
        </div>
      </div>

      <p className="link-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
