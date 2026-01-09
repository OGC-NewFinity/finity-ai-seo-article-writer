/**
 * Notifications Routes
 * API endpoints for managing user notifications
 */

import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  getUnreadNotifications,
  markNotificationAsRead
} from '../services/notification.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get unread notifications for the current user
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const notifications = await getUnreadNotifications(req.user.id, limit);

    res.json({
      success: true,
      data: notifications
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
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const result = await markNotificationAsRead(req.params.id, req.user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOTIFICATION_ERROR',
          message: result.error || 'Failed to mark notification as read'
        }
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
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
});

export default router;
