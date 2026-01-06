/**
 * Article Routes
 * API endpoints for article generation and management
 * 
 * Example usage of quota middleware
 */

import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkQuota } from '../middleware/quota.middleware.js';
import { incrementUsage } from '../services/usage.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/articles
 * Create a new article
 * Protected by quota middleware - checks article quota before allowing creation
 */
router.post('/', checkQuota('articles'), async (req, res) => {
  try {
    // At this point, quota has been checked and req.quota contains quota info
    // req.quota = { feature, currentUsage, limit, remaining, plan }
    
    // TODO: Implement article generation logic here
    // const article = await generateArticle(req.body, req.user.id);
    
    // After successful generation, increment usage
    await incrementUsage(req.user.id, 'articlesGenerated', 1);
    
    res.json({
      success: true,
      data: {
        // article data
        message: 'Article created successfully',
        quota: {
          remaining: req.quota.remaining - 1,
          limit: req.quota.limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /api/articles/:id/publish
 * Publish article to WordPress
 * Protected by quota middleware - checks WordPress publishing quota
 */
router.post('/:id/publish', checkQuota('wordpress'), async (req, res) => {
  try {
    // TODO: Implement WordPress publishing logic
    
    // After successful publishing, increment usage
    await incrementUsage(req.user.id, 'articlesPublished', 1);
    
    res.json({
      success: true,
      data: {
        message: 'Article published successfully',
        quota: {
          remaining: req.quota.remaining - 1,
          limit: req.quota.limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

export default router;
