/**
 * Quota Enforcement Middleware
 * Checks user quota before allowing feature usage
 */

import { canPerformAction } from '../services/usage.service.js';

/**
 * Middleware factory to check quota for a specific feature
 * @param {string} feature - Feature name (e.g., 'articles', 'images', 'research')
 * @returns {Function} Express middleware function
 */
export const checkQuota = (feature) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated (should be set by auth middleware)
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      // Check if user can perform the action
      // canPerformAction handles feature name mapping internally
      const quotaCheck = await canPerformAction(req.user.id, feature);

      if (!quotaCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: `You have reached your ${feature} quota limit. Please upgrade your plan to continue.`,
            details: {
              feature,
              currentUsage: quotaCheck.currentUsage,
              limit: quotaCheck.limit,
              plan: quotaCheck.plan
            }
          }
        });
      }

      // Attach quota info to request for use in route handlers
      req.quota = {
        feature: quotaCheck.feature || feature,
        currentUsage: quotaCheck.currentUsage,
        limit: quotaCheck.limit,
        remaining: quotaCheck.limit === -1 ? -1 : quotaCheck.limit - quotaCheck.currentUsage,
        plan: quotaCheck.plan
      };

      next();
    } catch (error) {
      console.error('Quota check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'QUOTA_CHECK_ERROR',
          message: 'Failed to check quota. Please try again.'
        }
      });
    }
  };
};
