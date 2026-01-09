/**
 * Authentication Middleware
 * Validates JWT tokens from cookies and extracts user information
 */

import jwt from 'jsonwebtoken';

/**
 * Authenticate middleware - validates JWT token from cookies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authentication token provided. Please log in.'
        }
      });
    }

    // Verify token using the same SECRET as FastAPI backend
    const secret = process.env.SECRET;
    if (!secret) {
      // Critical configuration error - will be logged by error handler
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Server configuration error'
        }
      });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, secret);

    // FastAPI Users JWT tokens typically have:
    // - sub: user ID (UUID)
    // - email: user email (if included)
    // - exp: expiration timestamp
    // - iat: issued at timestamp
    // Additional fields may include role if added to token claims

    // Extract user information from token payload
    const userId = decoded.sub; // Subject (user ID) from JWT
    
    // Attach user info to request object
    req.user = {
      id: userId,
      email: decoded.email || null,
      role: decoded.role || 'user', // Default to 'user' if not in token
      // Include full decoded payload for debugging/advanced use cases
      _token: decoded
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle different JWT verification errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired. Please log in again.'
        }
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token. Please log in again.'
        }
      });
    }

    // Handle other errors - error will be logged by centralized error handler
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed. Please try again.'
      }
    });
  }
};
