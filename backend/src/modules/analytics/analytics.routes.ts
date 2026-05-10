import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateQuery } from '../../middleware/validation.middleware';
import * as analyticsController from './analytics.controller';
import {
  salesReportSchema,
  productReportSchema,
  customerReportSchema,
  inventoryReportSchema,
  paymentReportSchema,
  exportReportSchema,
} from './analytics.validation';

const router = Router();

// All analytics routes require authentication + ADMIN role
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// ============ ANALYTICS REPORT ROUTES ============

/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get sales report
 *     tags: [Analytics]
 *     description: Retrieve sales data with date range and grouping options
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Sales report with date range and grouping
router.get('/sales', validateQuery(salesReportSchema), analyticsController.getSalesReport);

/**
 * @swagger
 * /api/analytics/products:
 *   get:
 *     summary: Get product performance report
 *     tags: [Analytics]
 *     description: Retrieve product sales and performance metrics
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [sales, revenue, reviews, trending]
 *     responses:
 *       200:
 *         description: Product report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Product report with performance metrics
router.get('/products', validateQuery(productReportSchema), analyticsController.getProductReport);

/**
 * @swagger
 * /api/analytics/customers:
 *   get:
 *     summary: Get customer analytics report
 *     tags: [Analytics]
 *     description: Retrieve customer cohort analysis and behavior metrics
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         name: cohortSize
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Customer report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Customer report with cohort analysis
router.get(
  '/customers',
  validateQuery(customerReportSchema),
  analyticsController.getCustomerReport
);

/**
 * @swagger
 * /api/analytics/inventory:
 *   get:
 *     summary: Get inventory analytics report
 *     tags: [Analytics]
 *     description: Retrieve inventory movement and turnover analysis
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *       - in: query
 *         name: warehouseId
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
 *     responses:
 *       200:
 *         description: Inventory report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Inventory report with movement analysis
router.get(
  '/inventory',
  validateQuery(inventoryReportSchema),
  analyticsController.getInventoryReport
);

/**
 * @swagger
 * /api/analytics/payments:
 *   get:
 *     summary: Get payment analytics report
 *     tags: [Analytics]
 *     description: Retrieve payment method breakdown and transaction analysis
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         name: method
 *         schema:
 *           type: string
 *           enum: [STRIPE, PAYPAL, KLARNA, COD]
 *     responses:
 *       200:
 *         description: Payment report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Payment report with method breakdown
router.get('/payments', validateQuery(paymentReportSchema), analyticsController.getPaymentReport);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     summary: Export analytics report
 *     tags: [Analytics]
 *     description: Export analytics data in CSV or JSON format
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [sales, products, customers, inventory, payments]
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
 *     responses:
 *       200:
 *         description: Report exported successfully
 *       400:
 *         description: Invalid format or report type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
// Export reports in CSV or JSON
router.get('/export', validateQuery(exportReportSchema), analyticsController.exportReport);

export default router;
