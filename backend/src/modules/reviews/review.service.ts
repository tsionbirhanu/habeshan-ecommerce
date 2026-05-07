import db from '../../database/prisma';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

/**
 * Review Service
 * Handles review operations, rating calculations, and moderation
 */

/**
 * Check if customer has verified purchase of a product
 * Verified purchase = delivered order with the product
 */
export async function hasVerifiedPurchase(
  customerId: string,
  productId: string
): Promise<{ verified: boolean; orderId?: string }> {
  try {
    const orderItem = await db.orderItem.findFirst({
      where: {
        productId,
        order: {
          customerId,
          status: {
            in: ['DELIVERED', 'COMPLETED'],
          },
        },
      },
      include: {
        order: true,
      },
    });

    if (orderItem) {
      return { verified: true, orderId: orderItem.orderId };
    }

    return { verified: false };
  } catch (error: any) {
    logger.error(`Error checking verified purchase: ${error.message}`);
    throw new AppError('Failed to verify purchase', 500, 'VERIFICATION_ERROR');
  }
}

/**
 * Check if customer already reviewed this product
 */
export async function hasExistingReview(customerId: string, productId: string): Promise<boolean> {
  try {
    const existingReview = await db.review.findFirst({
      where: {
        customerId,
        productId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    return !!existingReview;
  } catch (error: any) {
    logger.error(`Error checking existing review: ${error.message}`);
    throw new AppError('Failed to check review status', 500, 'REVIEW_CHECK_ERROR');
  }
}

/**
 * Calculate average rating for a product (APPROVED reviews only)
 */
export async function calculateAverageRating(productId: string): Promise<{
  average: number;
  totalReviews: number;
  distribution: Record<number, number>;
}> {
  try {
    const reviews = await db.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      return {
        average: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calculate distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
      sum += review.rating;
    });

    const average = sum / reviews.length;

    return {
      average: Math.round(average * 100) / 100, // Round to 2 decimals
      totalReviews: reviews.length,
      distribution,
    };
  } catch (error: any) {
    logger.error(`Error calculating average rating: ${error.message}`);
    throw new AppError('Failed to calculate rating', 500, 'RATING_ERROR');
  }
}

/**
 * Update product's average rating
 * Called when reviews are approved/rejected/deleted
 */
export async function updateProductRating(productId: string): Promise<void> {
  try {
    const ratingData = await calculateAverageRating(productId);

    // Update product with new average rating
    // Note: This assumes Product model has averageRating field
    await db.product.update({
      where: { id: productId },
      data: {
        averageRating: ratingData.average,
      },
    });

    logger.info(
      `Updated product ${productId} rating: ${ratingData.average} (${ratingData.totalReviews} reviews)`
    );
  } catch (error: any) {
    logger.error(`Error updating product rating: ${error.message}`);
    throw new AppError('Failed to update product rating', 500, 'RATING_UPDATE_ERROR');
  }
}

/**
 * Check if user has voted helpful on this review
 */
export async function hasVotedHelpful(userId: string, reviewId: string): Promise<boolean> {
  try {
    const vote = await db.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    return !!vote;
  } catch (error: any) {
    logger.error(`Error checking helpful vote: ${error.message}`);
    throw new AppError('Failed to check helpful vote', 500, 'VOTE_CHECK_ERROR');
  }
}

/**
 * Mark review as helpful (create vote)
 */
export async function markHelpful(userId: string, reviewId: string): Promise<void> {
  try {
    // Verify review exists
    const review = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    // Check if already voted
    const alreadyVoted = await hasVotedHelpful(userId, reviewId);
    if (alreadyVoted) {
      throw new AppError('You already marked this review as helpful', 400, 'ALREADY_VOTED');
    }

    // Create vote
    await db.reviewHelpful.create({
      data: {
        reviewId,
        userId,
      },
    });

    // Increment helpfulCount
    await db.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    logger.info(`Review ${reviewId} marked helpful by user ${userId}`);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error marking helpful: ${error.message}`);
    throw new AppError('Failed to mark review as helpful', 500, 'MARK_HELPFUL_ERROR');
  }
}

/**
 * Unmark review as helpful (remove vote)
 */
export async function unmarkHelpful(userId: string, reviewId: string): Promise<void> {
  try {
    // Remove vote
    await db.reviewHelpful.deleteMany({
      where: {
        reviewId,
        userId,
      },
    });

    // Decrement helpfulCount
    await db.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          decrement: 1,
        },
      },
    });

    logger.info(`Review ${reviewId} unmarked helpful by user ${userId}`);
  } catch (error: any) {
    logger.error(`Error unmarking helpful: ${error.message}`);
    throw new AppError('Failed to unmark review as helpful', 500, 'UNMARK_HELPFUL_ERROR');
  }
}

/**
 * Build rating distribution for product
 */
export async function getRatingDistribution(productId: string): Promise<Record<number, number>> {
  try {
    const ratingData = await calculateAverageRating(productId);
    return ratingData.distribution;
  } catch (error: any) {
    logger.error(`Error getting rating distribution: ${error.message}`);
    throw new AppError('Failed to get rating distribution', 500, 'DISTRIBUTION_ERROR');
  }
}
