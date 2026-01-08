/**
 * Feedback Routes
 * API endpoints for user feedback on AI-generated content
 */

import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as feedbackController from '../controllers/feedback.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/feedback
 * Submit feedback for generated content
 * 
 * Body:
 * {
 *   "contentType": "ARTICLE" | "IMAGE" | "VIDEO" | etc.,
 *   "provider": "GEMINI" | "OPENAI" | "ANTHROPIC" | "LLAMA",
 *   "model": "gemini-3-pro-preview" (optional),
 *   "rating": 1-5 (stars) or -1/1 (thumbs),
 *   "comment": "Optional feedback text",
 *   "contentId": "uuid" (optional),
 *   "metadata": {} (optional)
 * }
 */
router.post('/', feedbackController.submitFeedback);

/**
 * GET /api/feedback/stats
 * Get aggregated feedback statistics
 * 
 * Query params:
 * - contentType: Filter by content type (optional)
 * - days: Number of days to look back (default: 30)
 */
router.get('/stats', feedbackController.getFeedbackStats);

/**
 * GET /api/feedback/recommend
 * Get recommended provider/model based on feedback history
 * 
 * Query params:
 * - contentType: Required - Content type to generate
 * - minRating: Minimum rating threshold (default: 3.0)
 */
router.get('/recommend', feedbackController.getRecommendedProvider);

/**
 * GET /api/feedback/history
 * Get user's feedback history
 * 
 * Query params:
 * - limit: Number of records (default: 20)
 * - offset: Pagination offset (default: 0)
 */
router.get('/history', feedbackController.getUserFeedback);

export default router;
