import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.error);
    }
  };

  // Handle OAuth errors from URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setError(`OAuth login failed: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
      <h1 className="form-title">Welcome Back</h1>
      <p className="form-subtitle">Sign in to your account</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-group">
          <Link to="/forgot-password" className="link-text" style={{ display: 'block', textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
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
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
