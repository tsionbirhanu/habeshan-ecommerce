import { Router } from 'express';
import * as inventoryController from './inventory.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validation.middleware';
import { UserRole } from '@prisma/client';
import {
  getInventorySchema,
  updateInventorySchema,
  getInventoryHistorySchema,
} from './inventory.validation';

const router = Router();

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get inventory list
 *     tags: [Inventory]
 *     description: Retrieve paginated inventory list (Admin or Vendor)
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
 *         name: productId
 *         schema:
 *           type: string
 *       - in: query
 *         name: lowStockOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Inventory list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Vendor role required
 */
// GET /api/inventory - Get inventory list (Admin | Vendor)
router.get(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateQuery(getInventorySchema),
  inventoryController.getInventoryList
);

/**
 * @swagger
 * /api/inventory/alerts:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Inventory]
 *     description: Retrieve products with low stock levels (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock alerts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// GET /api/inventory/alerts - Get low stock alerts (Admin only)
router.get(
  '/alerts',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  inventoryController.getLowStockAlerts
);

/**
 * @swagger
 * /api/inventory/summary:
 *   get:
 *     summary: Get inventory summary
 *     tags: [Inventory]
 *     description: Retrieve inventory summary statistics (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// GET /api/inventory/summary - Get inventory summary (Admin only)
router.get(
  '/summary',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  inventoryController.getInventorySummary
);

/**
 * @swagger
 * /api/inventory/history:
 *   get:
 *     summary: Get inventory history
 *     tags: [Inventory]
 *     description: Retrieve inventory movement history (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Inventory history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// GET /api/inventory/history - Get inventory history (Admin only)
router.get(
  '/history',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateQuery(getInventoryHistorySchema),
  inventoryController.getInventoryHistory
);

/**
 * @swagger
 * /api/inventory/{productId}:
 *   get:
 *     summary: Get product inventory
 *     tags: [Inventory]
 *     description: Get inventory details for a specific product (Admin or Vendor)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product inventory retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update inventory
 *     tags: [Inventory]
 *     description: Update inventory for a product (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               quantity:
 *                 type: integer
 *               sku:
 *                 type: string
 *               warehouseId:
 *                 type: string
 *             required:
 *               - quantity
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 */
// GET /api/inventory/:productId - Get product inventory (Admin | Vendor)
router.get(
  '/:productId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  inventoryController.getProductInventory
);

// PUT /api/inventory/:productId - Update inventory (Admin only)
router.put(
  '/:productId',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(updateInventorySchema),
  inventoryController.updateInventory
);

export default router;
