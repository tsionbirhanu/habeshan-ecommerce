import { Response, Request } from 'express';
import { AuthPayload } from '../../types/auth.types';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';
import {
  getCustomerWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  moveProductToCart,
} from './wishlist.service';

interface AuthRequest extends Request {
  user?: AuthPayload | null;
}

/**
 * Get Wishlist
 * GET /api/wishlist
 */
export const getWishlist = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const wishlist = await getCustomerWishlist(userId);

    logger.info(`Retrieved wishlist for user ${userId}`);

    res.json({
      success: true,
      data: wishlist,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Add to Wishlist
 * POST /api/wishlist/:productId
 */
export const addToWishlist = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { productId } = req.params;

    if (!productId) {
      throw new AppError('Product ID is required', 400, 'INVALID_INPUT');
    }

    const wishlist = await addProductToWishlist(userId, productId);

    logger.info(`Added product ${productId} to wishlist for user ${userId}`);

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Remove from Wishlist
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { productId } = req.params;

    if (!productId) {
      throw new AppError('Product ID is required', 400, 'INVALID_INPUT');
    }

    const wishlist = await removeProductFromWishlist(userId, productId);

    logger.info(`Removed product ${productId} from wishlist for user ${userId}`);

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Move to Cart
 * POST /api/wishlist/:productId/move-to-cart
 */
export const moveToCart = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { productId } = req.params;

    if (!productId) {
      throw new AppError('Product ID is required', 400, 'INVALID_INPUT');
    }

    await moveProductToCart(userId, productId);

    logger.info(`Moved product ${productId} from wishlist to cart for user ${userId}`);

    res.json({
      success: true,
      message: 'Moved to cart',
    });
  } catch (error: any) {
    next(error);
  }
};