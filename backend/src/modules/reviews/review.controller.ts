import { Response, Request } from 'express';
import { AuthPayload } from '../../types/auth.types';
import db from '../../database/prisma';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';
import {
  hasVerifiedPurchase,
  hasExistingReview,
  calculateAverageRating,
  updateProductRating,
  hasVotedHelpful,
  markHelpful,
  unmarkHelpful,
} from './review.service';
import {
  sendReviewSubmittedEmail,
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
} from '../notifications/email.service';

interface AuthRequest extends Request {
  user?: AuthPayload | null;
}

/**
 * Create Review
 * POST /api/reviews
 * Customer endpoint - requires verified purchase
 */
export const createReview = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { productId, rating, title, content } = req.body;

    // Validation
    if (!productId || !rating || !title || !content) {
      throw new AppError(
        'Missing required fields: productId, rating, title, content',
        400,
        'INVALID_INPUT'
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new AppError('Rating must be an integer between 1 and 5', 400, 'INVALID_RATING');
    }

    if (content.length > 1000) {
      throw new AppError('Content cannot exceed 1000 characters', 400, 'CONTENT_TOO_LONG');
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check for verified purchase
    const purchase = await hasVerifiedPurchase(userId, productId);
    if (!purchase.verified) {
      throw new AppError(
        'You can only review products you have purchased and received',
        400,
        'NO_VERIFIED_PURCHASE'
      );
    }

    // Check for existing review
    const existingReview = await hasExistingReview(userId, productId);
    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400, 'REVIEW_ALREADY_EXISTS');
    }

    // Get user details for notification
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    // Create review
    const review = await db.review.create({
      data: {
        productId,
        customerId: userId,
        orderId: purchase.orderId!,
        rating,
        title,
        content,
        isVerifiedPurchase: true,
        status: 'PENDING',
      },
      include: {
        product: {
          select: { name: true },
        },
        customer: {
          select: { firstName: true },
        },
      },
    });

    logger.info(`Review created: ${review.id} for product ${productId} by user ${userId}`);

    // Queue notification email to customer (review submitted)
    if (user?.email) {
      try {
        await sendReviewSubmittedEmail({
          email: user.email,
          firstName: user.firstName || 'Customer',
          productName: review.product.name,
          reviewId: review.id,
        });
      } catch (error) {
        logger.warn(`Failed to send review submission notification: ${error}`);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted for moderation',
      data: {
        reviewId: review.id,
        status: review.status,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get Product Reviews (Public)
 * GET /api/products/:productId/reviews
 */
export const getProductReviews = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'helpful') {
      orderBy = { helpfulCount: 'desc' };
    } else if (sort === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'lowest') {
      orderBy = { rating: 'asc' };
    }

    // Fetch approved reviews only
    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: {
          productId,
          status: 'APPROVED',
        },
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          isVerifiedPurchase: true,
          helpfulCount: true,
          createdAt: true,
          customer: {
            select: {
              firstName: true,
            },
          },
        },
      }),
      db.review.count({
        where: {
          productId,
          status: 'APPROVED',
        },
      }),
    ]);

    // Calculate rating distribution and average
    const ratingData = await calculateAverageRating(productId);

    const totalPages = Math.ceil(total / limitNum);

    logger.info(`Fetched ${reviews.length} reviews for product ${productId}`);

    res.json({
      success: true,
      data: {
        reviews: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isVerifiedPurchase: review.isVerifiedPurchase,
          helpfulCount: review.helpfulCount,
          customerName: review.customer.firstName,
          createdAt: review.createdAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        statistics: {
          averageRating: ratingData.average,
          totalReviews: ratingData.totalReviews,
          ratingDistribution: ratingData.distribution,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get Pending Reviews (Admin)
 * GET /api/reviews/pending
 */
export const getPendingReviews = async (req: AuthRequest, res: Response, next: any) => {
  try {
    // Check admin role
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized - Admin only', 403, 'FORBIDDEN');
    }

    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: {
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'asc', // Oldest first
        },
        skip,
        take: limitNum,
        include: {
          product: {
            select: { id: true, name: true },
          },
          customer: {
            select: { id: true, firstName: true, email: true },
          },
        },
      }),
      db.review.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    logger.info(`Fetched ${reviews.length} pending reviews for moderation`);

    res.json({
      success: true,
      data: {
        reviews: reviews.map((review) => ({
          id: review.id,
          productId: review.product.id,
          productName: review.product.name,
          customerId: review.customer.id,
          customerName: review.customer.firstName,
          customerEmail: review.customer.email,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isVerifiedPurchase: review.isVerifiedPurchase,
          createdAt: review.createdAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Approve Review (Admin)
 * POST /api/reviews/:reviewId/approve
 */
export const approveReview = async (req: AuthRequest, res: Response, next: any) => {
  try {
    // Check admin role
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized - Admin only', 403, 'FORBIDDEN');
    }

    const { reviewId } = req.params;

    // Find review
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        product: true,
        customer: true,
      },
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    // Update review status
    const updated = await db.review.update({
      where: { id: reviewId },
      data: {
        status: 'APPROVED',
      },
      include: {
        product: true,
        customer: true,
      },
    });

    // Recalculate product rating
    await updateProductRating(review.productId);

    logger.info(`Review ${reviewId} approved by admin`);

    // Queue approval notification to customer
    try {
      await sendReviewApprovedEmail({
        email: updated.customer.email,
        firstName: updated.customer.firstName || 'Customer',
        productName: updated.product.name,
        reviewId: updated.id,
      });
    } catch (error) {
      logger.warn(`Failed to send review approval notification: ${error}`);
    }

    res.json({
      success: true,
      message: 'Review approved',
      data: {
        id: updated.id,
        status: updated.status,
        productName: updated.product.name,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Reject Review (Admin)
 * POST /api/reviews/:reviewId/reject
 */
export const rejectReview = async (req: AuthRequest, res: Response, next: any) => {
  try {
    // Check admin role
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized - Admin only', 403, 'FORBIDDEN');
    }

    const { reviewId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      throw new AppError('Rejection reason is required', 400, 'INVALID_INPUT');
    }

    // Find review
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        product: true,
        customer: true,
      },
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    // Update review status
    const updated = await db.review.update({
      where: { id: reviewId },
      data: {
        status: 'REJECTED',
      },
    });

    logger.info(`Review ${reviewId} rejected by admin. Reason: ${reason}`);

    // Queue rejection notification to customer
    try {
      await sendReviewRejectedEmail({
        email: review.customer.email,
        firstName: review.customer.firstName || 'Customer',
        productName: review.product.name,
        reason,
      });
    } catch (error) {
      logger.warn(`Failed to send review rejection notification: ${error}`);
    }

    res.json({
      success: true,
      message: 'Review rejected',
      data: {
        id: updated.id,
        status: updated.status,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete Review (Admin)
 * DELETE /api/reviews/:reviewId
 */
export const deleteReview = async (req: AuthRequest, res: Response, next: any) => {
  try {
    // Check admin role
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized - Admin only', 403, 'FORBIDDEN');
    }

    const { reviewId } = req.params;

    // Find review
    const review = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    const productId = review.productId;

    // Delete review (cascades to ReviewHelpful)
    await db.review.delete({
      where: { id: reviewId },
    });

    // Recalculate product rating
    await updateProductRating(productId);

    logger.info(`Review ${reviewId} deleted by admin`);

    res.json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update Review
 * PUT /api/reviews/:reviewId
 * Review owner only
 */
export const updateReview = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { reviewId } = req.params;
    const { rating, title, content } = req.body;

    // Find review
    const review = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    // Verify ownership
    if (review.customerId !== userId) {
      throw new AppError('You can only edit your own reviews', 403, 'FORBIDDEN');
    }

    // Validation
    if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      throw new AppError('Rating must be an integer between 1 and 5', 400, 'INVALID_RATING');
    }

    if (content && content.length > 1000) {
      throw new AppError('Content cannot exceed 1000 characters', 400, 'CONTENT_TOO_LONG');
    }

    // Update review and reset to PENDING for re-approval
    const updated = await db.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || review.rating,
        title: title || review.title,
        content: content || review.content,
        status: 'PENDING', // Reset for re-approval
      },
      include: {
        product: true,
      },
    });

    logger.info(`Review ${reviewId} updated by customer ${userId}. Status reset to PENDING`);

    res.json({
      success: true,
      message: 'Review updated and submitted for re-approval',
      data: {
        id: updated.id,
        status: updated.status,
        productName: updated.product.name,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Mark Review Helpful (Toggle)
 * POST /api/reviews/:reviewId/helpful
 */
export const markHelpfulToggle = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { reviewId } = req.params;
    const { helpful = true } = req.body;

    // Check if already voted
    const hasVoted = await hasVotedHelpful(userId, reviewId);

    if (helpful && !hasVoted) {
      // Mark as helpful
      await markHelpful(userId, reviewId);
      res.json({
        success: true,
        message: 'Review marked as helpful',
        data: { marked: true },
      });
    } else if (!helpful && hasVoted) {
      // Unmark as helpful
      await unmarkHelpful(userId, reviewId);
      res.json({
        success: true,
        message: 'Review unmarked as helpful',
        data: { marked: false },
      });
    } else {
      // Already in desired state
      res.json({
        success: true,
        message: hasVoted ? 'Already marked as helpful' : 'Not marked as helpful',
        data: { marked: hasVoted },
      });
    }
  } catch (error: any) {
    next(error);
  }
};
