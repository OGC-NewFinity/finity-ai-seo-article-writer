import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const tokens = urlParams.get('tokens');
    if (tokens) {
      const [access_token, refresh_token] = decodeURIComponent(tokens).split('|');
      Cookies.set('access_token', access_token, { expires: 7 });
      Cookies.set('refresh_token', refresh_token, { expires: 7 });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh auth state
      checkAuth().then(() => {
        // Redirect to home after successful OAuth login
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      });
    } else {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('access_token');
    if (token) {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid, clear it
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = response.data;
      
      Cookies.set('access_token', access_token, { expires: 7 });
      Cookies.set('refresh_token', refresh_token, { expires: 7 });
      
      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuth
      }
    },
    children
  );
};
