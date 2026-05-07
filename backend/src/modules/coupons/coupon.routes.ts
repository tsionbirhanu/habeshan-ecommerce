import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware';
import * as couponController from './coupon.controller';
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  getCouponListSchema,
} from './coupon.validation';
import { z } from 'zod';

const router = Router();

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Create coupon
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: Admin endpoint to create a new coupon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique coupon code (3-20 chars, uppercase)
 *               type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING]
 *               value:
 *                 type: number
 *                 description: Discount value (% for PERCENTAGE type, amount for FIXED_AMOUNT)
 *               minOrderValue:
 *                 type: number
 *                 description: Minimum order total required to use coupon
 *               maxUses:
 *                 type: integer
 *                 description: Maximum number of times coupon can be used
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Coupon code already exists
 *   get:
 *     summary: List coupons
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: Admin endpoint to list all coupons with filters
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING]
 *     responses:
 *       200:
 *         description: List of coupons with pagination
 */
// Public routes (none - all coupon endpoints require auth)

// ============ ADMIN ROUTES ============
// All admin coupon routes require authentication + ADMIN role
router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  validateBody(createCouponSchema),
  couponController.createCoupon
);

router.get(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  validateQuery(getCouponListSchema),
  couponController.getAllCoupons
);

/**
 * @swagger
 * /api/coupons/code/{code}:
 *   get:
 *     summary: Get coupon by code
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: Get detailed coupon information by code
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon details
 *       404:
 *         description: Coupon not found
 */
router.get(
  '/code/:code',
  authenticateToken,
  requireRole('ADMIN'),
  validateParams(z.object({ code: z.string().min(1) })),
  couponController.getCouponByCode
);

/**
 * @swagger
 * /api/coupons/{id}:
 *   put:
 *     summary: Update coupon
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: Admin endpoint to update coupon (status, expiry, max uses)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               maxUses:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *   delete:
 *     summary: Delete coupon (soft delete)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: Deactivate coupon
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Coupon deactivated successfully
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  validateParams(z.object({ id: z.string().uuid() })),
  couponController.deleteCoupon
);

/**
 * @swagger
 * /api/coupons/stats/overview:
 *   get:
 *     summary: Get coupon statistics
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: Get aggregate coupon statistics
 *     responses:
 *       200:
 *         description: Coupon statistics
 */
router.get(
  '/stats/overview',
  authenticateToken,
  requireRole('ADMIN'),
  couponController.getCouponStats
);

// ============ CUSTOMER ROUTES ============
// Validate coupon at checkout (requires authentication but works for customers)

/**
 * @swagger
 * /api/coupons/validate:
 *   post:
 *     summary: Validate coupon
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: Validate coupon code and calculate discount amount for checkout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Coupon code to validate
 *               orderTotal:
 *                 type: number
 *                 description: Order subtotal for discount calculation
 *     responses:
 *       200:
 *         description: Validation result with discount amount
 *         schema:
 *           type: object
 *           properties:
 *             valid:
 *               type: boolean
 *             discountAmount:
 *               type: number
 *             message:
 *               type: string
 */
router.post(
  '/validate',
  authenticateToken,
  validateBody(validateCouponSchema),
  couponController.validateCoupon
);

export default router;
