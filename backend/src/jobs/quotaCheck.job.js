/**
 * Quota Check Cron Job
 * Periodically checks all users' quota usage and sends notifications
 * Runs daily to check for users approaching or exceeding limits
 */

import cron from 'node-cron';
import prisma from '../config/database.js';
import { getCurrentUsage } from '../services/usage.service.js';
import { getFeatureLimit } from '../utils/featureFlags.js';
import { checkQuotaAndNotify } from '../features/notifications/services/notification.service.js';

/**
 * Check quota for a single user and send notifications if needed
 */
const checkUserQuota = async (userId) => {
  try {
    const usage = await getCurrentUsage(userId);
    const plan = usage.subscription.plan;

    // Features to check
    const features = [
      { key: 'articles', usageField: 'articlesGenerated' },
      { key: 'images', usageField: 'imagesGenerated' },
      { key: 'videos', usageField: 'videosGenerated' },
      { key: 'research', usageField: 'researchQueries' },
      { key: 'wordpress', usageField: 'articlesPublished' }
    ];

    const results = [];

    // Check each feature
    for (const feature of features) {
      const limit = getFeatureLimit(plan, feature.key);
      if (limit === -1) continue; // Skip unlimited features

      const currentUsage = usage[feature.usageField] || 0;
      const result = await checkQuotaAndNotify(userId, feature.key, currentUsage, limit);
      
      if (result.notified) {
        results.push({
          feature: feature.key,
          ...result
        });
      }
    }

    // Check token usage separately
    try {
      const { getTokenUsageStats } = await import('../features/tokenUsage/services/tokenUsage.service.js');
      const tokenStats = await getTokenUsageStats(userId);
      const tokenLimit = getFeatureLimit(plan, 'tokenLimit');
      
      if (tokenLimit !== -1 && tokenStats.totalTokens > 0) {
        const tokenResult = await checkQuotaAndNotify(
          userId, 
          'tokens', 
          tokenStats.totalTokens, 
          tokenLimit
        );
        
        if (tokenResult.notified) {
          results.push({
            feature: 'tokens',
            ...tokenResult
          });
        }
      }
    } catch (tokenError) {
      // Silently fail - token check should not break quota check
    }

    return results;
  } catch (error) {
    // Error will be logged by centralized error handler if needed
    return [];
  }
};

/**
 * Check quotas for all active users
 */
const checkAllUsersQuota = async () => {
  try {
    // Get all users with active subscriptions
    const users = await prisma.user.findMany({
      where: {
        subscription: {
          status: 'ACTIVE'
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    let totalNotifications = 0;
    const errors = [];

    // Check quota for each user
    for (const user of users) {
      try {
        const results = await checkUserQuota(user.id);
        if (results.length > 0) {
          totalNotifications += results.length;
        }
      } catch (error) {
        errors.push({ userId: user.id, error: error.message });
      }
    }

    return {
      success: true,
      totalUsers: users.length,
      notificationsSent: totalNotifications,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    // Re-throw error - will be caught by job error handler
    throw error;
  }
};

/**
 * Schedule daily quota check
 * Runs daily at 09:00 UTC
 * Cron format: '0 9 * * *' (minute hour day month day-of-week)
 */
export const scheduleQuotaCheck = () => {
  console.log('[Cron Job] Scheduling daily quota check: 09:00 UTC daily');

  cron.schedule('0 9 * * *', async () => {
    try {
      await checkAllUsersQuota();
    } catch (error) {
      // Error will be logged by centralized error handler if needed
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });
};

/**
 * Manual trigger for testing
 */
export const triggerQuotaCheck = async () => {
  return await checkAllUsersQuota();
};
