/**
 * Notification Service
 * Handles quota warnings and notifications (both email and frontend)
 */

import prisma from '../config/database.js';
import { 
  sendQuotaWarningEmail, 
  sendQuotaExceededEmail, 
  sendQuotaResetEmail 
} from './email.service.js';

/**
 * Notification thresholds
 */
const NOTIFICATION_THRESHOLDS = {
  WARNING: 0.8, // 80%
  EXCEEDED: 1.0  // 100%
};

/**
 * In-memory tracking for notifications sent (fallback if Notification table doesn't exist)
 * Key format: userId:feature:threshold:month
 */
const notificationSentCache = new Map();

/**
 * Check if notification was already sent for this usage level
 * Prevents duplicate notifications
 */
const hasNotificationBeenSent = async (userId, feature, threshold) => {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const cacheKey = `${userId}:${feature}:${threshold}:${monthKey}`;
  
  // Check in-memory cache first
  if (notificationSentCache.has(cacheKey)) {
    return true;
  }

  try {
    // Try to check database if Notification table exists
    const notification = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'QUOTA',
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      }
    });

    if (notification) {
      const notificationFeature = notification.metadata?.feature;
      const notificationThreshold = notification.metadata?.threshold || 0;
      
      // If same feature and threshold matches or higher, notification already sent
      if (notificationFeature === feature && notificationThreshold >= threshold) {
        notificationSentCache.set(cacheKey, true);
        return true;
      }
    }

    return false;
  } catch (error) {
    // If Notification table doesn't exist, use in-memory cache only
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      return notificationSentCache.has(cacheKey);
    }
    throw error;
  }
};

/**
 * Record notification in database
 */
const recordNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
        read: false
      }
    });

    // Also cache in memory for quick lookups
    if (type === 'QUOTA' && metadata.feature && metadata.threshold) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const cacheKey = `${userId}:${metadata.feature}:${metadata.threshold}:${monthKey}`;
      notificationSentCache.set(cacheKey, true);
    }

    return notification;
  } catch (error) {
    // If notification table doesn't exist, use in-memory cache
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const cacheKey = `${userId}:${metadata.feature}:${metadata.threshold}:${monthKey}`;
      notificationSentCache.set(cacheKey, true);
      console.warn('[Notification Service] Notification table not found, using in-memory cache');
      return null;
    }
    throw error;
  }
};

/**
 * Check quota and send notifications if needed
 * @param {string} userId - User ID
 * @param {string} feature - Feature name (e.g., 'articles', 'images', 'tokens')
 * @param {number} currentUsage - Current usage count
 * @param {number} limit - Limit for the feature (-1 for unlimited)
 * @returns {Object} Notification result
 */
export const checkQuotaAndNotify = async (userId, feature, currentUsage, limit) => {
  if (limit === -1) {
    return { notified: false, reason: 'unlimited' };
  }

  if (currentUsage === 0 || limit === 0) {
    return { notified: false, reason: 'no_usage_or_limit' };
  }

  const percentage = currentUsage / limit;
  const isExceeded = currentUsage >= limit;
  const isWarning = percentage >= NOTIFICATION_THRESHOLDS.WARNING && !isExceeded;

  try {
    // Get user info for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });

    if (!user || !user.email) {
      return { notified: false, reason: 'user_not_found' };
    }

    // Handle exceeded quota (100%)
    if (isExceeded) {
      const alreadySent = await hasNotificationBeenSent(userId, feature, NOTIFICATION_THRESHOLDS.EXCEEDED);
      
      if (!alreadySent) {
        // Send exceeded email
        await sendQuotaExceededEmail(user.email, user.name, {
          feature,
          currentUsage,
          limit,
          percentage: 100
        });

        // Record notification
        await recordNotification(
          userId,
          'QUOTA',
          `Quota Exceeded: ${feature}`,
          `You've reached your ${feature} quota limit (${currentUsage}/${limit}). Please upgrade or wait for reset.`,
          {
            feature,
            threshold: NOTIFICATION_THRESHOLDS.EXCEEDED,
            currentUsage,
            limit,
            percentage: 100
          }
        );

        return { 
          notified: true, 
          type: 'exceeded',
          threshold: NOTIFICATION_THRESHOLDS.EXCEEDED,
          emailSent: true
        };
      }
    }
    // Handle warning threshold (80%)
    else if (isWarning) {
      const alreadySent = await hasNotificationBeenSent(userId, feature, NOTIFICATION_THRESHOLDS.WARNING);
      
      if (!alreadySent) {
        // Send warning email
        await sendQuotaWarningEmail(user.email, user.name, {
          feature,
          currentUsage,
          limit,
          percentage: Math.round(percentage * 100)
        });

        // Record notification
        await recordNotification(
          userId,
          'QUOTA',
          `Quota Warning: ${feature}`,
          `You've used ${Math.round(percentage * 100)}% of your ${feature} quota (${currentUsage}/${limit}).`,
          {
            feature,
            threshold: NOTIFICATION_THRESHOLDS.WARNING,
            currentUsage,
            limit,
            percentage: Math.round(percentage * 100)
          }
        );

        return { 
          notified: true, 
          type: 'warning',
          threshold: NOTIFICATION_THRESHOLDS.WARNING,
          emailSent: true,
          percentage: Math.round(percentage * 100)
        };
      }
    }

    return { notified: false, reason: 'below_threshold_or_already_sent' };
  } catch (error) {
    console.error('[Notification Service] Error checking quota and notifying:', error);
    return { notified: false, error: error.message };
  }
};

/**
 * Get unread notifications for a user
 */
export const getUnreadNotifications = async (userId, limit = 10) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return notifications;
  } catch (error) {
    // If notification table doesn't exist, return empty array
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId // Ensure user owns the notification
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      return { success: false, error: 'Notification table does not exist' };
    }
    throw error;
  }
};

/**
 * Send quota reset notification
 */
export const sendQuotaResetNotification = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });

    if (!user || !user.email || !user.subscription) {
      return { success: false, error: 'User or subscription not found' };
    }

    // Send reset email
    await sendQuotaResetEmail(user.email, user.name, user.subscription.plan);

    // Record notification
    await recordNotification(
      userId,
      'QUOTA_RESET',
      'Quota Reset',
      `Your monthly quota has been reset for your ${user.subscription.plan} plan.`,
      {
        plan: user.subscription.plan,
        resetDate: new Date()
      }
    );

    return { success: true, emailSent: true };
  } catch (error) {
    console.error('[Notification Service] Error sending quota reset notification:', error);
    return { success: false, error: error.message };
  }
};
