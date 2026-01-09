/**
 * Feedback Service
 * Handles feedback storage, aggregation, and model routing logic
 */

import prisma from '../../../config/database.js';

/**
 * Submit feedback for generated content
 * 
 * @param {string} userId - User ID
 * @param {Object} feedbackData - Feedback data
 * @param {string} feedbackData.contentType - Type of content (ARTICLE, IMAGE, etc.)
 * @param {string} feedbackData.provider - AI provider (GEMINI, OPENAI, etc.)
 * @param {string} feedbackData.model - Specific model used
 * @param {number} feedbackData.rating - Rating (1-5 stars or -1/1 for thumbs)
 * @param {string} feedbackData.comment - Optional comment
 * @param {string} feedbackData.contentId - Optional content ID reference
 * @param {Object} feedbackData.metadata - Optional metadata
 * @returns {Promise<Object>} Created feedback record
 */
export const submitFeedback = async (userId, feedbackData) => {
  const {
    contentType,
    provider,
    model,
    rating,
    comment,
    contentId,
    metadata
  } = feedbackData;

  // Validate rating
  if (rating < -1 || rating > 5 || rating === 0) {
    throw new Error('Rating must be between 1-5 (stars) or -1/1 (thumbs)');
  }

  // Validate content type
  const validContentTypes = [
    'ARTICLE', 'ARTICLE_SECTION', 'ARTICLE_METADATA', 'ARTICLE_CTA',
    'IMAGE', 'VIDEO', 'AUDIO', 'RESEARCH', 'SEO_ANALYSIS'
  ];
  if (!validContentTypes.includes(contentType)) {
    throw new Error(`Invalid content type. Must be one of: ${validContentTypes.join(', ')}`);
  }

  // Validate provider
  const validProviders = ['GEMINI', 'OPENAI', 'ANTHROPIC', 'LLAMA'];
  if (!validProviders.includes(provider)) {
    throw new Error(`Invalid provider. Must be one of: ${validProviders.join(', ')}`);
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId,
      contentType,
      provider,
      model: model || null,
      rating,
      comment: comment || null,
      contentId: contentId || null,
      metadata: metadata || null
    }
  });

  return feedback;
};

/**
 * Get feedback statistics aggregated by provider
 * 
 * @param {string} userId - Optional user ID to filter by user
 * @param {string} contentType - Optional content type to filter
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Aggregated feedback statistics
 */
export const getFeedbackStats = async (userId = null, contentType = null, days = 30) => {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const where = {
    createdAt: {
      gte: dateThreshold
    }
  };

  if (userId) {
    where.userId = userId;
  }

  if (contentType) {
    where.contentType = contentType;
  }

  // Get all feedback in the time period
  const allFeedback = await prisma.feedback.findMany({
    where,
    select: {
      provider: true,
      model: true,
      rating: true,
      contentType: true
    }
  });

  // Aggregate by provider
  const providerStats = {};
  const modelStats = {};

  allFeedback.forEach(feedback => {
    const provider = feedback.provider;
    const model = feedback.model || 'unknown';

    // Initialize provider stats
    if (!providerStats[provider]) {
      providerStats[provider] = {
        total: 0,
        positive: 0, // ratings >= 3 or thumbs up (1)
        negative: 0, // ratings < 3 or thumbs down (-1)
        averageRating: 0,
        ratings: []
      };
    }

    // Initialize model stats
    const modelKey = `${provider}:${model}`;
    if (!modelStats[modelKey]) {
      modelStats[modelKey] = {
        provider,
        model,
        total: 0,
        positive: 0,
        negative: 0,
        averageRating: 0,
        ratings: []
      };
    }

    // Update provider stats
    providerStats[provider].total++;
    providerStats[provider].ratings.push(feedback.rating);
    
    if (feedback.rating >= 3 || feedback.rating === 1) {
      providerStats[provider].positive++;
    } else if (feedback.rating < 3 || feedback.rating === -1) {
      providerStats[provider].negative++;
    }

    // Update model stats
    modelStats[modelKey].total++;
    modelStats[modelKey].ratings.push(feedback.rating);
    
    if (feedback.rating >= 3 || feedback.rating === 1) {
      modelStats[modelKey].positive++;
    } else if (feedback.rating < 3 || feedback.rating === -1) {
      modelStats[modelKey].negative++;
    }
  });

  // Calculate averages
  Object.keys(providerStats).forEach(provider => {
    const stats = providerStats[provider];
    if (stats.ratings.length > 0) {
      // Convert thumbs to star equivalent for average (thumbs up = 4, thumbs down = 2)
      const normalizedRatings = stats.ratings.map(r => {
        if (r === -1) return 2;
        if (r === 1 && stats.ratings.some(r2 => r2 === -1)) return 4; // Only if mixed feedback
        return r;
      });
      stats.averageRating = normalizedRatings.reduce((a, b) => a + b, 0) / normalizedRatings.length;
      stats.positiveRate = stats.positive / stats.total;
      stats.negativeRate = stats.negative / stats.total;
    }
    delete stats.ratings; // Remove raw ratings array
  });

  Object.keys(modelStats).forEach(key => {
    const stats = modelStats[key];
    if (stats.ratings.length > 0) {
      const normalizedRatings = stats.ratings.map(r => {
        if (r === -1) return 2;
        if (r === 1 && stats.ratings.some(r2 => r2 === -1)) return 4;
        return r;
      });
      stats.averageRating = normalizedRatings.reduce((a, b) => a + b, 0) / normalizedRatings.length;
      stats.positiveRate = stats.positive / stats.total;
      stats.negativeRate = stats.negative / stats.total;
    }
    delete stats.ratings;
  });

  return {
    providerStats,
    modelStats: Object.values(modelStats),
    totalFeedback: allFeedback.length,
    period: {
      days,
      startDate: dateThreshold,
      endDate: new Date()
    }
  };
};

/**
 * Get recommended provider based on feedback history
 * Routes poorly rated tasks to alternate models
 * 
 * @param {string} contentType - Content type to generate
 * @param {string} userId - Optional user ID for personalized recommendations
 * @param {number} minRatingThreshold - Minimum average rating to consider (default: 3.0)
 * @returns {Promise<Object>} Recommended provider and model
 */
export const getRecommendedProvider = async (contentType, userId = null, minRatingThreshold = 3.0) => {
  const stats = await getFeedbackStats(userId, contentType, 30);

  // If no feedback exists, return default (Gemini)
  if (stats.totalFeedback === 0) {
    return {
      provider: 'GEMINI',
      model: 'gemini-3-pro-preview',
      reason: 'no_feedback',
      confidence: 0
    };
  }

  // Find best performing provider for this content type
  const providerScores = Object.entries(stats.providerStats)
    .map(([provider, data]) => ({
      provider,
      averageRating: data.averageRating,
      positiveRate: data.positiveRate,
      total: data.total,
      score: data.averageRating * (1 + data.positiveRate) // Weighted score
    }))
    .filter(p => p.averageRating >= minRatingThreshold)
    .sort((a, b) => b.score - a.score);

  if (providerScores.length === 0) {
    // All providers below threshold, use best available
    const allProviders = Object.entries(stats.providerStats)
      .map(([provider, data]) => ({
        provider,
        averageRating: data.averageRating,
        positiveRate: data.positiveRate,
        total: data.total,
        score: data.averageRating * (1 + data.positiveRate)
      }))
      .sort((a, b) => b.score - a.score);

    if (allProviders.length > 0) {
      const best = allProviders[0];
      return {
        provider: best.provider,
        model: getDefaultModelForProvider(best.provider),
        reason: 'best_available',
        confidence: best.averageRating / 5,
        warning: 'All providers below threshold'
      };
    }
  }

  const bestProvider = providerScores[0];
  
  // Find best model for this provider
  const providerModels = stats.modelStats
    .filter(m => m.provider === bestProvider.provider && m.averageRating >= minRatingThreshold)
    .sort((a, b) => b.averageRating - a.averageRating);

  const bestModel = providerModels.length > 0 
    ? providerModels[0].model 
    : getDefaultModelForProvider(bestProvider.provider);

  return {
    provider: bestProvider.provider,
    model: bestModel,
    reason: 'feedback_based',
    confidence: bestProvider.averageRating / 5,
    stats: {
      averageRating: bestProvider.averageRating,
      positiveRate: bestProvider.positiveRate,
      totalFeedback: bestProvider.total
    }
  };
};

/**
 * Get default model for a provider
 * 
 * @param {string} provider - Provider name
 * @returns {string} Default model name
 */
const getDefaultModelForProvider = (provider) => {
  const defaults = {
    'GEMINI': 'gemini-3-pro-preview',
    'OPENAI': 'gpt-4o',
    'ANTHROPIC': 'claude-3-5-sonnet-latest',
    'LLAMA': 'llama-3.3-70b-versatile'
  };
  return defaults[provider] || 'gemini-3-pro-preview';
};

/**
 * Get user's feedback history
 * 
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} Feedback history with pagination
 */
export const getUserFeedback = async (userId, limit = 20, offset = 0) => {
  const [feedback, total] = await Promise.all([
    prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    }),
    prisma.feedback.count({
      where: { userId }
    })
  ]);

  return {
    feedback,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  };
};
