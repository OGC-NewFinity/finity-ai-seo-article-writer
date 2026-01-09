/**
 * Usage Reset Cron Job
 * Automatically resets user quotas monthly
 */

import cron from 'node-cron';
import { resetMonthlyUsage } from '../services/usage.service.js';

/**
 * Schedule monthly usage reset
 * Runs at 00:00 UTC on the 1st day of each month
 * Cron format: '0 0 1 * *' (minute hour day month day-of-week)
 */
export const scheduleUsageReset = () => {
  console.log('[Cron Job] Scheduling monthly usage reset: 00:00 UTC on 1st of each month');

  cron.schedule('0 0 1 * *', async () => {
    try {
      await resetMonthlyUsage();
    } catch (error) {
      // Error will be logged by centralized error handler if needed
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Also run a test reset on startup if enabled (for development/testing)
  if (process.env.RUN_USAGE_RESET_ON_STARTUP === 'true') {
    resetMonthlyUsage().catch(() => {
      // Error will be logged by centralized error handler if needed
    });
  }
};

/**
 * Manual trigger for testing
 */
export const triggerUsageReset = async () => {
  return await resetMonthlyUsage();
};
