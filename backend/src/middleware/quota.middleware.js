/**
 * Quota Enforcement Middleware
 * Checks user quota before allowing feature usage
 */

import { 
  canPerformAction, 
  checkTokenUsage, 
  checkMediaDuration, 
  checkDailyApiCalls 
} from '../services/usage.service.js';

/**
 * Middleware factory to check quota for a specific feature
 * @param {string} feature - Feature name (e.g., 'articles', 'images', 'research')
 * @param {Object} options - Optional metadata for additional quota checks
 * @param {number} options.tokensUsed - Tokens to be used in this request (optional)
 * @param {number} options.mediaDuration - Media duration in seconds (optional)
 * @param {string} options.dailyCountKey - Key for daily API call tracking (optional, default: 'apiCalls')
 * @returns {Function} Express middleware function
 */
export const checkQuota = (feature, options = {}) => {
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
            message: `Quota exceeded. Upgrade your plan to continue.`,
            details: {
              feature,
              currentUsage: quotaCheck.currentUsage,
              limit: quotaCheck.limit,
              remaining: quotaCheck.limit === -1 ? -1 : Math.max(0, quotaCheck.limit - quotaCheck.currentUsage),
              plan: quotaCheck.plan
            }
          }
        });
      }

      // Check additional quota metrics if provided in options, request body, or query params
      // Priority: options > req.body.quotaMetadata > req.query.quotaMetadata > defaults
      const requestMetadata = req.body?.quotaMetadata || req.query?.quotaMetadata || {};
      const metadata = { ...requestMetadata, ...options }; // Options override request metadata
      const {
        tokensUsed = 0,
        mediaDuration = 0,
        dailyCountKey = 'apiCalls'
      } = metadata;

      // Initialize quota info object
      const quotaInfo = {
        feature: quotaCheck.feature || feature,
        currentUsage: quotaCheck.currentUsage,
        limit: quotaCheck.limit,
        remaining: quotaCheck.limit === -1 ? -1 : quotaCheck.limit - quotaCheck.currentUsage,
        plan: quotaCheck.plan
      };

      // Check token usage limit if tokensUsed is provided
      let tokenCheck = null;
      if (tokensUsed > 0) {
        tokenCheck = await checkTokenUsage(req.user.id, tokensUsed);
        quotaInfo.tokenQuota = {
          currentUsage: tokenCheck.currentUsage,
          limit: tokenCheck.limit,
          remaining: tokenCheck.remaining,
          requested: tokensUsed
        };
        
        if (!tokenCheck.allowed) {
          // If projected usage exceeds limit, block the request
          if (tokenCheck.projectedUsage > tokenCheck.limit) {
            return res.status(403).json({
              success: false,
              error: {
                code: 'QUOTA_EXCEEDED',
                type: 'token',
                message: 'Quota exceeded. Upgrade your plan to continue.',
                details: {
                  feature: 'token_usage',
                  currentUsage: tokenCheck.currentUsage,
                  limit: tokenCheck.limit,
                  requested: tokensUsed,
                  projectedUsage: tokenCheck.projectedUsage,
                  remaining: Math.max(0, tokenCheck.limit - tokenCheck.currentUsage),
                  plan: tokenCheck.plan
                }
              }
            });
          }
        }
      }

      // Check media duration limit if mediaDuration is provided
      let mediaCheck = null;
      if (mediaDuration > 0) {
        mediaCheck = await checkMediaDuration(req.user.id, mediaDuration);
        quotaInfo.mediaQuota = {
          currentUsage: mediaCheck.currentUsage,
          limit: mediaCheck.limit,
          remaining: mediaCheck.remaining,
          requested: mediaDuration
        };
        
        if (!mediaCheck.allowed) {
          // If projected duration exceeds limit, block the request
          if (mediaCheck.projectedDuration > mediaCheck.limit) {
            return res.status(403).json({
              success: false,
              error: {
                code: 'QUOTA_EXCEEDED',
                type: 'media',
                message: 'Quota exceeded. Upgrade your plan to continue.',
                details: {
                  feature: 'media_duration',
                  currentUsage: mediaCheck.currentUsage,
                  limit: mediaCheck.limit,
                  requested: mediaDuration,
                  projectedDuration: mediaCheck.projectedDuration,
                  remaining: Math.max(0, mediaCheck.limit - mediaCheck.currentUsage),
                  plan: mediaCheck.plan
                }
              }
            });
          }
        }
      }

      // Check daily API call limit if dailyCountKey is provided
      let dailyCheck = null;
      if (dailyCountKey) {
        dailyCheck = await checkDailyApiCalls(req.user.id, dailyCountKey);
        quotaInfo.dailyQuota = {
          dailyCountKey,
          currentUsage: dailyCheck.currentUsage,
          limit: dailyCheck.limit,
          remaining: dailyCheck.remaining
        };
        
        if (!dailyCheck.allowed) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'QUOTA_EXCEEDED',
              type: 'daily',
              message: 'Quota exceeded. Upgrade your plan to continue.',
              details: {
                feature: dailyCountKey,
                currentUsage: dailyCheck.currentUsage,
                limit: dailyCheck.limit,
                remaining: dailyCheck.remaining,
                plan: dailyCheck.plan
              }
            }
          });
        }
      }

      // Attach quota info to request for use in route handlers
      req.quota = quotaInfo;

      next();
    } catch (error) {
      // Error will be logged by centralized error handler
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
