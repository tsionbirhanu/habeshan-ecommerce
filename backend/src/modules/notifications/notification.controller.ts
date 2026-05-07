import { Response, Request } from 'express';
import { AuthPayload } from '../../types/auth.types';
import db from '../../database/prisma';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

interface AuthRequest extends Request {
  user?: AuthPayload | null;
}

/**
 * Notification Controller
 * Handles in-app notification CRUD operations
 * Users can view, mark as read, and manage their notifications
 */

/**
 * Get all notifications for the current user
 * Supports pagination and filtering for unread only
 * GET /api/notifications?page=1&limit=10&unreadOnly=true
 */
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const whereFilter: any = {
      userId,
    };

    if (unreadOnly === 'true') {
      whereFilter.isRead = false;
    }

    // Fetch notifications
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: whereFilter,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      db.notification.count({
        where: whereFilter,
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    logger.info(`Fetched ${notifications.length} notifications for user ${userId}`);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error fetching notifications: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to fetch notifications',
    });
  }
};

/**
 * Mark a single notification as read
 * PUT /api/notifications/:notificationId/read
 */
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    if (!notificationId) {
      throw new AppError('Notification ID is required', 400, 'INVALID_INPUT');
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    if (notification.userId !== userId) {
      throw new AppError(
        'Unauthorized: Notification does not belong to this user',
        403,
        'FORBIDDEN'
      );
    }

    // Mark as read
    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    logger.info(`Marked notification ${notificationId} as read for user ${userId}`);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    logger.error(`Error marking notification as read: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to mark notification as read',
    });
  }
};

/**
 * Mark all notifications as read for the current user
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    // Update all unread notifications
    const result = await db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    logger.info(`Marked ${result.count} notifications as read for user ${userId}`);

    res.json({
      success: true,
      data: {
        updatedCount: result.count,
        message: `${result.count} notification(s) marked as read`,
      },
    });
  } catch (error: any) {
    logger.error(`Error marking all notifications as read: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to mark notifications as read',
    });
  }
};

/**
 * Delete a single notification
 * DELETE /api/notifications/:notificationId
 */
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    if (!notificationId) {
      throw new AppError('Notification ID is required', 400, 'INVALID_INPUT');
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    if (notification.userId !== userId) {
      throw new AppError(
        'Unauthorized: Notification does not belong to this user',
        403,
        'FORBIDDEN'
      );
    }

    // Delete notification
    await db.notification.delete({
      where: { id: notificationId },
    });

    logger.info(`Deleted notification ${notificationId} for user ${userId}`);

    res.json({
      success: true,
      data: {
        message: 'Notification deleted successfully',
      },
    });
  } catch (error: any) {
    logger.error(`Error deleting notification: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to delete notification',
    });
  }
};

/**
 * Delete all notifications for the current user
 * DELETE /api/notifications/delete-all
 */
export const deleteAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    // Delete all notifications
    const result = await db.notification.deleteMany({
      where: { userId },
    });

    logger.info(`Deleted ${result.count} notifications for user ${userId}`);

    res.json({
      success: true,
      data: {
        deletedCount: result.count,
        message: `${result.count} notification(s) deleted successfully`,
      },
    });
  } catch (error: any) {
    logger.error(`Error deleting all notifications: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to delete notifications',
    });
  }
};

/**
 * Get notification statistics for the current user
 * GET /api/notifications/stats
 */
export const getNotificationStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const [total, unread] = await Promise.all([
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
    ]);

    logger.info(`Fetched notification stats for user ${userId}: Total=${total}, Unread=${unread}`);

    res.json({
      success: true,
      data: {
        total,
        unread,
        read: total - unread,
      },
    });
  } catch (error: any) {
    logger.error(`Error fetching notification stats: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to fetch notification statistics',
    });
  }
};
