import { useState, useEffect } from 'react';
import subscriptionApi from '../services/subscriptionApi.js';
import { checkFeatureQuota } from '../utils/quotaChecker.js';

/**
 * React hook for checking quota status
 * @returns {Object} { usage, loading, error, checkQuota, refresh }
 */
export const useQuota = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await subscriptionApi.get('/api/subscription/usage');
      if (response.data.success) {
        setUsage(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load usage:', err);
      setError(err.response?.data?.error?.message || 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  /**
   * Check quota for a specific feature
   * @param {string} feature - Feature name ('articles', 'images', 'videos', 'research', 'wordpress')
   * @returns {Object} Quota check result
   */
  const checkQuota = (feature) => {
    if (!usage) {
      return {
        allowed: false,
        warning: false,
        exceeded: false,
        percentage: 0,
        remaining: 0,
        loading: true
      };
    }

    return checkFeatureQuota(usage, feature);
  };

  return {
    usage,
    loading,
    error,
    checkQuota,
    refresh: loadUsage
  };
};
