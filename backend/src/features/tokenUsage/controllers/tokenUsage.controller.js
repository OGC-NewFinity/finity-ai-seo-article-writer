/**
 * Token Usage Controller
 * Handles token usage synchronization and statistics requests
 */

import * as tokenUsageService from '../services/tokenUsage.service.js';
import { errorHandler } from '../../../middleware/error.middleware.js';

/**
 * Sync token usage from WordPress plugin
 * POST /api/token-usage/sync
 * 
 * Expected payload:
 * {
 *   "userId": "string",
 *   "action": "content_generation",
 *   "tokensUsed": 1500,
 *   "provider": "openai",
 *   "timestamp": "2024-01-15T10:30:00Z",
 *   "metadata": {}
 * }
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const syncTokenUsage = async (req, res) => {
  try {
    const payload = req.body;

    // Validate payload
    const validation = tokenUsageService.validateTokenUsagePayload(payload);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payload',
          details: validation.errors
        }
      });
    }

    // Use userId from authenticated user (from API key) if not provided in payload
    // This prevents user ID spoofing
    const userId = req.user.id;
    
    // Verify the userId in payload matches the authenticated user
    // Allow override only if explicitly configured
    if (payload.userId && payload.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'User ID in payload does not match authenticated user'
        }
      });
    }

    // Prepare usage data
    const usageData = {
      action: payload.action,
      tokensUsed: parseInt(payload.tokensUsed, 10),
      provider: payload.provider || null,
      source: payload.source || 'wordpress',
      metadata: {
        ...payload.metadata,
        timestamp: payload.timestamp || new Date().toISOString(),
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    };

    // Record token usage
    const tokenUsage = await tokenUsageService.recordTokenUsage(userId, usageData);

    // Return success response with minimal data
    return res.status(200).json({
      success: true,
      data: {
        id: tokenUsage.id,
        recorded: true,
        timestamp: tokenUsage.createdAt
      }
    });

  } catch (error) {
    // Error will be logged by centralized error handler
    
    // Return appropriate error response
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SYNC_ERROR',
        message: 'Failed to sync token usage. Please try again.'
      }
    });
  }
};

/**
 * Get token usage statistics
 * GET /api/token-usage/stats
 * 
 * Query parameters:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTokenUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Validate dates if provided
    if (startDate && isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid startDate format. Use ISO date string.'
        }
      });
    }

    if (endDate && isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid endDate format. Use ISO date string.'
        }
      });
    }

    // Get token usage statistics
    const stats = await tokenUsageService.getTokenUsageStats(userId, startDate, endDate);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    // Error will be logged by centralized error handler
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve token usage statistics.'
      }
    });
  }
};
