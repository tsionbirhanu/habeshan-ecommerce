import { z } from 'zod';

/**
 * Wishlist Validation Schemas
 */

export const productIdParamSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
});

export const addToWishlistSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
});