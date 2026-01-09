/**
 * Token Usage Routes
 * REST API endpoints for receiving token usage updates from WordPress and other sources
 */

import express from 'express';
import { authenticateApiKey } from '../../../middleware/apiKey.middleware.js';
import * as tokenUsageController from '../controllers/tokenUsage.controller.js';

const router = express.Router();

/**
 * POST /api/token-usage/sync
 * Receive token usage updates from WordPress plugin or external sources
 * Requires API key authentication
 */
router.post('/sync', authenticateApiKey, tokenUsageController.syncTokenUsage);

/**
 * GET /api/token-usage/stats
 * Get token usage statistics for authenticated user
 * Requires API key authentication
 */
router.get('/stats', authenticateApiKey, tokenUsageController.getTokenUsageStats);

export default router;
