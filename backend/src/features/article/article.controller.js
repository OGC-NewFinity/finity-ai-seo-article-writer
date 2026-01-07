/**
 * Article Controller
 * Handles HTTP request/response logic for article endpoints
 */

import { incrementUsage } from '../../services/usage.service.js';

/**
 * Create a new article
 */
export const createArticle = async (req, res) => {
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
};

/**
 * Publish article to WordPress
 */
export const publishArticle = async (req, res) => {
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
};
