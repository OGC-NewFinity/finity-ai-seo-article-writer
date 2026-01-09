/**
 * Usage Tracking Service
 * Handles usage increment, validation, and reset
 */

import prisma from '../config/database.js';
import { getFeatureLimit, isWithinLimit } from '../utils/featureFlags.js';

/**
 * Get current usage for a user
 */
export const getCurrentUsage = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const usage = await prisma.usage.findFirst({
    where: {
      userId,
      periodStart: {
        gte: monthStart,
        lte: monthEnd
      }
    },
    include: {
      subscription: true
    }
  });

  if (!usage) {
    // Create default usage record for current period
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('User subscription not found');
    }

    return await prisma.usage.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        period: 'MONTHLY',
        periodStart: monthStart,
        periodEnd: monthEnd
      },
      include: {
        subscription: true
      }
    });
  }

  return usage;
};

/**
 * Increment usage for a feature
 * Automatically checks quota and sends notifications if needed
 */
export const incrementUsage = async (userId, feature, amount = 1) => {
  const usage = await getCurrentUsage(userId);
  const plan = usage.subscription.plan;

  // Map feature names for quota checking
  const featureMap = {
    'articlesGenerated': { usageField: 'articlesGenerated', planFeature: 'articles' },
    'imagesGenerated': { usageField: 'imagesGenerated', planFeature: 'images' },
    'videosGenerated': { usageField: 'videosGenerated', planFeature: 'videos' },
    'researchQueries': { usageField: 'researchQueries', planFeature: 'research' },
    'articlesPublished': { usageField: 'articlesPublished', planFeature: 'wordpress' },
    'articles': { usageField: 'articlesGenerated', planFeature: 'articles' },
    'images': { usageField: 'imagesGenerated', planFeature: 'images' },
    'videos': { usageField: 'videosGenerated', planFeature: 'videos' },
    'research': { usageField: 'researchQueries', planFeature: 'research' },
    'wordpress': { usageField: 'articlesPublished', planFeature: 'wordpress' }
  };

  const mapping = featureMap[feature] || { usageField: feature, planFeature: feature };
  const currentUsage = usage[mapping.usageField] || 0;
  const planFeature = mapping.planFeature;

  // Check if within limit
  if (!isWithinLimit(plan, planFeature, currentUsage)) {
    throw new Error(`Usage limit exceeded for ${feature}`);
  }

  // Increment usage
  const updateData = {};
  if (feature.includes('Generated')) {
    updateData[feature] = { increment: amount };
  } else if (feature === 'researchQueries') {
    updateData.researchQueries = { increment: amount };
  } else if (feature === 'articlesPublished') {
    updateData.articlesPublished = { increment: amount };
  }

  const updatedUsage = await prisma.usage.update({
    where: { id: usage.id },
    data: updateData,
    include: {
      subscription: true
    }
  });

  // Check quota and send notifications if needed (async, don't block)
  // Get updated usage value
  const newUsageValue = updatedUsage[mapping.usageField] || 0;
  const limit = getFeatureLimit(plan, planFeature);

  // Check quota asynchronously (don't block the increment operation)
  if (limit !== -1 && process.env.ENABLE_QUOTA_NOTIFICATIONS !== 'false') {
    import('./notification.service.js').then(({ checkQuotaAndNotify }) => {
      checkQuotaAndNotify(userId, planFeature, newUsageValue, limit).catch(() => {
        // Silently fail - quota check should not break usage increment
      });
    }).catch(() => {
      // Silently fail - notification service load failure should not break usage increment
    });
  }

  return updatedUsage;
};

/**
 * Check if user can perform action
 * @param {string} userId - User ID
 * @param {string} feature - Feature name (e.g., 'articlesGenerated', 'imagesGenerated', 'researchQueries')
 * @returns {Object} Quota check result
 */
export const canPerformAction = async (userId, feature) => {
  try {
    const usage = await getCurrentUsage(userId);
    const plan = usage.subscription.plan;
    
    // Map feature names to usage fields and plan feature names
    const featureMap = {
      'articlesGenerated': { usageField: 'articlesGenerated', planFeature: 'articles' },
      'imagesGenerated': { usageField: 'imagesGenerated', planFeature: 'images' },
      'videosGenerated': { usageField: 'videosGenerated', planFeature: 'videos' },
      'researchQueries': { usageField: 'researchQueries', planFeature: 'research' },
      'articlesPublished': { usageField: 'articlesPublished', planFeature: 'wordpress' },
      // Also support short names
      'articles': { usageField: 'articlesGenerated', planFeature: 'articles' },
      'images': { usageField: 'imagesGenerated', planFeature: 'images' },
      'videos': { usageField: 'videosGenerated', planFeature: 'videos' },
      'research': { usageField: 'researchQueries', planFeature: 'research' },
      'wordpress': { usageField: 'articlesPublished', planFeature: 'wordpress' }
    };

    const mapping = featureMap[feature] || { usageField: feature, planFeature: feature };
    const currentUsage = usage[mapping.usageField] || 0;
    const planFeature = mapping.planFeature;
    
    return {
      allowed: isWithinLimit(plan, planFeature, currentUsage),
      currentUsage,
      limit: getFeatureLimit(plan, planFeature),
      plan,
      feature: planFeature
    };
  } catch (error) {
    return {
      allowed: false,
      error: error.message
    };
  }
};

/**
 * Reset monthly usage (run via cron job)
 * Also integrates with token usage reset and sends notifications
 */
export const resetMonthlyUsage = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // Find all usage records that need reset
    const expiredUsage = await prisma.usage.findMany({
      where: {
        periodEnd: {
          lt: monthStart
        }
      },
      include: {
        user: {
          include: {
            subscription: true
          }
        }
      }
    });

    let resetCount = 0;
    let notificationCount = 0;
    const errors = [];

    // Reset each user's usage
    for (const usage of expiredUsage) {
      try {
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        // Create new usage record for current period
        await prisma.usage.create({
          data: {
            userId: usage.userId,
            subscriptionId: usage.subscriptionId,
            period: 'MONTHLY',
            periodStart: monthStart,
            periodEnd: monthEnd
          }
        });

        resetCount++;

        // Send quota reset notification (optional - can be disabled if too noisy)
        if (process.env.SEND_QUOTA_RESET_EMAILS !== 'false') {
          try {
            const { sendQuotaResetNotification } = await import('./notification.service.js');
            await sendQuotaResetNotification(usage.userId);
            notificationCount++;
          } catch (notifError) {
            // Silently fail - notification failure should not break reset process
          }
        }

        // Token usage doesn't need explicit reset as it's time-based
        // But we could optionally archive old token usage records here
        // For now, token usage resets are implicit based on createdAt dates
        
      } catch (error) {
        errors.push({ userId: usage.userId, error: error.message });
      }
    }

    return {
      success: true,
      totalRecords: expiredUsage.length,
      resetCount,
      notificationCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    // Re-throw error - will be caught by job error handler
    throw error;
  }
};

/**
 * Check token usage limit
 * @param {string} userId - User ID
 * @param {number} tokensUsed - Tokens to be used in this request
 * @returns {Object} Token quota check result
 */
export const checkTokenUsage = async (userId, tokensUsed = 0) => {
  try {
    const usage = await getCurrentUsage(userId);
    const plan = usage.subscription.plan;
    const limit = getFeatureLimit(plan, 'tokenLimit');
    
    // Get current token usage from TokenUsage records (actual tracking)
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get actual token usage from TokenUsage records
    const tokenUsageRecords = await prisma.tokenUsage.findMany({
      where: {
        userId,
        createdAt: {
          gte: monthStart
        }
      },
      select: {
        tokensUsed: true
      }
    });
    
    // Calculate actual token usage
    const currentTokenUsage = tokenUsageRecords.reduce((sum, record) => sum + (record.tokensUsed || 0), 0);
    
    const projectedUsage = currentTokenUsage + tokensUsed;
    
    if (limit === -1) {
      return {
        allowed: true,
        currentUsage: currentTokenUsage,
        limit: -1,
        remaining: -1,
        plan
      };
    }
    
    return {
      allowed: projectedUsage <= limit,
      currentUsage: currentTokenUsage,
      limit,
      remaining: Math.max(0, limit - currentTokenUsage),
      plan,
      projectedUsage
    };
  } catch (error) {
    return {
      allowed: false,
      error: error.message
    };
  }
};

/**
 * Check media duration limit
 * @param {string} userId - User ID
 * @param {number} mediaDuration - Duration in seconds for this request
 * @returns {Object} Media duration quota check result
 */
export const checkMediaDuration = async (userId, mediaDuration = 0) => {
  try {
    const usage = await getCurrentUsage(userId);
    const plan = usage.subscription.plan;
    const limit = getFeatureLimit(plan, 'mediaDurationLimit');
    
    // Get current media duration usage (calculated from media assets or stored)
    // For now, calculate from MediaAsset records
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const mediaAssets = await prisma.mediaAsset.findMany({
      where: {
        userId,
        createdAt: { gte: monthStart }
      },
      select: {
        metadata: true
      }
    });
    
    const currentMediaDuration = mediaAssets.reduce((total, asset) => {
      const duration = asset.metadata?.duration || 0;
      return total + (typeof duration === 'number' ? duration : 0);
    }, 0);
    
    const projectedDuration = currentMediaDuration + mediaDuration;
    
    if (limit === -1) {
      return {
        allowed: true,
        currentUsage: currentMediaDuration,
        limit: -1,
        remaining: -1,
        plan
      };
    }
    
    return {
      allowed: projectedDuration <= limit,
      currentUsage: currentMediaDuration,
      limit,
      remaining: Math.max(0, limit - currentMediaDuration),
      plan,
      projectedDuration
    };
  } catch (error) {
    return {
      allowed: false,
      error: error.message
    };
  }
};

/**
 * Check daily API call limit
 * @param {string} userId - User ID
 * @param {string} dailyCountKey - Key to identify the daily count type (e.g., 'apiCalls', 'researchQueries')
 * @returns {Object} Daily API call quota check result
 */
export const checkDailyApiCalls = async (userId, dailyCountKey = 'apiCalls') => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { user: true }
    });
    
    if (!subscription) {
      throw new Error('User subscription not found');
    }
    
    const plan = subscription.plan;
    const limit = getFeatureLimit(plan, 'dailyApiCalls');
    
    if (limit === -1) {
      return {
        allowed: true,
        currentUsage: 0,
        limit: -1,
        remaining: -1,
        plan
      };
    }
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Count API calls today based on the dailyCountKey
    // This counts requests from different sources based on the key
    let dailyCount = 0;
    
    if (dailyCountKey === 'apiCalls') {
      // Count all API-related actions today (articles, images, videos, research)
      const [articles, images, videos, research] = await Promise.all([
        prisma.article.count({
          where: { userId, createdAt: { gte: today, lt: tomorrow } }
        }),
        prisma.mediaAsset.count({
          where: { userId, type: 'IMAGE', createdAt: { gte: today, lt: tomorrow } }
        }),
        prisma.mediaAsset.count({
          where: { userId, type: 'VIDEO', createdAt: { gte: today, lt: tomorrow } }
        }),
        prisma.researchQuery.count({
          where: { userId, createdAt: { gte: today, lt: tomorrow } }
        })
      ]);
      
      dailyCount = articles + images + videos + research;
    } else if (dailyCountKey === 'researchQueries') {
      dailyCount = await prisma.researchQuery.count({
        where: { userId, createdAt: { gte: today, lt: tomorrow } }
      });
    } else {
      // Default: count all user actions today
      dailyCount = await prisma.article.count({
        where: { userId, createdAt: { gte: today, lt: tomorrow } }
      });
    }
    
    return {
      allowed: dailyCount < limit,
      currentUsage: dailyCount,
      limit,
      remaining: Math.max(0, limit - dailyCount),
      plan,
      dailyCountKey
    };
  } catch (error) {
    return {
      allowed: false,
      error: error.message
    };
  }
};

/**
 * Get usage statistics for user
 */
export const getUsageStats = async (userId) => {
  const usage = await getCurrentUsage(userId);
  const plan = usage.subscription.plan;
  
  return {
    plan,
    articles: {
      used: usage.articlesGenerated,
      limit: getFeatureLimit(plan, 'articles'),
      remaining: getFeatureLimit(plan, 'articles') === -1 
        ? -1 
        : Math.max(0, getFeatureLimit(plan, 'articles') - usage.articlesGenerated)
    },
    images: {
      used: usage.imagesGenerated,
      limit: getFeatureLimit(plan, 'images'),
      remaining: getFeatureLimit(plan, 'images') === -1 
        ? -1 
        : Math.max(0, getFeatureLimit(plan, 'images') - usage.imagesGenerated)
    },
    videos: {
      used: usage.videosGenerated,
      limit: getFeatureLimit(plan, 'videos'),
      remaining: getFeatureLimit(plan, 'videos') === -1 
        ? -1 
        : Math.max(0, getFeatureLimit(plan, 'videos') - usage.videosGenerated)
    },
    research: {
      used: usage.researchQueries,
      limit: getFeatureLimit(plan, 'research'),
      remaining: getFeatureLimit(plan, 'research') === -1 
        ? -1 
        : Math.max(0, getFeatureLimit(plan, 'research') - usage.researchQueries)
    },
    wordpress: {
      used: usage.articlesPublished,
      limit: getFeatureLimit(plan, 'wordpress'),
      remaining: getFeatureLimit(plan, 'wordpress') === -1 
        ? -1 
        : Math.max(0, getFeatureLimit(plan, 'wordpress') - usage.articlesPublished)
    }
  };
};
