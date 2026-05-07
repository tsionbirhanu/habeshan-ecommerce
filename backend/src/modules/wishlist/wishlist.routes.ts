import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
} from './wishlist.controller';

/**
 * Wishlist Routes
 * Customer-only endpoints for wishlist management
 */

const router = Router();

/**
 * GET /api/wishlist
 * Get customer's wishlist (protected - CUSTOMER)
 */
router.get('/', authenticateToken, getWishlist);

/**
 * POST /api/wishlist/:productId
 * Add product to wishlist (protected - CUSTOMER)
 */
router.post('/:productId', authenticateToken, addToWishlist);

/**
 * DELETE /api/wishlist/:productId
 * Remove product from wishlist (protected - CUSTOMER)
 */
router.delete('/:productId', authenticateToken, removeFromWishlist);

/**
 * POST /api/wishlist/:productId/move-to-cart
 * Move product from wishlist to cart (protected - CUSTOMER)
 */
router.post('/:productId/move-to-cart', authenticateToken, moveToCart);

export default router;