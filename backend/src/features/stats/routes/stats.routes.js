/**
 * Statistics Routes
 * Admin-only analytics endpoints
 */

import express from 'express';
import { authenticateAdmin } from '../../../middleware/admin.middleware.js';
import * as statsController from '../controllers/stats.controller.js';

const router = express.Router();

/**
 * GET /api/stats/usage
 * Get quota usage per user (admin only)
 */
router.get('/usage', authenticateAdmin, statsController.getUsageStats);

/**
 * GET /api/stats/plans
 * Get plan adoption rates (admin only)
 */
router.get('/plans', authenticateAdmin, statsController.getPlanStats);

/**
 * GET /api/stats/failures
 * Get failed generation attempts (admin only)
 * 
 * Query params:
 * - days: Number of days to look back (default: 30)
 * - period: 'daily' or 'weekly' (default: 'daily')
 */
router.get('/failures', authenticateAdmin, statsController.getFailureStats);

export default router;
