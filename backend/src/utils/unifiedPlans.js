/**
 * Unified Plan Structure
 * Defines subscription tiers with standardized metadata for Stripe and PayPal
 */

import { PLAN_FEATURES } from './featureFlags.js';

/**
 * Unified plan configuration
 * Contains tier information, pricing, and quotas for both Stripe and PayPal
 */
export const UNIFIED_PLANS = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    price: {
      amount: 0,
      currency: 'USD',
      interval: 'month'
    },
    quotas: PLAN_FEATURES.FREE,
    features: {
      enabled: ['articles', 'images', 'research'],
      quality: 'standard'
    },
    metadata: {
      tier: 'FREE',
      tier_name: 'Free Plan',
      quota_articles: PLAN_FEATURES.FREE.articles.limit,
      quota_images: PLAN_FEATURES.FREE.images.limit,
      quota_videos: PLAN_FEATURES.FREE.videos.limit,
      quota_research: PLAN_FEATURES.FREE.research.limit,
      quota_wordpress: 0,
      pricing_amount: '0',
      pricing_currency: 'USD',
      pricing_interval: 'month'
    }
  },
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    price: {
      amount: 29,
      currency: 'USD',
      interval: 'month'
    },
    quotas: PLAN_FEATURES.PRO,
    features: {
      enabled: ['articles', 'images', 'videos', 'research', 'wordpress', 'api', 'advancedSEO', 'prioritySupport'],
      quality: 'high'
    },
    metadata: {
      tier: 'PRO',
      tier_name: 'Pro Plan',
      quota_articles: PLAN_FEATURES.PRO.articles.limit,
      quota_images: PLAN_FEATURES.PRO.images.limit,
      quota_videos: PLAN_FEATURES.PRO.videos.limit,
      quota_research: PLAN_FEATURES.PRO.research.limit === -1 ? 'unlimited' : PLAN_FEATURES.PRO.research.limit,
      quota_wordpress: PLAN_FEATURES.PRO.wordpress.limit,
      pricing_amount: '29',
      pricing_currency: 'USD',
      pricing_interval: 'month'
    }
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    price: {
      amount: 99,
      currency: 'USD',
      interval: 'month'
    },
    quotas: PLAN_FEATURES.ENTERPRISE,
    features: {
      enabled: ['articles', 'images', 'videos', 'research', 'wordpress', 'api', 'advancedSEO', 'prioritySupport', 'customIntegrations'],
      quality: 'highest'
    },
    metadata: {
      tier: 'ENTERPRISE',
      tier_name: 'Enterprise Plan',
      quota_articles: 'unlimited',
      quota_images: 'unlimited',
      quota_videos: PLAN_FEATURES.ENTERPRISE.videos.limit,
      quota_research: 'unlimited',
      quota_wordpress: 'unlimited',
      pricing_amount: '99',
      pricing_currency: 'USD',
      pricing_interval: 'month'
    }
  }
};

/**
 * Get plan configuration by tier name
 */
export const getPlanByTier = (tier) => {
  return UNIFIED_PLANS[tier?.toUpperCase()] || UNIFIED_PLANS.FREE;
};

/**
 * Get plan metadata for payment provider
 * Returns standardized metadata object for Stripe or PayPal
 */
export const getPlanMetadata = (tier, userId = null) => {
  const plan = getPlanByTier(tier);
  const metadata = { ...plan.metadata };
  
  if (userId) {
    metadata.userId = userId;
  }
  
  // Add plan field for backward compatibility
  metadata.plan = tier;
  
  return metadata;
};

/**
 * Extract tier from metadata (works with both Stripe and PayPal)
 */
export const extractTierFromMetadata = (metadata) => {
  if (!metadata) return 'FREE';
  
  // Try tier field first (standardized)
  if (metadata.tier) {
    return metadata.tier.toUpperCase();
  }
  
  // Fallback to plan field (backward compatibility)
  if (metadata.plan) {
    return metadata.plan.toUpperCase();
  }
  
  // Fallback for Stripe checkout session metadata
  if (metadata.userId && metadata.plan) {
    return metadata.plan.toUpperCase();
  }
  
  return 'FREE';
};

/**
 * Extract tier from PayPal plan ID
 */
export const extractTierFromPayPalPlanId = (planId) => {
  const paypalPlanIdPro = process.env.PAYPAL_PLAN_ID_PRO;
  const paypalPlanIdEnterprise = process.env.PAYPAL_PLAN_ID_ENTERPRISE;
  
  if (planId === paypalPlanIdPro) return 'PRO';
  if (planId === paypalPlanIdEnterprise) return 'ENTERPRISE';
  
  return null;
};

/**
 * Extract tier from Stripe price ID
 */
export const extractTierFromStripePriceId = (priceId) => {
  const stripePriceIdPro = process.env.STRIPE_PRICE_ID_PRO;
  const stripePriceIdEnterprise = process.env.STRIPE_PRICE_ID_ENTERPRISE;
  
  if (priceId === stripePriceIdPro) return 'PRO';
  if (priceId === stripePriceIdEnterprise) return 'ENTERPRISE';
  
  return null;
};

/**
 * Validate tier name
 */
export const isValidTier = (tier) => {
  return ['FREE', 'PRO', 'ENTERPRISE'].includes(tier?.toUpperCase());
};

/**
 * Get available upgrade tiers for current tier
 */
export const getAvailableUpgrades = (currentTier) => {
  const tier = currentTier?.toUpperCase() || 'FREE';
  
  switch (tier) {
    case 'FREE':
      return ['PRO', 'ENTERPRISE'];
    case 'PRO':
      return ['ENTERPRISE'];
    case 'ENTERPRISE':
      return [];
    default:
      return ['PRO', 'ENTERPRISE'];
  }
};

/**
 * Compare tiers (returns -1 if tier1 < tier2, 0 if equal, 1 if tier1 > tier2)
 */
export const compareTiers = (tier1, tier2) => {
  const order = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
  const t1 = order[tier1?.toUpperCase()] ?? 0;
  const t2 = order[tier2?.toUpperCase()] ?? 0;
  
  if (t1 < t2) return -1;
  if (t1 > t2) return 1;
  return 0;
};
