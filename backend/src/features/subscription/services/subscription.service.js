/**
 * Subscription Service
 * Handles subscription management, plan checking, and upgrades/downgrades
 * Uses unified plan structure for consistent tier management
 */

import prisma from '../../../config/database.js';
import { PLAN_FEATURES } from '../../../utils/featureFlags.js';
import { isValidTier, getPlanByTier } from '../../../utils/unifiedPlans.js';

/**
 * Get user subscription
 */
export const getUserSubscription = async (userId) => {
  let subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!subscription) {
    // Create free subscription for new user
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    subscription = await prisma.subscription.create({
      data: {
        userId,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd
      },
      include: { user: true }
    });
  }

  // Check if subscription expired
  if (subscription.status === 'ACTIVE' && new Date() > subscription.currentPeriodEnd) {
    subscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'EXPIRED' }
    });
  }

  return subscription;
};

/**
 * Update subscription plan
 * Uses unified plan structure to validate tier and sync status
 */
export const updateSubscriptionPlan = async (
  userId, 
  plan, 
  stripeSubscriptionId = null, 
  stripeCustomerId = null,
  paypalSubscriptionId = null,
  paypalPayerId = null,
  paypalPlanId = null
) => {
  // Validate tier using unified plan structure
  const tier = plan?.toUpperCase() || 'FREE';
  if (!isValidTier(tier)) {
    throw new Error(`Invalid plan tier: ${tier}. Must be FREE, PRO, or ENTERPRISE.`);
  }

  const subscription = await getUserSubscription(userId);
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Prepare update data with unified plan structure
  const updateData = {
    plan: tier, // Use validated tier
    status: 'ACTIVE',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false // Reset cancellation flag on upgrade
  };

  // Only update payment provider IDs if provided
  // This allows switching between providers or updating provider info
  if (stripeSubscriptionId) {
    updateData.stripeSubscriptionId = stripeSubscriptionId;
  }
  if (stripeCustomerId) {
    updateData.stripeCustomerId = stripeCustomerId;
  }
  if (paypalSubscriptionId) {
    updateData.paypalSubscriptionId = paypalSubscriptionId;
  }
  if (paypalPayerId) {
    updateData.paypalPayerId = paypalPayerId;
  }
  if (paypalPlanId) {
    updateData.paypalPlanId = paypalPlanId;
  }

  return await prisma.subscription.update({
    where: { id: subscription.id },
    data: updateData
  });
};

/**
 * Cancel subscription (at period end)
 */
export const cancelSubscription = async (userId) => {
  const subscription = await getUserSubscription(userId);

  return await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true
    }
  });
};

/**
 * Reactivate subscription
 */
export const reactivateSubscription = async (userId) => {
  const subscription = await getUserSubscription(userId);

  return await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: false,
      status: 'ACTIVE'
    }
  });
};

/**
 * Check if user has access to feature
 */
export const hasFeatureAccess = async (userId, feature) => {
  const subscription = await getUserSubscription(userId);
  const plan = subscription.plan;
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.FREE;
  
  return features[feature]?.enabled ?? false;
};

/**
 * Get subscription limits
 */
export const getSubscriptionLimits = async (userId) => {
  const subscription = await getUserSubscription(userId);
  const plan = subscription.plan;
  return PLAN_FEATURES[plan] || PLAN_FEATURES.FREE;
};

/**
 * Get subscription status with details
 * Uses unified plan structure to return consistent tier information
 */
export const getSubscriptionStatus = async (userId) => {
  const subscription = await getUserSubscription(userId);
  
  // Validate and normalize tier using unified plan structure
  const tier = subscription.plan?.toUpperCase() || 'FREE';
  const validatedTier = isValidTier(tier) ? tier : 'FREE';
  
  // Get plan limits using unified plan structure
  const planConfig = getPlanByTier(validatedTier);
  const limits = planConfig?.quotas || PLAN_FEATURES.FREE;

  // Determine payment provider (both can exist, prioritize active one)
  let paymentProvider = null;
  if (subscription.paypalSubscriptionId) {
    paymentProvider = 'paypal';
  } else if (subscription.stripeSubscriptionId) {
    paymentProvider = 'stripe';
  }

  return {
    plan: validatedTier, // Return validated tier
    tier: validatedTier, // Also include tier field for consistency
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    paypalSubscriptionId: subscription.paypalSubscriptionId,
    paypalPayerId: subscription.paypalPayerId,
    paypalPlanId: subscription.paypalPlanId,
    paymentProvider, // Unified payment provider field
    limits,
    isActive: subscription.status === 'ACTIVE' && new Date() < subscription.currentPeriodEnd,
    // Include unified plan metadata
    metadata: planConfig?.metadata || null
  };
};
