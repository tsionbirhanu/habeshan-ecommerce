import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  createReview,
  getPendingReviews,
  approveReview,
  rejectReview,
  deleteReview,
  updateReview,
  markHelpfulToggle,
} from './review.controller';

/**
 * Review Routes
 * Endpoints for review creation, management, and moderation
 */

const router = Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create review
 *     tags: [Reviews]
 *     description: Create a new product review (Customer only)
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *             required:
 *               - productId
 *               - rating
 *               - title
 *               - comment
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
router.post('/', authenticateToken, createReview);

/**
 * @swagger
 * /api/reviews/pending:
 *   get:
 *     summary: Get pending reviews
 *     tags: [Reviews]
 *     description: Get reviews pending moderation (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pending reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/pending', authenticateToken, getPendingReviews);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Update review
 *     tags: [Reviews]
 *     description: Update a product review (review owner only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
 *     description: Delete a product review (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Review not found
 */
router.put('/:reviewId', authenticateToken, updateReview);

router.delete('/:reviewId', authenticateToken, deleteReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/approve:
 *   post:
 *     summary: Approve review
 *     tags: [Reviews]
 *     description: Approve a pending review for publishing (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Review not found
 */
router.post('/:reviewId/approve', authenticateToken, approveReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/reject:
 *   post:
 *     summary: Reject review
 *     tags: [Reviews]
 *     description: Reject a pending review (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Review not found
 */
router.post('/:reviewId/reject', authenticateToken, rejectReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/helpful:
 *   post:
 *     summary: Mark review as helpful
 *     tags: [Reviews]
 *     description: Mark or unmark a review as helpful
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               helpful:
 *                 type: boolean
 *             required:
 *               - helpful
 *     responses:
 *       200:
 *         description: Review helpful status updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.post('/:reviewId/helpful', authenticateToken, markHelpfulToggle);

export default router;
