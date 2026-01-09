/**
 * API Key Authentication Middleware
 * Validates platform API keys for WordPress plugin and external integrations
 */

import prisma from '../config/database.js';
import crypto from 'crypto';

/**
 * Authenticate using API key
 * Expects API key in Authorization header as "Bearer <api_key>"
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticateApiKey = async (req, res, next) => {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No API key provided. Include API key in Authorization header as "Bearer <api_key>".'
        }
      });
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

    if (!apiKey || apiKey.trim() === '') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid API key format.'
        }
      });
    }

    // Find API key in database
    const platformApiKey = await prisma.platformApiKey.findUnique({
      where: { apiKey },
      include: {
        user: true
      }
    });

    if (!platformApiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid API key.'
        }
      });
    }

    // Check if API key is active
    if (!platformApiKey.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_INACTIVE',
          message: 'API key is inactive. Please contact support.'
        }
      });
    }

    // Update last used timestamp
    await prisma.platformApiKey.update({
      where: { id: platformApiKey.id },
      data: { lastUsedAt: new Date() }
    });

    // Attach user info to request object
    req.user = {
      id: platformApiKey.userId,
      email: platformApiKey.user.email || null,
      role: 'user', // Default role for API key users
      apiKeyId: platformApiKey.id
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Error will be logged by centralized error handler
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed. Please try again.'
      }
    });
  }
};

/**
 * Generate a new platform API key for a user
 * 
 * @param {string} userId - User ID
 * @param {string} name - Optional name for the key
 * @returns {Promise<string>} Generated API key
 */
export const generateApiKey = async (userId, name = null) => {
  // Generate a secure random API key (64 characters)
  const apiKey = 'nova_xfinity_' + crypto.randomBytes(32).toString('hex');

  // Check if user already has an API key
  const existingKey = await prisma.platformApiKey.findUnique({
    where: { userId }
  });

  if (existingKey) {
    // Update existing key if inactive, otherwise throw error
    if (!existingKey.isActive) {
      await prisma.platformApiKey.update({
        where: { id: existingKey.id },
        data: {
          apiKey,
          isActive: true,
          name: name || existingKey.name
        }
      });
      return apiKey;
    }
    throw new Error('User already has an active API key. Please revoke existing key first.');
  }

  // Create new API key
  await prisma.platformApiKey.create({
    data: {
      userId,
      apiKey,
      name: name || 'WordPress Plugin Key',
      isActive: true
    }
  });

  return apiKey;
};

/**
 * Revoke an API key
 * 
 * @param {string} userId - User ID
 * @param {string} apiKeyId - Optional API key ID, if not provided revokes all keys for user
 * @returns {Promise<void>}
 */
export const revokeApiKey = async (userId, apiKeyId = null) => {
  if (apiKeyId) {
    await prisma.platformApiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false }
    });
  } else {
    await prisma.platformApiKey.updateMany({
      where: { userId },
      data: { isActive: false }
    });
  }
};
