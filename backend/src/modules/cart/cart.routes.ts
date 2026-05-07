import { Router } from 'express';
import * as cartController from './cart.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validation.middleware';
import { UserRole } from '@prisma/client';
import {
  addToCartSchema,
  updateCartItemSchema,
  applyCouponSchema,
} from './cart.validation';

const router = Router();

// All cart routes require CUSTOMER role
router.use(authenticateToken);
router.use(requireRole(UserRole.CUSTOMER));

// GET /api/cart - Get customer's cart
router.get('/', cartController.getCart);

// POST /api/cart/add - Add product to cart
router.post(
  '/add',
  validateBody(addToCartSchema),
  cartController.addToCart
);

// PUT /api/cart/items/:id - Update cart item quantity
router.put(
  '/items/:id',
  validateBody(updateCartItemSchema),
  cartController.updateCartItem
);

// DELETE /api/cart/items/:id - Remove item from cart
router.delete('/items/:id', cartController.removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart);

// POST /api/cart/validate - Validate cart contents
router.post('/validate', cartController.validateCart);

// POST /api/cart/coupon - Apply coupon code
router.post(
  '/coupon',
  validateBody(applyCouponSchema),
  cartController.applyCoupon
);

export default router;
