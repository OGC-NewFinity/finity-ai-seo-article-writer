/**
 * Feedback Service
 * Frontend service for submitting and retrieving feedback on AI-generated content
 * 
 * @module services/feedbackService
 */

import api from './api.js';

/**
 * Submit feedback for generated content
 * 
 * @param {Object} feedbackData - Feedback data
 * @param {string} feedbackData.contentType - Content type (ARTICLE, IMAGE, VIDEO, etc.)
 * @param {string} feedbackData.provider - AI provider (GEMINI, OPENAI, ANTHROPIC, LLAMA)
 * @param {string} feedbackData.model - Specific model used (optional)
 * @param {number} feedbackData.rating - Rating (1-5 stars or -1/1 for thumbs)
 * @param {string} feedbackData.comment - Optional comment
 * @param {string} feedbackData.contentId - Optional content ID reference
 * @param {Object} feedbackData.metadata - Optional metadata
 * @returns {Promise<Object>} Created feedback record
 * 
 * @example
 * await submitFeedback({
 *   contentType: 'ARTICLE',
 *   provider: 'GEMINI',
 *   model: 'gemini-3-pro-preview',
 *   rating: 5,
 *   comment: 'Great content!',
 *   contentId: 'article-uuid'
 * });
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/api/feedback', feedbackData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to submit feedback');
  }
};

/**
 * Get feedback statistics
 * 
 * @param {Object} options - Query options
 * @param {string} options.contentType - Filter by content type (optional)
 * @param {number} options.days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Aggregated feedback statistics
 * 
 * @example
 * const stats = await getFeedbackStats({ contentType: 'ARTICLE', days: 30 });
 */
export const getFeedbackStats = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.contentType) params.append('contentType', options.contentType);
    if (options.days) params.append('days', options.days.toString());

    const response = await api.get(`/api/feedback/stats?${params.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to get feedback statistics');
  }
};

/**
 * Get recommended provider based on feedback history
 * 
 * @param {string} contentType - Content type to generate
 * @param {number} minRating - Minimum rating threshold (default: 3.0)
 * @returns {Promise<Object>} Recommended provider and model
 * 
 * @example
 * const recommendation = await getRecommendedProvider('ARTICLE', 3.0);
 * // Returns: { provider: 'GEMINI', model: 'gemini-3-pro-preview', reason: 'feedback_based', ... }
 */
export const getRecommendedProvider = async (contentType, minRating = 3.0) => {
  try {
    const params = new URLSearchParams();
    params.append('contentType', contentType);
    params.append('minRating', minRating.toString());

    const response = await api.get(`/api/feedback/recommend?${params.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error getting recommended provider:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to get recommended provider');
  }
};

/**
 * Get user's feedback history
 * 
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of records (default: 20)
 * @param {number} options.offset - Pagination offset (default: 0)
 * @returns {Promise<Object>} Feedback history with pagination
 * 
 * @example
 * const history = await getUserFeedback({ limit: 20, offset: 0 });
 */
export const getUserFeedback = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const response = await api.get(`/api/feedback/history?${params.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error getting user feedback:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to get feedback history');
  }
};
