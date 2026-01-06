import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import '../App.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');
  const email = location.state?.email || '';

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else if (email) {
      setMessage(`A verification email has been sent to ${email}. Please check your inbox and click the verification link.`);
    }
  }, [token, email]);

  const verifyEmail = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/verify-email', null, {
        params: { token }
      });
      setMessage('Email verified successfully! You can now sign in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <ThemeToggle />
      <h1 className="form-title">Verify Email</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {loading && <p>Verifying email...</p>}

      {!token && !email && (
        <div>
          <p className="form-subtitle">No verification token found.</p>
          <p className="link-text">
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
