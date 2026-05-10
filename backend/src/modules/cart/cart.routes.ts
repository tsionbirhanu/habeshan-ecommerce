import { Router } from 'express';
import * as cartController from './cart.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validation.middleware';
import { UserRole } from '@prisma/client';
import { addToCartSchema, updateCartItemSchema, applyCouponSchema } from './cart.validation';

const router = Router();

// All cart routes require CUSTOMER role
router.use(authenticateToken);
router.use(requireRole(UserRole.CUSTOMER));

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get shopping cart
 *     tags: [Cart]
 *     description: Retrieve the authenticated customer's shopping cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     items:
 *                       type: array
 *                     subtotal:
 *                       type: number
 *                     tax:
 *                       type: number
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     description: Remove all items from the shopping cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
// GET /api/cart - Get customer's cart
router.get('/', cartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     description: Add a product to the customer's shopping cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
// POST /api/cart/add - Add product to cart
router.post('/add', validateBody(addToCartSchema), cartController.addToCart);

/**
 * @swagger
 * /api/cart/items/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     description: Update the quantity of a cart item
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
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *             required:
 *               - quantity
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     description: Remove a product from the shopping cart
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
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
// PUT /api/cart/items/:id - Update cart item quantity
router.put('/items/:id', validateBody(updateCartItemSchema), cartController.updateCartItem);

// DELETE /api/cart/items/:id - Remove item from cart
router.delete('/items/:id', cartController.removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart);

/**
 * @swagger
 * /api/cart/validate:
 *   post:
 *     summary: Validate cart
 *     tags: [Cart]
 *     description: Validate cart contents (check stock, prices, availability)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart validation result
 *       401:
 *         description: Unauthorized
 */
// POST /api/cart/validate - Validate cart contents
router.post('/validate', cartController.validateCart);

/**
 * @swagger
 * /api/cart/coupon:
 *   post:
 *     summary: Apply coupon code
 *     tags: [Cart, Coupons]
 *     description: Apply a discount coupon code to the cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *             required:
 *               - code
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid coupon or validation error
 *       401:
 *         description: Unauthorized
 */
// POST /api/cart/coupon - Apply coupon code
router.post('/coupon', validateBody(applyCouponSchema), cartController.applyCoupon);

export default router;
