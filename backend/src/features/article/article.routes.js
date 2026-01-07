/**
 * Article Routes
 * API endpoints for article generation and management
 * 
 * Example usage of quota middleware
 */

import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { checkQuota } from '../../middleware/quota.middleware.js';
import * as articleController from './article.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/articles
 * Create a new article
 * Protected by quota middleware - checks article quota before allowing creation
 */
router.post('/', checkQuota('articles'), articleController.createArticle);

/**
 * POST /api/articles/:id/publish
 * Publish article to WordPress
 * Protected by quota middleware - checks WordPress publishing quota
 */
router.post('/:id/publish', checkQuota('wordpress'), articleController.publishArticle);

export default router;
