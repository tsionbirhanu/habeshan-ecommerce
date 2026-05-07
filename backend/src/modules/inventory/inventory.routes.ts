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

// GET /api/inventory - Get inventory list (Admin | Vendor)
router.get(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateQuery(getInventorySchema),
  inventoryController.getInventoryList
);

// GET /api/inventory/alerts - Get low stock alerts (Admin only)
router.get(
  '/alerts',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  inventoryController.getLowStockAlerts
);

// GET /api/inventory/summary - Get inventory summary (Admin only)
router.get(
  '/summary',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  inventoryController.getInventorySummary
);

// GET /api/inventory/history - Get inventory history (Admin only)
router.get(
  '/history',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateQuery(getInventoryHistorySchema),
  inventoryController.getInventoryHistory
);

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
