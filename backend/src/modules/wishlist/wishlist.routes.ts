import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { getWishlist, addToWishlist, removeFromWishlist, moveToCart } from './wishlist.controller';

/**
 * Wishlist Routes
 * Customer-only endpoints for wishlist management
 */

const router = Router();

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get wishlist
 *     tags: [Wishlist]
 *     description: Retrieve the customer's wishlist
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getWishlist);

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   post:
 *     summary: Add to wishlist
 *     tags: [Wishlist]
 *     description: Add a product to the customer's wishlist
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
 *       201:
 *         description: Product added to wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product already in wishlist
 *   delete:
 *     summary: Remove from wishlist
 *     tags: [Wishlist]
 *     description: Remove a product from the customer's wishlist
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
 *         description: Product removed from wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not in wishlist
 */
router.post('/:productId', authenticateToken, addToWishlist);

router.delete('/:productId', authenticateToken, removeFromWishlist);

/**
 * @swagger
 * /api/wishlist/{productId}/move-to-cart:
 *   post:
 *     summary: Move to cart
 *     tags: [Wishlist]
 *     description: Move a product from wishlist to cart
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
 *         description: Product moved to cart
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/:productId/move-to-cart', authenticateToken, moveToCart);

export default router;
