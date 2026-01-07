/**
 * Media Controller
 * Handles HTTP request/response logic for media endpoints
 */

import { incrementUsage } from '../../services/usage.service.js';

/**
 * Generate an image
 */
export const generateImage = async (req, res) => {
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
};

/**
 * Generate a video
 */
export const generateVideo = async (req, res) => {
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
};
