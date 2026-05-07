import { Router } from 'express';
import * as orderController from './order.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validation.middleware';
import { UserRole } from '@prisma/client';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  addOrderNoteSchema,
  getOrdersSchema,
  getMyOrdersSchema,
} from './order.validation';

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

// POST /api/orders - Create order (Customer only)
router.post(
  '/',
  requireRole(UserRole.CUSTOMER),
  validateBody(createOrderSchema),
  orderController.createOrder
);

// GET /api/orders - Get all orders (Admin only)
router.get(
  '/',
  requireRole(UserRole.ADMIN),
  validateQuery(getOrdersSchema),
  orderController.getAllOrders
);

// GET /api/orders/my - Get customer's own orders (Customer only)
router.get(
  '/my',
  requireRole(UserRole.CUSTOMER),
  validateQuery(getMyOrdersSchema),
  orderController.getMyOrders
);

// GET /api/orders/:id - Get order by ID (Customer own | Admin)
router.get(
  '/:id',
  orderController.getOrderById
);

// PUT /api/orders/:id/status - Update order status (Admin | Vendor)
router.put(
  '/:id/status',
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// POST /api/orders/:id/cancel - Cancel order (Customer | Admin)
router.post(
  '/:id/cancel',
  orderController.cancelOrder
);

// GET /api/orders/:id/tracking - Get order tracking (Customer own | Admin)
router.get(
  '/:id/tracking',
  orderController.getOrderTracking
);

// POST /api/orders/:id/notes - Add order note (Admin only)
router.post(
  '/:id/notes',
  requireRole(UserRole.ADMIN),
  validateBody(addOrderNoteSchema),
  orderController.addOrderNote
);

export default router;
