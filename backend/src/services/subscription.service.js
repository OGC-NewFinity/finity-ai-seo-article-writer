/**
 * Subscription Service
 * Handles subscription management, plan checking, and upgrades/downgrades
 */

import prisma from '../config/database.js';
import { PLAN_FEATURES } from '../utils/featureFlags.js';

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
  const subscription = await getUserSubscription(userId);
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      plan,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      ...(stripeSubscriptionId && { stripeSubscriptionId }),
      ...(stripeCustomerId && { stripeCustomerId }),
      ...(paypalSubscriptionId && { paypalSubscriptionId }),
      ...(paypalPayerId && { paypalPayerId }),
      ...(paypalPlanId && { paypalPlanId })
    }
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
 */
export const getSubscriptionStatus = async (userId) => {
  const subscription = await getUserSubscription(userId);
  const limits = PLAN_FEATURES[subscription.plan] || PLAN_FEATURES.FREE;

  return {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    paypalSubscriptionId: subscription.paypalSubscriptionId,
    paypalPayerId: subscription.paypalPayerId,
    paymentProvider: subscription.paypalSubscriptionId ? 'paypal' : (subscription.stripeSubscriptionId ? 'stripe' : null),
    limits,
    isActive: subscription.status === 'ACTIVE' && new Date() < subscription.currentPeriodEnd
  };
};
