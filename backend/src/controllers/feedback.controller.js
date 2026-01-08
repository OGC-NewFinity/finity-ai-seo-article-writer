/**
 * Feedback Controller
 * Handles HTTP request/response logic for feedback endpoints
 */

import * as feedbackService from '../services/feedback.service.js';

/**
 * Submit feedback for generated content
 * POST /api/feedback
 */
export const submitFeedback = async (req, res) => {
  try {
    const { contentType, provider, model, rating, comment, contentId, metadata } = req.body;
    const userId = req.user.id;

    if (!contentType || !provider || !rating) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: contentType, provider, and rating are required'
        }
      });
    }

    const feedback = await feedbackService.submitFeedback(userId, {
      contentType,
      provider,
      model,
      rating,
      comment,
      contentId,
      metadata
    });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
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
 * Get feedback statistics
 * GET /api/feedback/stats
 */
export const getFeedbackStats = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const contentType = req.query.contentType || null;
    const days = parseInt(req.query.days) || 30;

    const stats = await feedbackService.getFeedbackStats(userId, contentType, days);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
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
 * Get recommended provider based on feedback
 * GET /api/feedback/recommend
 */
export const getRecommendedProvider = async (req, res) => {
  try {
    const { contentType } = req.query;
    const userId = req.user?.id || null;
    const minRatingThreshold = parseFloat(req.query.minRating) || 3.0;

    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'contentType query parameter is required'
        }
      });
    }

    const recommendation = await feedbackService.getRecommendedProvider(
      contentType,
      userId,
      minRatingThreshold
    );

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error getting recommended provider:', error);
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
 * Get user's feedback history
 * GET /api/feedback/history
 */
export const getUserFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await feedbackService.getUserFeedback(userId, limit, offset);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting user feedback:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};
