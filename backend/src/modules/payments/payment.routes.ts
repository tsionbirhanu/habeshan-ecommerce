import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validation.middleware';
import { UserRole } from '@prisma/client';
import {
  createPaymentIntentSchema,
  refundPaymentSchema,
  createPaypalOrderSchema,
  capturePaypalOrderSchema,
  createKlarnaSessionSchema,
  confirmKlarnaOrderSchema,
} from './payment.validation';

const router = Router();

/**
 * POST /api/payments/stripe/webhook
 * IMPORTANT: This route requires raw body (not JSON parsed)
 * It must be registered with express.raw() in app.ts BEFORE express.json()
 */
// This route will be mounted separately in app.ts with raw body middleware

/**
 * GET /api/payments/methods
 * Get available payment methods (public)
 */
router.get('/methods', paymentController.getPaymentMethods);

// All authenticated routes require authentication
router.use(authenticateToken);

/**
 * POST /api/payments/stripe/create-intent
 * Create a Stripe PaymentIntent for an order (Customer)
 */
router.post(
  '/stripe/create-intent',
  requireRole(UserRole.CUSTOMER),
  validateBody(createPaymentIntentSchema),
  paymentController.createStripePaymentIntent
);

/**
 * POST /api/payments/paypal/create
 * Create PayPal order (Customer)
 */
router.post(
  '/paypal/create',
  requireRole(UserRole.CUSTOMER),
  validateBody(createPaypalOrderSchema),
  paymentController.createPaypalOrder
);

/**
 * POST /api/payments/paypal/capture
 * Capture PayPal order after approval (Customer)
 */
router.post(
  '/paypal/capture',
  requireRole(UserRole.CUSTOMER),
  validateBody(capturePaypalOrderSchema),
  paymentController.capturePaypalOrder
);

/**
 * POST /api/payments/klarna/session
 * Create Klarna checkout session (Customer)
 */
router.post(
  '/klarna/session',
  requireRole(UserRole.CUSTOMER),
  validateBody(createKlarnaSessionSchema),
  paymentController.createKlarnaSession
);

/**
 * POST /api/payments/klarna/confirm
 * Confirm Klarna order (Customer)
 */
router.post(
  '/klarna/confirm',
  requireRole(UserRole.CUSTOMER),
  validateBody(confirmKlarnaOrderSchema),
  paymentController.confirmKlarnaOrder
);

/**
 * GET /api/payments/:orderId
 * Get payment status (Customer own or Admin)
 */
router.get('/:orderId', paymentController.getPaymentStatus);

/**
 * POST /api/payments/:orderId/refund
 * Refund a payment (Admin)
 */
router.post(
  '/:orderId/refund',
  requireRole(UserRole.ADMIN),
  validateBody(refundPaymentSchema),
  paymentController.refundPayment
);

/**
 * GET /api/payments/:orderId/invoice
 * Get invoice data as JSON (Customer own or Admin)
 */
router.get('/:orderId/invoice', paymentController.getInvoice);

/**
 * GET /api/payments/:orderId/invoice/download
 * Download invoice as PDF (Customer own or Admin)
 */
router.get('/:orderId/invoice/download', paymentController.downloadInvoice);

/**
 * POST /api/payments/:orderId/invoice/send
 * Send invoice via email (Admin only)
 */
router.post(
  '/:orderId/invoice/send',
  requireRole(UserRole.ADMIN),
  paymentController.sendInvoiceEmail
);

/**
 * GET /api/payments/:orderId/receipt
 * Get payment receipt (Customer own or Admin)
 */
router.get('/:orderId/receipt', paymentController.getPaymentReceipt);

export default router;

/**
 * Webhook handlers exported for use in app.ts
 */
export const stripeWebhookHandler = paymentController.handleStripeWebhook;
export const paypalWebhookHandler = paymentController.handlePaypalWebhook;
export const klarnaWebhookHandler = paymentController.handleKlarnaWebhook;
