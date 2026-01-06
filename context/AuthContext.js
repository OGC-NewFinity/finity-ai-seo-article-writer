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

  // Debug logging for auth state changes
  useEffect(() => {
    console.log('Auth state changed - isAuthenticated:', isAuthenticated, 'user:', user?.email, 'loading:', loading);
  }, [isAuthenticated, user, loading]);

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
        const response = await api.get('/users/me');
        setUser(response.data);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        // Token invalid, clear it
        console.error("Auth check failed:", error);
        Cookies.remove('access_token');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Log the login payload for debugging
      console.log("Login Payload →", { email: email, password });
      
      // FastAPI Users expects form-encoded data (OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI Users uses 'username' field for email
      formData.append('password', password);
      
      console.log("Making login request to /auth/jwt/login");
      
      const response = await api.post('/auth/jwt/login', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log("Login response:", response.data);
      
      const { access_token } = response.data;
      
      // Set cookie with proper options for cross-origin support
      Cookies.set('access_token', access_token, { 
        expires: 7,
        sameSite: 'lax',
        secure: window.location.protocol === 'https:'
      });
      
      console.log('Cookie set - access_token:', access_token ? 'present' : 'missing');
      
      // Fetch user data
      const userResponse = await api.get('/users/me');
      console.log("User data:", userResponse.data);
      
      // Update state synchronously - use functional updates to ensure React processes them
      setUser(userResponse.data);
      setIsAuthenticated(true);
      setLoading(false); // Ensure loading is false
      
      console.log('Login successful - User:', userResponse.data?.email, 'isAuthenticated set to true');
      
      // Force React to process state updates - use multiple frames to ensure propagation
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 200);
          });
        });
      });
      
      // Double-check state was actually set
      const tokenAfter = Cookies.get('access_token');
      console.log('Post-login verification - Token exists:', !!tokenAfter, 'State should be updated now');
      
      return { success: true, user: userResponse.data };
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
      const response = await api.post('/auth/register', userData);
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
