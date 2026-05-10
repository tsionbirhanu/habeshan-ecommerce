import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware';
import * as adminController from './admin.controller';
import * as dashboardController from './dashboard.controller';
import * as settingsController from './settings.controller';
import {
  updateUserRoleSchema,
  toggleUserStatusSchema,
  createVendorSchema,
  usersFilterSchema,
  vendorsFilterSchema,
  activityLogSchema,
} from './admin.validation';
import { updateSettingsSchema } from './settings.validation';
import { z } from 'zod';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// ============ DASHBOARD ROUTES ============

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin - Dashboard]
 *     description: Returns high-level admin KPIs including revenue, orders, customers, and products
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         today: { type: number }
 *                         thisWeek: { type: number }
 *                         thisMonth: { type: number }
 *                         thisYear: { type: number }
 *                     orders:
 *                       type: object
 *                       properties:
 *                         total: { type: integer }
 *                         pending: { type: integer }
 *                         processing: { type: integer }
 *                         today: { type: integer }
 *                     customers:
 *                       type: object
 *                       properties:
 *                         total: { type: integer }
 *                         new: { type: integer }
 *                         active: { type: integer }
 *                     products:
 *                       type: object
 *                       properties:
 *                         total: { type: integer }
 *                         active: { type: integer }
 *                         outOfStock: { type: integer }
 *                         lowStock: { type: integer }
 *       401:
 *         description: Unauthorized - No valid token
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/dashboard', dashboardController.getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/charts:
 *   get:
 *     summary: Get sales and order trend charts
 *     tags: [Admin - Dashboard]
 *     description: Returns sales and order trend data for a specified period
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: ['7d', '30d', '12m']
 *         description: Time period for chart data
 *     responses:
 *       200:
 *         description: Chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/dashboard/charts', dashboardController.getSalesChart);

/**
 * @swagger
 * /api/admin/dashboard/alerts:
 *   get:
 *     summary: Get dashboard alerts
 *     tags: [Admin - Dashboard]
 *     description: Returns system alerts and notifications for the dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/dashboard/alerts', dashboardController.getDashboardAlerts);

/**
 * @swagger
 * /api/admin/dashboard/top-products:
 *   get:
 *     summary: Get top performing products
 *     tags: [Admin - Dashboard]
 *     description: Returns list of top-selling products with performance metrics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/dashboard/top-products', dashboardController.getTopProducts);

/**
 * @swagger
 * /api/admin/dashboard/orders:
 *   get:
 *     summary: Get recent orders
 *     tags: [Admin - Dashboard]
 *     description: Returns list of recent orders with summary details
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recent orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/dashboard/orders', dashboardController.getRecentOrders);

// ============ USER MANAGEMENT ROUTES ============

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Admin - User Management]
 *     description: Returns paginated list of all users with optional filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: ['ADMIN', 'VENDOR', 'CUSTOMER', 'DELIVERY']
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Get all users with pagination and filtering
router.get('/users', validateQuery(usersFilterSchema), adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin - User Management]
 *     description: Returns detailed information about a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
// Get specific user details
router.get(
  '/users/:userId',
  validateParams(z.object({ userId: z.string().uuid() })),
  adminController.getUserDetails
);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin - User Management]
 *     description: Updates the role of a specific user (ADMIN, VENDOR, CUSTOMER, DELIVERY)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: ['ADMIN', 'VENDOR', 'CUSTOMER', 'DELIVERY']
 *             required:
 *               - role
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
// Update user role
router.put(
  '/users/:userId/role',
  validateParams(z.object({ userId: z.string().uuid() })),
  validateBody(updateUserRoleSchema),
  adminController.updateUserRole
);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   put:
 *     summary: Toggle user account status
 *     tags: [Admin - User Management]
 *     description: Enable or disable a user account
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *             required:
 *               - isActive
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
// Toggle user status (enable/disable account)
router.put(
  '/users/:userId/status',
  validateParams(z.object({ userId: z.string().uuid() })),
  validateBody(toggleUserStatusSchema),
  adminController.toggleUserStatus
);

/**
 * @swagger
 * /api/admin/users/{userId}/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Admin - User Management]
 *     description: Send password reset email to user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
// Reset user password (send reset email)
router.post(
  '/users/:userId/reset-password',
  validateParams(z.object({ userId: z.string().uuid() })),
  adminController.resetUserPassword
);

/**
 * @swagger
 * /api/admin/users/{userId}/activity:
 *   get:
 *     summary: Get user activity log
 *     tags: [Admin - User Management]
 *     description: Returns activity log entries for a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Activity log retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
// Get user activity log
router.get(
  '/users/:userId/activity',
  validateParams(z.object({ userId: z.string().uuid() })),
  validateQuery(activityLogSchema),
  adminController.getUserActivityLog
);

// ============ VENDOR MANAGEMENT ROUTES ============

/**
 * @swagger
 * /api/admin/vendors:
 *   post:
 *     summary: Create vendor
 *     tags: [Admin - Vendor Management]
 *     description: Create a new vendor account (admin only). Vendor receives invitation email.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               storeName:
 *                 type: string
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - storeName
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       409:
 *         description: Email already registered
 *   get:
 *     summary: Get all vendors
 *     tags: [Admin - Vendor Management]
 *     description: Returns paginated list of vendors with optional filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendors list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Create vendor (admin only)
router.post('/vendors', validateBody(createVendorSchema), adminController.createVendor);

// Get all vendors with pagination and filtering
router.get('/vendors', validateQuery(vendorsFilterSchema), adminController.getAllVendors);

// ============ SETTINGS MANAGEMENT ROUTES ============

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin - Settings]
 *     description: Retrieve all system configuration settings
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *   put:
 *     summary: Update system settings
 *     tags: [Admin - Settings]
 *     description: Update system configuration settings (partial update allowed)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *               storeDescription:
 *                 type: string
 *               supportEmail:
 *                 type: string
 *                 format: email
 *               supportPhone:
 *                 type: string
 *               currency:
 *                 type: string
 *               timezone:
 *                 type: string
 *               maintenanceMode:
 *                 type: boolean
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Get all system settings
router.get('/settings', settingsController.getSettings);

// Update system settings (partial update)
router.put('/settings', validateBody(updateSettingsSchema), settingsController.updateSettings);

export default router;
