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
    console.log('[Cron Job] Starting scheduled monthly usage reset...');
    
    try {
      const result = await resetMonthlyUsage();
      console.log('[Cron Job] Monthly usage reset completed:', result);
    } catch (error) {
      console.error('[Cron Job] Error during monthly usage reset:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Also run a test reset on startup if enabled (for development/testing)
  if (process.env.RUN_USAGE_RESET_ON_STARTUP === 'true') {
    console.log('[Cron Job] Running usage reset on startup (RUN_USAGE_RESET_ON_STARTUP=true)');
    resetMonthlyUsage().catch(error => {
      console.error('[Cron Job] Error running usage reset on startup:', error);
    });
  }
};

/**
 * Manual trigger for testing
 */
export const triggerUsageReset = async () => {
  console.log('[Cron Job] Manual usage reset triggered');
  return await resetMonthlyUsage();
};
