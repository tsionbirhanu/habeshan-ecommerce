import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
} from './notification.controller';

/**
 * Notification Routes
 * All routes are protected by authenticateToken middleware
 * Users can only manage their own notifications
 */

const router = Router();

// Protect all routes with authentication
router.use(authenticateToken);

/**
 * GET /api/notifications
 * Get all notifications for the current user
 * Query params: page, limit, unreadOnly
 */
router.get('/', getMyNotifications);

/**
 * GET /api/notifications/stats
 * Get notification statistics (total, unread, read)
 */
router.get('/stats', getNotificationStats);

/**
 * PUT /api/notifications/:notificationId/read
 * Mark a single notification as read
 */
router.put('/:notificationId/read', markNotificationAsRead);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', markAllNotificationsAsRead);

/**
 * DELETE /api/notifications/:notificationId
 * Delete a single notification
 */
router.delete('/:notificationId', deleteNotification);

/**
 * DELETE /api/notifications/delete-all
 * Delete all notifications for the current user
 */
router.delete('/delete-all', deleteAllNotifications);

export default router;
