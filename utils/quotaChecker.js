/**
 * Quota Checking Utilities
 * Helper functions to check quota status and determine if actions are allowed
 */

/**
 * Check if usage is at or above warning threshold (90%)
 * @param {number} used - Current usage
 * @param {number} limit - Usage limit (-1 for unlimited)
 * @returns {boolean} True if usage >= 90%
 */
export const isQuotaWarning = (used, limit) => {
  if (limit === -1) return false; // Unlimited
  if (limit === 0) return true; // No quota
  const percentage = (used / limit) * 100;
  return percentage >= 90;
};

/**
 * Check if quota is exceeded
 * @param {number} used - Current usage
 * @param {number} limit - Usage limit (-1 for unlimited)
 * @returns {boolean} True if quota exceeded
 */
export const isQuotaExceeded = (used, limit) => {
  if (limit === -1) return false; // Unlimited
  return used >= limit;
};

/**
 * Get usage percentage
 * @param {number} used - Current usage
 * @param {number} limit - Usage limit (-1 for unlimited)
 * @returns {number} Usage percentage (0-100)
 */
export const getUsagePercentage = (used, limit) => {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
};

/**
 * Check if a feature can be used based on usage stats
 * @param {Object} usageStats - Usage stats object from API
 * @param {string} feature - Feature name ('articles', 'images', 'videos', 'research', 'wordpress')
 * @returns {Object} { allowed, warning, exceeded, percentage, remaining }
 */
export const checkFeatureQuota = (usageStats, feature) => {
  if (!usageStats || !usageStats[feature]) {
    return {
      allowed: false,
      warning: false,
      exceeded: true,
      percentage: 100,
      remaining: 0
    };
  }

  const featureUsage = usageStats[feature];
  const used = featureUsage.used || 0;
  const limit = featureUsage.limit || 0;
  const remaining = featureUsage.remaining || 0;

  const percentage = getUsagePercentage(used, limit);
  const warning = isQuotaWarning(used, limit);
  const exceeded = isQuotaExceeded(used, limit);
  const allowed = !exceeded;

  return {
    allowed,
    warning,
    exceeded,
    percentage,
    remaining,
    used,
    limit
  };
};

/**
 * Get warning message for a feature
 * @param {Object} quotaCheck - Result from checkFeatureQuota
 * @param {string} featureName - Display name for the feature
 * @returns {string|null} Warning message or null
 */
export const getQuotaWarningMessage = (quotaCheck, featureName) => {
  if (!quotaCheck.warning && !quotaCheck.exceeded) {
    return null;
  }

  if (quotaCheck.exceeded) {
    return `You have reached your ${featureName} quota limit. Please upgrade your plan to continue.`;
  }

  if (quotaCheck.warning) {
    return `You're using ${quotaCheck.percentage}% of your ${featureName} quota (${quotaCheck.remaining} remaining). Consider upgrading your plan.`;
  }

  return null;
};
