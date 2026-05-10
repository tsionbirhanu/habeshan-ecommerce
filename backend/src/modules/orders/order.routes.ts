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

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 *     description: Create a new order from customer's cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddressId:
 *                 type: string
 *                 format: uuid
 *               billingAddressId:
 *                 type: string
 *                 format: uuid
 *               paymentMethod:
 *                 type: string
 *                 enum: [STRIPE, PAYPAL, KLARNA, COD]
 *               couponCode:
 *                 type: string
 *             required:
 *               - deliveryAddressId
 *               - billingAddressId
 *               - paymentMethod
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or insufficient inventory
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     description: Retrieve paginated list of all orders
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_PAYMENT, CONFIRMED, PROCESSING, SHIPPED, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, RETURNED, REFUNDED]
 *       - in: query
 *         name: dateRange
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
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

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     description: Retrieve customer's own orders
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer's orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
// GET /api/orders/my - Get customer's own orders (Customer only)
router.get(
  '/my',
  requireRole(UserRole.CUSTOMER),
  validateQuery(getMyOrdersSchema),
  orderController.getMyOrders
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     description: Retrieve detailed information about a specific order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     description: Update order status (Admin or Vendor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *                 enum: [PENDING_PAYMENT, CONFIRMED, PROCESSING, SHIPPED, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, RETURNED, REFUNDED]
 *               notes:
 *                 type: string
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
// GET /api/orders/:id - Get order by ID (Customer own | Admin)
router.get('/:id', orderController.getOrderById);

// PUT /api/orders/:id/status - Update order status (Admin | Vendor)
router.put(
  '/:id/status',
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Orders]
 *     description: Cancel an order (Customer can cancel own orders, Admin can cancel any)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
// POST /api/orders/:id/cancel - Cancel order (Customer | Admin)
router.post('/:id/cancel', orderController.cancelOrder);

/**
 * @swagger
 * /api/orders/{id}/tracking:
 *   get:
 *     summary: Get order tracking
 *     tags: [Orders, Shipping]
 *     description: Get tracking information for an order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tracking information retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
// GET /api/orders/:id/tracking - Get order tracking (Customer own | Admin)
router.get('/:id/tracking', orderController.getOrderTracking);

/**
 * @swagger
 * /api/orders/{id}/notes:
 *   post:
 *     summary: Add order note
 *     tags: [Orders]
 *     description: Add internal note to an order (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               note:
 *                 type: string
 *             required:
 *               - note
 *     responses:
 *       201:
 *         description: Note added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Order not found
 */
// POST /api/orders/:id/notes - Add order note (Admin only)
router.post(
  '/:id/notes',
  requireRole(UserRole.ADMIN),
  validateBody(addOrderNoteSchema),
  orderController.addOrderNote
);

export default router;
