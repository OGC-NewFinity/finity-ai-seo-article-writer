/**
 * Media Controller
 * Handles HTTP request/response logic for media endpoints
 */

import { incrementUsage } from '../../services/usage.service.js';
import * as geminiProvider from '../providers/gemini/index.js';

/**
 * Generate an image
 */
export const generateImage = async (req, res) => {
  try {
    const { prompt, style, aspectRatio } = req.body;
    
    // At this point, quota has been checked
    // req.quota = { feature: 'images', currentUsage, limit, remaining, plan }
    
    // Generate image - userId is now first parameter, tracking/logging handled in service
    const imageData = await geminiProvider.generateImage(req.user.id, prompt, aspectRatio, style);
    
    if (!imageData) {
      throw new Error('Image generation failed - no image data returned');
    }
    
    // After successful generation, increment usage
    await incrementUsage(req.user.id, 'imagesGenerated', 1);
    
    res.json({
      success: true,
      data: {
        image: imageData,
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
    const { prompt, style, aspectRatio, duration, resolution, startFrameBase64 } = req.body;
    
    // Generate video - userId is now first parameter, tracking/logging handled in service
    const videoUrl = await geminiProvider.generateVideo(
      req.user.id,
      prompt,
      style || 'Cinematic',
      resolution || '720p',
      aspectRatio || '16:9',
      duration || '9s',
      startFrameBase64 || null
    );
    
    // After successful generation, increment usage
    await incrementUsage(req.user.id, 'videosGenerated', 1);
    
    res.json({
      success: true,
      data: {
        videoUrl,
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
