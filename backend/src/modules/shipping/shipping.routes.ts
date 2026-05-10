import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  getShippingRates,
  createShipment,
  getTracking,
  downloadLabel,
  getOrderShipment,
} from './shipping.controller';

/**
 * Shipping Routes
 * Endpoints for shipping rates, label generation, and tracking
 */

const router = Router();

/**
 * @swagger
 * /api/shipping/rates:
 *   post:
 *     summary: Get shipping rates
 *     tags: [Shipping]
 *     description: Calculate available shipping rates for a package (public endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weightKg:
 *                 type: number
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               orderTotal:
 *                 type: number
 *             required:
 *               - weightKg
 *               - postalCode
 *               - country
 *     responses:
 *       200:
 *         description: Shipping rates retrieved successfully
 *       400:
 *         description: Validation error
 */
router.post('/rates', getShippingRates);

/**
 * @swagger
 * /api/shipping:
 *   post:
 *     summary: Create shipment
 *     tags: [Shipping]
 *     description: Create a shipment for an order (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               method:
 *                 type: string
 *                 enum: [DHL, HERMES, DPD]
 *             required:
 *               - orderId
 *               - method
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Order not found
 */
router.post('/', authenticateToken, createShipment);

/**
 * @swagger
 * /api/shipping/track/{trackingNumber}:
 *   get:
 *     summary: Get tracking information
 *     tags: [Shipping]
 *     description: Get tracking information for a shipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking information retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tracking not found
 */
router.get('/track/:trackingNumber', authenticateToken, getTracking);

/**
 * @swagger
 * /api/shipping/{shipmentId}/label:
 *   get:
 *     summary: Download shipping label
 *     tags: [Shipping]
 *     description: Download shipping label PDF (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shipping label PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Shipment not found
 */
router.get('/:shipmentId/label', authenticateToken, downloadLabel);

/**
 * @swagger
 * /api/shipping/{orderId}:
 *   get:
 *     summary: Get order shipment details
 *     tags: [Shipping]
 *     description: Get shipment details for an order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shipment details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shipment not found
 */
router.get('/:orderId', authenticateToken, getOrderShipment);

export default router;
