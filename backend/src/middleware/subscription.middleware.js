/**
 * Subscription Middleware
 * Validates subscription and feature access before operations
 * Uses unified plan structure for validation
 */

import { hasFeatureAccess } from '../features/subscription/services/subscription.service.js';
import { canPerformAction } from '../services/usage.service.js';
import { isValidTier, getAvailableUpgrades } from '../utils/unifiedPlans.js';

/**
 * Check if user has feature access
 */
export const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'User not authenticated'
          }
        });
      }

      const hasAccess = await hasFeatureAccess(userId, feature);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_NOT_AVAILABLE',
            message: `This feature is not available in your current plan. Please upgrade to access ${feature}.`
          }
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      });
    }
  };
};

/**
 * Check usage limits before operation
 */
export const checkUsageLimit = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'User not authenticated'
          }
        });
      }

      const check = await canPerformAction(userId, feature);
      
      if (!check.allowed) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'USAGE_LIMIT_EXCEEDED',
            message: `You have reached your monthly limit for ${feature}. Please upgrade your plan or wait for the next billing cycle.`,
            currentUsage: check.currentUsage,
            limit: check.limit,
            plan: check.plan
          }
        });
      }

      // Attach usage info to request
      req.usageInfo = check;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      });
    }
  };
};

/**
 * Combined middleware: feature + usage check
 */
export const requireFeatureAndUsage = (feature) => {
  return [requireFeature(feature), checkUsageLimit(feature)];
};
