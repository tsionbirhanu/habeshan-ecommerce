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
 * POST /api/shipping/rates
 * Get available shipping rates for a package
 * Public endpoint
 * Body: { weightKg, postalCode, orderTotal? }
 */
router.post('/rates', getShippingRates);

/**
 * POST /api/shipping
 * Create a shipment for an order
 * Protected - ADMIN only
 * Params: orderId
 * Body: { method: 'DHL' | 'HERMES' | 'DPD' }
 */
router.post('/', authenticateToken, createShipment);

/**
 * GET /api/shipping/track/:trackingNumber
 * Get tracking information for a shipment
 * Protected - Customer or Admin
 * Params: trackingNumber
 */
router.get('/track/:trackingNumber', authenticateToken, getTracking);

/**
 * GET /api/shipping/:shipmentId/label
 * Download shipping label PDF
 * Protected - ADMIN only
 * Params: shipmentId
 */
router.get('/:shipmentId/label', authenticateToken, downloadLabel);

/**
 * GET /api/shipping/:orderId
 * Get shipment details for an order
 * Protected - Customer or Admin
 * Params: orderId
 */
router.get('/:orderId', authenticateToken, getOrderShipment);

export default router;
