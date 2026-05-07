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
 * POST /api/reviews
 * Create new review (protected - CUSTOMER)
 */
router.post('/', authenticateToken, createReview);

/**
 * GET /api/reviews/pending
 * Get pending reviews for moderation (protected - ADMIN)
 */
router.get('/pending', authenticateToken, getPendingReviews);

/**
 * PUT /api/reviews/:reviewId
 * Update review (protected - review owner)
 */
router.put('/:reviewId', authenticateToken, updateReview);

/**
 * DELETE /api/reviews/:reviewId
 * Delete review (protected - ADMIN)
 */
router.delete('/:reviewId', authenticateToken, deleteReview);

/**
 * POST /api/reviews/:reviewId/approve
 * Approve review (protected - ADMIN)
 */
router.post('/:reviewId/approve', authenticateToken, approveReview);

/**
 * POST /api/reviews/:reviewId/reject
 * Reject review (protected - ADMIN)
 */
router.post('/:reviewId/reject', authenticateToken, rejectReview);

/**
 * POST /api/reviews/:reviewId/helpful
 * Mark/unmark review as helpful (protected - CUSTOMER)
 * Body: { helpful: true/false }
 */
router.post('/:reviewId/helpful', authenticateToken, markHelpfulToggle);

export default router;