/**
 * Generation Failure Tracking Service
 * Logs generation failures with metadata for debugging and monitoring
 */

import prisma from '../config/database.js';

/**
 * Log a generation failure
 * 
 * @param {string} userId - User ID
 * @param {string} service - Service name (e.g., 'article_generation', 'image_generation', 'video_generation', 'research', 'seo_analysis')
 * @param {Error|string} error - Error object or error message
 * @param {Object} metadata - Additional metadata
 * @param {string} metadata.model - AI model used (e.g., 'gemini-3-pro-preview', 'gpt-4o')
 * @param {string} metadata.provider - AI provider (e.g., 'gemini', 'openai', 'anthropic', 'groq')
 * @param {string} metadata.inputSnippet - Snippet of input that caused the failure (truncated to 500 chars)
 * @param {Object} metadata.requestDetails - Request details (optional)
 * @returns {Promise<Object>} Created generation failure record
 */
export const logGenerationFailure = async (userId, service, error, metadata = {}) => {
  try {
    // Extract error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;
    
    // Determine error type from error message or error object
    let errorType = 'UNKNOWN';
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        errorType = 'QUOTA_EXCEEDED';
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        errorType = 'TIMEOUT';
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        errorType = 'VALIDATION_ERROR';
      } else if (error.message.includes('api') || error.message.includes('provider')) {
        errorType = 'API_ERROR';
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorType = 'NETWORK_ERROR';
      } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        errorType = 'AUTH_ERROR';
      }
    }
    
    // Truncate input snippet to 500 characters for privacy and storage efficiency
    const inputSnippet = metadata.inputSnippet 
      ? String(metadata.inputSnippet).substring(0, 500)
      : null;
    
    // Create failure record
    const failure = await prisma.generationFailure.create({
      data: {
        userId,
        service,
        model: metadata.model || null,
        provider: metadata.provider || null,
        errorType,
        errorMessage: errorMessage.substring(0, 2000), // Limit error message length
        inputSnippet,
        metadata: {
          ...metadata.requestDetails,
          stack: errorStack ? errorStack.substring(0, 1000) : null, // Limit stack trace length
          timestamp: new Date().toISOString(),
          ...(metadata || {})
        }
      }
    });
    
    return failure;
  } catch (loggingError) {
    // If logging itself fails, throw the error (will be caught by error handler)
    throw loggingError;
  }
};

/**
 * Get generation failures for a user
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of failures to return (default: 50)
 * @param {Date} options.startDate - Start date for filtering (optional)
 * @param {Date} options.endDate - End date for filtering (optional)
 * @param {string} options.service - Filter by service name (optional)
 * @returns {Promise<Array>} Array of generation failure records
 */
export const getUserFailures = async (userId, options = {}) => {
  const {
    limit = 50,
    startDate,
    endDate,
    service
  } = options;
  
  const where = { userId };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  
  if (service) {
    where.service = service;
  }
  
  return await prisma.generationFailure.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

/**
 * Get failure statistics
 * 
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for filtering (optional)
 * @param {Date} options.endDate - End date for filtering (optional)
 * @returns {Promise<Object>} Failure statistics
 */
export const getFailureStats = async (options = {}) => {
  const { startDate, endDate } = options;
  
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  
  const failures = await prisma.generationFailure.findMany({
    where,
    select: {
      service: true,
      errorType: true,
      provider: true,
      userId: true
    }
  });
  
  // Aggregate statistics
  const stats = {
    total: failures.length,
    byService: {},
    byErrorType: {},
    byProvider: {},
    uniqueUsers: new Set()
  };
  
  failures.forEach(failure => {
    stats.uniqueUsers.add(failure.userId);
    
    // Count by service
    stats.byService[failure.service] = (stats.byService[failure.service] || 0) + 1;
    
    // Count by error type
    stats.byErrorType[failure.errorType] = (stats.byErrorType[failure.errorType] || 0) + 1;
    
    // Count by provider
    if (failure.provider) {
      stats.byProvider[failure.provider] = (stats.byProvider[failure.provider] || 0) + 1;
    }
  });
  
  stats.uniqueUsers = stats.uniqueUsers.size;
  
  return stats;
};
