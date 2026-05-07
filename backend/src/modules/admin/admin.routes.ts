import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware';
import * as adminController from './admin.controller';
import * as dashboardController from './dashboard.controller';
import {
  updateUserRoleSchema,
  toggleUserStatusSchema,
  rejectVendorSchema,
  usersFilterSchema,
  vendorsFilterSchema,
  activityLogSchema,
} from './admin.validation';
import { z } from 'zod';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// ============ DASHBOARD ROUTES ============
router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/dashboard/charts', dashboardController.getSalesChart);
router.get('/dashboard/alerts', dashboardController.getDashboardAlerts);
router.get('/dashboard/top-products', dashboardController.getTopProducts);
router.get('/dashboard/orders', dashboardController.getRecentOrders);

// ============ USER MANAGEMENT ROUTES ============

// Get all users with pagination and filtering
router.get('/users', validateQuery(usersFilterSchema), adminController.getAllUsers);

// Get specific user details
router.get(
  '/users/:userId',
  validateParams(z.object({ userId: z.string().uuid() })),
  adminController.getUserDetails
);

// Update user role
router.put(
  '/users/:userId/role',
  validateParams(z.object({ userId: z.string().uuid() })),
  validateBody(updateUserRoleSchema),
  adminController.updateUserRole
);

// Toggle user status (enable/disable account)
router.put(
  '/users/:userId/status',
  validateParams(z.object({ userId: z.string().uuid() })),
  validateBody(toggleUserStatusSchema),
  adminController.toggleUserStatus
);

// Reset user password (send reset email)
router.post(
  '/users/:userId/reset-password',
  validateParams(z.object({ userId: z.string().uuid() })),
  adminController.resetUserPassword
);

// Get user activity log
router.get(
  '/users/:userId/activity',
  validateParams(z.object({ userId: z.string().uuid() })),
  validateQuery(activityLogSchema),
  adminController.getUserActivityLog
);

// ============ VENDOR MANAGEMENT ROUTES ============

// Get all vendors with pagination and filtering
router.get('/vendors', validateQuery(vendorsFilterSchema), adminController.getAllVendors);

// Approve vendor registration
router.post(
  '/vendors/:vendorId/approve',
  validateParams(z.object({ vendorId: z.string().uuid() })),
  adminController.approveVendor
);

// Reject vendor registration
router.post(
  '/vendors/:vendorId/reject',
  validateParams(z.object({ vendorId: z.string().uuid() })),
  validateBody(rejectVendorSchema),
  adminController.rejectVendor
);

export default router;
