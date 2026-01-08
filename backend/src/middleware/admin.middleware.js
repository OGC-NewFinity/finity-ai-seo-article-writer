/**
 * Admin Middleware
 * Restricts access to admin-only routes
 */

import { authenticate } from './auth.middleware.js';

/**
 * Require admin role
 * Must be used after authenticate middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
  }

  next();
};

/**
 * Combined middleware: authenticate + require admin
 * Use this for admin-only routes
 */
export const authenticateAdmin = [authenticate, requireAdmin];
