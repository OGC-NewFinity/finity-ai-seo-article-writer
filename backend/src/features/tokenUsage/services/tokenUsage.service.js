/**
 * Token Usage Service
 * Handles token usage tracking and synchronization from WordPress and other sources
 */

import prisma from '../../../config/database.js';
import { getCurrentUsage } from '../../../services/usage.service.js';

/**
 * Record token usage for a user
 * 
 * @param {string} userId - User ID
 * @param {Object} usageData - Usage data object
 * @param {string} usageData.action - Action type (e.g., 'content_generation', 'research', 'image_generation')
 * @param {number} usageData.tokensUsed - Number of tokens used
 * @param {string} usageData.provider - AI provider (e.g., 'openai', 'gemini')
 * @param {string} usageData.source - Source of usage ('wordpress', 'platform', 'api')
 * @param {Object} usageData.metadata - Optional metadata (request details, etc.)
 * @returns {Promise<Object>} Created token usage record
 */
export const recordTokenUsage = async (userId, usageData) => {
  try {
    // Validate required fields
    if (!userId || !usageData.action || !usageData.tokensUsed) {
      throw new Error('Missing required fields: userId, action, and tokensUsed are required');
    }

    // Validate tokensUsed is a positive integer
    const tokensUsed = parseInt(usageData.tokensUsed, 10);
    if (isNaN(tokensUsed) || tokensUsed < 0) {
      throw new Error('tokensUsed must be a positive integer');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create token usage record
    const tokenUsage = await prisma.tokenUsage.create({
      data: {
        userId,
        action: usageData.action,
        provider: usageData.provider || null,
        tokensUsed,
        source: usageData.source || 'platform',
        metadata: usageData.metadata || {}
      }
    });

    // Update aggregated usage statistics (optional - for faster queries)
    // This can be done asynchronously or via a background job
    await updateAggregatedUsage(userId, tokensUsed, usageData.action);

    return tokenUsage;
  } catch (error) {
    console.error('Error recording token usage:', error);
    throw error;
  }
};

/**
 * Update aggregated usage statistics
 * This updates the monthly Usage record with token totals
 * 
 * @param {string} userId - User ID
 * @param {number} tokensUsed - Tokens used in this operation
 * @param {string} action - Action type
 * @returns {Promise<void>}
 */
const updateAggregatedUsage = async (userId, tokensUsed, action) => {
  try {
    // Get current usage record
    const usage = await getCurrentUsage(userId);

    // Update usage record (if we had a tokensUsed field in Usage model)
    // For now, we'll track it separately in TokenUsage table
    // This allows for more detailed analytics later
    
    // If needed in the future, we can add:
    // - tokensUsed field to Usage model
    // - Update it here: usage.tokensUsed += tokensUsed
    
    // Aggregation completed (no logging needed)
  } catch (error) {
    // Don't fail the main operation if aggregation fails
    // Silently fail - aggregation is non-critical
  }
};

/**
 * Get token usage statistics for a user
 * 
 * @param {string} userId - User ID
 * @param {Date} startDate - Optional start date for period
 * @param {Date} endDate - Optional end date for period
 * @returns {Promise<Object>} Token usage statistics
 */
export const getTokenUsageStats = async (userId, startDate = null, endDate = null) => {
  try {
    const now = new Date();
    const monthStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get token usage records for the period
    const tokenUsages = await prisma.tokenUsage.findMany({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const totalTokens = tokenUsages.reduce((sum, usage) => sum + usage.tokensUsed, 0);
    
    // Group by action
    const byAction = {};
    tokenUsages.forEach(usage => {
      if (!byAction[usage.action]) {
        byAction[usage.action] = { count: 0, tokens: 0 };
      }
      byAction[usage.action].count++;
      byAction[usage.action].tokens += usage.tokensUsed;
    });

    // Group by provider
    const byProvider = {};
    tokenUsages.forEach(usage => {
      const provider = usage.provider || 'unknown';
      if (!byProvider[provider]) {
        byProvider[provider] = { count: 0, tokens: 0 };
      }
      byProvider[provider].count++;
      byProvider[provider].tokens += usage.tokensUsed;
    });

    // Group by source
    const bySource = {};
    tokenUsages.forEach(usage => {
      const source = usage.source || 'platform';
      if (!bySource[source]) {
        bySource[source] = { count: 0, tokens: 0 };
      }
      bySource[source].count++;
      bySource[source].tokens += usage.tokensUsed;
    });

    return {
      period: {
        start: monthStart,
        end: monthEnd
      },
      totalTokens,
      totalOperations: tokenUsages.length,
      byAction,
      byProvider,
      bySource,
      records: tokenUsages
    };
  } catch (error) {
    // Error will be logged by centralized error handler
    throw error;
  }
};

/**
 * Validate token usage payload from WordPress plugin
 * 
 * @param {Object} payload - Payload from WordPress
 * @returns {Object} Validation result with isValid flag and errors
 */
export const validateTokenUsagePayload = (payload) => {
  const errors = [];

  // Check required fields
  if (!payload.userId || typeof payload.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }

  if (!payload.action || typeof payload.action !== 'string') {
    errors.push('action is required and must be a string');
  }

  if (payload.tokensUsed === undefined || payload.tokensUsed === null) {
    errors.push('tokensUsed is required');
  } else {
    const tokensUsed = parseInt(payload.tokensUsed, 10);
    if (isNaN(tokensUsed) || tokensUsed < 0) {
      errors.push('tokensUsed must be a positive integer');
    }
  }

  // Validate timestamp if provided
  if (payload.timestamp && isNaN(new Date(payload.timestamp).getTime())) {
    errors.push('timestamp must be a valid ISO date string');
  }

  // Validate action type (optional but recommended)
  const validActions = [
    'content_generation',
    'research',
    'image_generation',
    'video_generation',
    'audio_generation',
    'seo_analysis',
    'article_publish',
    'other'
  ];

  if (payload.action && !validActions.includes(payload.action)) {
    // Allow custom actions - no warning needed
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
