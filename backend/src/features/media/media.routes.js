/**
 * Media Routes
 * API endpoints for image and video generation
 * 
 * Example usage of quota middleware
 */

import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { checkQuota } from '../../middleware/quota.middleware.js';
import * as mediaController from './media.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/media/images
 * Generate an image
 * Protected by quota middleware - checks image quota before allowing generation
 */
router.post('/images', checkQuota('images'), mediaController.generateImage);

/**
 * POST /api/media/videos
 * Generate a video
 * Protected by quota middleware - checks video quota before allowing generation
 */
router.post('/videos', checkQuota('videos'), mediaController.generateVideo);

export default router;
