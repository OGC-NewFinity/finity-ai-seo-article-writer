/**
 * Media Routes
 * API endpoints for image and video generation
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
 * POST /api/media/images
 * Generate an image
 * Protected by quota middleware - checks image quota before allowing generation
 */
router.post('/images', checkQuota('images'), async (req, res) => {
  try {
    const { prompt, style, aspectRatio } = req.body;
    
    // At this point, quota has been checked
    // req.quota = { feature: 'images', currentUsage, limit, remaining, plan }
    
    // TODO: Implement image generation logic here
    // const image = await generateImage(prompt, style, aspectRatio, req.user.id);
    
    // After successful generation, increment usage
    await incrementUsage(req.user.id, 'imagesGenerated', 1);
    
    res.json({
      success: true,
      data: {
        // image data
        message: 'Image generated successfully',
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
 * POST /api/media/videos
 * Generate a video
 * Protected by quota middleware - checks video quota before allowing generation
 */
router.post('/videos', checkQuota('videos'), async (req, res) => {
  try {
    const { prompt, style, aspectRatio, duration } = req.body;
    
    // TODO: Implement video generation logic here
    // const video = await generateVideo(prompt, style, aspectRatio, duration, req.user.id);
    
    // After successful generation, increment usage
    await incrementUsage(req.user.id, 'videosGenerated', 1);
    
    res.json({
      success: true,
      data: {
        // video data
        message: 'Video generation started',
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
