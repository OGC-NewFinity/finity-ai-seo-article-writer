/**
 * Token Tracking Service
 * Centralized helper for tracking token usage across all generation endpoints
 */

import { recordTokenUsage } from '../features/tokenUsage/services/tokenUsage.service.js';

/**
 * Track token usage for a generation operation
 * 
 * @param {string} userId - User ID
 * @param {number} tokensUsed - Number of tokens used
 * @param {string} action - Action type (e.g., 'article_generation', 'image_generation', 'video_generation', 'research', 'seo_analysis', 'keyword_planning', 'headline_drafting')
 * @param {Object} metadata - Additional metadata
 * @param {string} metadata.provider - AI provider (e.g., 'gemini', 'openai', 'anthropic', 'groq')
 * @param {string} metadata.model - AI model used (e.g., 'gemini-3-pro-preview', 'gpt-4o')
 * @param {string} metadata.service - Service name (for clarity)
 * @param {Object} metadata.requestDetails - Request details (optional)
 * @returns {Promise<Object>} Created token usage record
 */
export const trackTokenUsage = async (userId, tokensUsed, action, metadata = {}) => {
  try {
    if (!userId || !tokensUsed || !action) {
      return null;
    }
    
    // Validate tokensUsed is a positive number
    const tokens = parseInt(tokensUsed, 10);
    if (isNaN(tokens) || tokens < 0) {
      return null;
    }
    
    // Prepare usage data
    const usageData = {
      action,
      tokensUsed: tokens,
      provider: metadata.provider || null,
      source: metadata.source || 'platform',
      metadata: {
        model: metadata.model || null,
        service: metadata.service || action,
        ...metadata.requestDetails,
        timestamp: new Date().toISOString()
      }
    };
    
    // Record token usage
    const tokenUsage = await recordTokenUsage(userId, usageData);
    
    return tokenUsage;
  } catch (error) {
    // Don't throw - token tracking should not break the main operation
    // Silently return null on error
    return null;
  }
};

/**
 * Estimate tokens from text content
 * Rough estimation: ~4 characters per token for English text
 * 
 * @param {string} text - Text content
 * @returns {number} Estimated token count
 */
export const estimateTokens = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
};

/**
 * Estimate tokens for image generation
 * Based on prompt complexity and image size
 * 
 * @param {string} prompt - Image generation prompt
 * @param {string} aspectRatio - Image aspect ratio (optional)
 * @returns {number} Estimated token count
 */
export const estimateImageTokens = (prompt, aspectRatio = '16:9') => {
  const baseTokens = 50; // Base cost for image generation
  const promptTokens = estimateTokens(prompt);
  return baseTokens + promptTokens;
};

/**
 * Estimate tokens for video generation
 * Based on prompt complexity and video duration
 * 
 * @param {string} prompt - Video generation prompt
 * @param {string} duration - Video duration (e.g., '9s', '30s')
 * @returns {number} Estimated token count
 */
export const estimateVideoTokens = (prompt, duration = '9s') => {
  const baseTokens = 200; // Base cost for video generation
  const promptTokens = estimateTokens(prompt);
  const durationSeconds = parseInt(duration.replace('s', ''), 10) || 9;
  const durationMultiplier = Math.ceil(durationSeconds / 9); // Scale with duration
  return baseTokens + (promptTokens * 2) + (durationMultiplier * 50);
};
