import axios from 'axios';
import Cookies from 'js-cookie';

// Subscription backend URL
// Task specifies port 8000, but Node.js backend runs on 3001
// Default to 8000 as per task requirements, override via env var if needed
const SUBSCRIPTION_API_URL = import.meta.env.VITE_SUBSCRIPTION_API_URL || 'http://localhost:8000';

const subscriptionApi = axios.create({
  baseURL: SUBSCRIPTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor to ensure cookies are sent
subscriptionApi.interceptors.request.use(
  (config) => {
    // withCredentials: true ensures cookies are sent automatically
    // The access_token cookie set by the FastAPI auth backend will be sent
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
subscriptionApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired
      Cookies.remove('access_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default subscriptionApi;
