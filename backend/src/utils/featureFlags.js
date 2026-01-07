/**
 * Feature Flags Configuration
 * Defines feature availability and limits for each subscription plan
 */

export const PLAN_FEATURES = {
  FREE: {
    articles: { limit: 10, enabled: true, quality: 'standard' },
    images: { limit: 25, enabled: true, quality: 'standard' },
    videos: { limit: 0, enabled: false, quality: 'none' },
    research: { limit: 20, enabled: true },
    wordpress: { enabled: false },
    api: { enabled: false },
    advancedSEO: { enabled: false },
    prioritySupport: { enabled: false },
    // New quota limits
    tokenLimit: { limit: 100000, enabled: true }, // Monthly token limit
    mediaDurationLimit: { limit: 3600, enabled: true }, // Monthly media duration in seconds
    dailyApiCalls: { limit: 100, enabled: true } // Daily API call limit
  },
  PRO: {
    articles: { limit: 100, enabled: true, quality: 'high' },
    images: { limit: 500, enabled: true, quality: 'high' },
    videos: { limit: 20, enabled: true, quality: 'high' },
    research: { limit: -1, enabled: true }, // -1 = unlimited
    wordpress: { limit: 50, enabled: true },
    api: { enabled: true },
    advancedSEO: { enabled: true },
    prioritySupport: { enabled: true },
    // New quota limits
    tokenLimit: { limit: 10000000, enabled: true }, // Monthly token limit (10M)
    mediaDurationLimit: { limit: 72000, enabled: true }, // Monthly media duration in seconds (20 hours)
    dailyApiCalls: { limit: 1000, enabled: true } // Daily API call limit
  },
  ENTERPRISE: {
    articles: { limit: -1, enabled: true, quality: 'highest' },
    images: { limit: -1, enabled: true, quality: 'highest' },
    videos: { limit: 100, enabled: true, quality: 'highest' },
    research: { limit: -1, enabled: true },
    wordpress: { limit: -1, enabled: true },
    api: { enabled: true },
    advancedSEO: { enabled: true },
    prioritySupport: { enabled: true },
    customIntegrations: { enabled: true },
    // New quota limits
    tokenLimit: { limit: -1, enabled: true }, // Unlimited tokens
    mediaDurationLimit: { limit: -1, enabled: true }, // Unlimited media duration
    dailyApiCalls: { limit: -1, enabled: true } // Unlimited daily API calls
  }
};

/**
 * Check if a feature is enabled for a plan
 */
export const isFeatureEnabled = (plan, feature) => {
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.FREE;
  return features[feature]?.enabled ?? false;
};

/**
 * Get feature limit for a plan
 */
export const getFeatureLimit = (plan, feature) => {
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.FREE;
  return features[feature]?.limit ?? 0;
};

/**
 * Check if usage is within limit
 */
export const isWithinLimit = (plan, feature, currentUsage) => {
  const limit = getFeatureLimit(plan, feature);
  if (limit === -1) return true; // Unlimited
  return currentUsage < limit;
};

/**
 * Get remaining usage
 */
export const getRemainingUsage = (plan, feature, currentUsage) => {
  const limit = getFeatureLimit(plan, feature);
  if (limit === -1) return -1; // Unlimited
  return Math.max(0, limit - currentUsage);
};

/**
 * Get usage percentage
 */
export const getUsagePercentage = (plan, feature, currentUsage) => {
  const limit = getFeatureLimit(plan, feature);
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.min(100, Math.round((currentUsage / limit) * 100));
};

/**
 * Check if usage warning should be shown (80% threshold)
 */
export const shouldShowWarning = (plan, feature, currentUsage) => {
  return getUsagePercentage(plan, feature, currentUsage) >= 80;
};

/**
 * Get feature quality for plan
 */
export const getFeatureQuality = (plan, feature) => {
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.FREE;
  return features[feature]?.quality || 'standard';
};
