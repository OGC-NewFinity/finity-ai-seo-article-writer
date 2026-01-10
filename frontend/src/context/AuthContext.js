import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/services/api';

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
      setLoading(true);
      
      // Log the login payload for debugging (dev mode only)
      if (import.meta.env.DEV) {
        console.log("Login Payload →", { email: email });
      }
      
      // FastAPI Users expects form-encoded data (OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI Users uses 'username' field for email
      formData.append('password', password);
      
      if (import.meta.env.DEV) {
        console.log("Making login request to /auth/jwt/login");
      }
      
      const response = await api.post('/auth/jwt/login', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, // Explicitly ensure credentials are sent
      });
      
      // CRITICAL: Log full response for debugging
      console.log("=== LOGIN RESPONSE DEBUG ===");
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);
      console.log("Data:", response.data);
      console.log("Response type:", typeof response.data);
      
      // FastAPI Users BearerTransport returns JSON: {"access_token": "..."}
      // But response might be in different format - handle both
      let access_token = null;
      
      if (response.data && typeof response.data === 'object') {
        access_token = response.data.access_token || response.data.accessToken;
      } else if (typeof response.data === 'string') {
        // If response is a string, try to parse it
        try {
          const parsed = JSON.parse(response.data);
          access_token = parsed.access_token || parsed.accessToken;
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
        }
      }
      
      // Check for access_token in response - throw error if missing
      if (!access_token) {
        const errorMsg = 'Invalid email or password';
        console.error("❌ LOGIN FAILED: No access token in response");
        console.error("Full response:", response);
        console.error("Response data:", response.data);
        setLoading(false);
        throw new Error(errorMsg);
      }
      
      console.log("✅ Access token received:", access_token ? access_token.substring(0, 20) + '...' : 'MISSING');
      
      // Set cookie with proper options for cross-origin support
      // CRITICAL: Set cookie with domain/path that works for localhost
      const cookieOptions = {
        expires: 7,
        sameSite: 'lax', // Fixed: Removed TypeScript 'as const' syntax
        secure: window.location.protocol === 'https:',
        path: '/', // Ensure cookie is available site-wide
      };
      
      Cookies.set('access_token', access_token, cookieOptions);
      
      // Verify cookie was set
      const cookieValue = Cookies.get('access_token');
      console.log("🍪 Cookie set - verification:", cookieValue ? 'SUCCESS' : 'FAILED');
      console.log("🍪 Cookie value (first 20 chars):", cookieValue ? cookieValue.substring(0, 20) + '...' : 'NONE');
      
      if (!cookieValue) {
        console.error("❌ CRITICAL: Cookie was not set! This will cause login to fail.");
        setLoading(false);
        throw new Error('Failed to set authentication cookie. Please check browser settings.');
      }
      
      // CRITICAL: Small delay to ensure cookie is available
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch user data with explicit error handling
      console.log("📡 Fetching user data from /users/me...");
      let userResponse;
      try {
        userResponse = await api.get('/users/me', {
          withCredentials: true, // Explicitly ensure credentials are sent
        });
        console.log("✅ User data fetched successfully:", userResponse.data);
      } catch (userError) {
        console.error("❌ FAILED to fetch user data:", userError);
        console.error("Error details:", {
          status: userError.response?.status,
          statusText: userError.response?.statusText,
          data: userError.response?.data,
          headers: userError.response?.headers,
        });
        // Clear cookie if user fetch fails
        Cookies.remove('access_token');
        setLoading(false);
        throw new Error('Login succeeded but failed to fetch user information. Please try again.');
      }
      
      // Update state synchronously - use functional updates to ensure React processes them
      setUser(userResponse.data);
      setIsAuthenticated(true);
      setLoading(false);
      
      if (import.meta.env.DEV) {
        console.log('Login successful - User:', userResponse.data?.email, 'isAuthenticated set to true');
      }
      
      return { success: true, user: userResponse.data };
    } catch (error) {
      console.error("❌ Login error caught:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        name: error.name,
        fullError: error
      });
      
      setLoading(false);
      
      // Handle network errors (no response from server)
      if (!error.response) {
        console.error("❌ Network error - Backend may not be running or CORS issue");
        return {
          success: false,
          error: 'Unable to connect to the server. Please check that the backend is running and try again.'
        };
      }
      
      // Handle different HTTP status codes
      const status = error.response?.status;
      let errorMessage = 'Invalid email or password';
      
      if (status === 401 || status === 422) {
        // Authentication failed - invalid credentials
        errorMessage = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      'Invalid email or password';
      } else if (status === 400) {
        // Bad request - validation error
        errorMessage = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      'Invalid request. Please check your input.';
      } else if (status === 404) {
        // Endpoint not found
        errorMessage = 'Login endpoint not found. Please check the API configuration.';
      } else if (status === 500 || status >= 500) {
        // Server error
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.response?.data?.detail) {
        // Use detail from response
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        // Use message from response
        errorMessage = error.response.data.message;
      } else if (error.message && error.message !== 'Login failed: No access token received from server') {
        // Use error message
        errorMessage = error.message;
      }
      
      console.error("📝 Returning error message:", errorMessage);
      
      return {
        success: false,
        error: errorMessage
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
    window.location.href = '/';
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const loginWithProvider = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  // Derived value: check if user is admin
  const isAdmin = user?.role === 'admin';

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
        loginWithProvider
      }
    },
    children
  );
};
