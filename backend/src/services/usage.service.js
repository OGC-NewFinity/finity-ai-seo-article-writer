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
 */
export const incrementUsage = async (userId, feature, amount = 1) => {
  const usage = await getCurrentUsage(userId);
  const plan = usage.subscription.plan;

  // Check if within limit
  if (!isWithinLimit(plan, feature, usage[`${feature}Generated`] || usage[feature])) {
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

  return await prisma.usage.update({
    where: { id: usage.id },
    data: updateData
  });
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
 */
export const resetMonthlyUsage = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Find all usage records that need reset
  const expiredUsage = await prisma.usage.findMany({
    where: {
      periodEnd: {
        lt: monthStart
      }
    }
  });

  // Create new usage records for current period
  for (const usage of expiredUsage) {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    await prisma.usage.create({
      data: {
        userId: usage.userId,
        subscriptionId: usage.subscriptionId,
        period: 'MONTHLY',
        periodStart: monthStart,
        periodEnd: monthEnd
      }
    });
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
