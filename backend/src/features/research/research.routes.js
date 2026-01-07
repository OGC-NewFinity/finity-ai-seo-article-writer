/**
 * Research Routes
 * API endpoints for research queries
 * 
 * Example usage of quota middleware
 */

import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { checkQuota } from '../../middleware/quota.middleware.js';
import * as researchController from './research.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/research/query
 * Execute a research query
 * Protected by quota middleware - checks research quota before allowing query
 */
router.post('/query', checkQuota('research'), researchController.executeResearchQuery);

export default router;
