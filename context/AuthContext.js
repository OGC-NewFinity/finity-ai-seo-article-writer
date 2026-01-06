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
      const [access_token] = decodeURIComponent(tokens).split('|');
      Cookies.set('access_token', access_token, { expires: 7 });
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
        const response = await api.get('/api/users/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid, clear it
        Cookies.remove('access_token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      // Log the login payload for debugging
      console.log("Login Payload →", { email: email, password });
      
      // Backend expects JSON with email field (not form data)
      const loginData = {
        email: email,
        password: password
      };
      
      console.log("Making login request to /api/auth/login with:", loginData);
      
      const response = await api.post('/api/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Login response:", response.data);
      
      const { access_token } = response.data;
      
      Cookies.set('access_token', access_token, { expires: 7 });
      
      const userResponse = await api.get('/api/users/me');
      setUser(userResponse.data);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log("Register Payload →", userData);
      const response = await api.post('/api/auth/register', userData);
      console.log("Register response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Register error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
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
