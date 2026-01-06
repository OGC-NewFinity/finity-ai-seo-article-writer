import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import '../App.css';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        full_name: user.full_name || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.put('/users/me', formData);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete('/users/me');
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete account');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <ThemeToggle />
      <div className="form-container" style={{ maxWidth: '600px' }}>
        <h1 className="form-title">Profile Settings</h1>
        <p className="form-subtitle">Manage your account information</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
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
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-input"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Status</label>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Role:</strong> {user.role}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={logout}
            style={{ marginBottom: '15px' }}
          >
            Logout
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleDeleteAccount}
            style={{
              backgroundColor: 'var(--error-color)',
              color: 'white',
              width: '100%'
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
