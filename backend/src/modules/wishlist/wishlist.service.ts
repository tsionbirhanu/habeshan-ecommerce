import db from '../../database/prisma';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

/**
 * Get customer's wishlist with product details
 */
export async function getCustomerWishlist(customerId: string) {
  try {
    const wishlist = await db.wishlist.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                originalPrice: true,
                images: true,
                thumbnailUrl: true,
                stockQuantity: true,
                status: true,
                slug: true,
              },
            },
          },
          orderBy: {
            addedAt: 'desc',
          },
        },
      },
    });

    if (!wishlist) {
      // Create wishlist if it doesn't exist
      const newWishlist = await db.wishlist.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  originalPrice: true,
                  images: true,
                  thumbnailUrl: true,
                  stockQuantity: true,
                  status: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
      return formatWishlist(newWishlist);
    }

    return formatWishlist(wishlist);
  } catch (error: any) {
    logger.error(`Error getting wishlist: ${error.message}`);
    throw new AppError('Failed to get wishlist', 500, 'WISHLIST_ERROR');
  }
}

/**
 * Add product to wishlist
 */
export async function addProductToWishlist(customerId: string, productId: string) {
  try {
    // Check if product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.status !== 'ACTIVE') {
      throw new AppError('Product is not available', 400, 'PRODUCT_UNAVAILABLE');
    }

    // Get or create wishlist
    let wishlist = await db.wishlist.findUnique({
      where: { customerId },
    });

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { customerId },
      });
    }

    // Check if product already in wishlist
    const existingItem = await db.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (existingItem) {
      throw new AppError('Product already in wishlist', 400, 'ALREADY_IN_WISHLIST');
    }

    // Add to wishlist
    await db.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    // Return updated wishlist
    return getCustomerWishlist(customerId);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error adding to wishlist: ${error.message}`);
    throw new AppError('Failed to add to wishlist', 500, 'WISHLIST_ADD_ERROR');
  }
}

/**
 * Remove product from wishlist
 */
export async function removeProductFromWishlist(customerId: string, productId: string) {
  try {
    const wishlist = await db.wishlist.findUnique({
      where: { customerId },
    });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404, 'WISHLIST_NOT_FOUND');
    }

    // Remove item
    const deleted = await db.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (deleted.count === 0) {
      throw new AppError('Product not in wishlist', 404, 'PRODUCT_NOT_IN_WISHLIST');
    }

    // Return updated wishlist
    return getCustomerWishlist(customerId);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error removing from wishlist: ${error.message}`);
    throw new AppError('Failed to remove from wishlist', 500, 'WISHLIST_REMOVE_ERROR');
  }
}

/**
 * Move product from wishlist to cart
 */
export async function moveProductToCart(customerId: string, productId: string) {
  try {
    // Check if product exists and is in stock
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.status !== 'ACTIVE') {
      throw new AppError('Product is not available', 400, 'PRODUCT_UNAVAILABLE');
    }

    if (product.stockQuantity <= 0) {
      throw new AppError('Product is out of stock', 400, 'OUT_OF_STOCK');
    }

    // Check if product is in wishlist
    const wishlist = await db.wishlist.findUnique({
      where: { customerId },
    });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404, 'WISHLIST_NOT_FOUND');
    }

    const wishlistItem = await db.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (!wishlistItem) {
      throw new AppError('Product not in wishlist', 404, 'PRODUCT_NOT_IN_WISHLIST');
    }

    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { customerId },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { customerId },
      });
    }

    // Check if product already in cart
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingCartItem) {
      // Update quantity
      await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + 1,
        },
      });
    } else {
      // Add to cart
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: 1,
          priceAtAdd: product.price,
        },
      });
    }

    // Remove from wishlist
    await db.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    logger.info(`Moved product ${productId} from wishlist to cart for customer ${customerId}`);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error moving to cart: ${error.message}`);
    throw new AppError('Failed to move to cart', 500, 'MOVE_TO_CART_ERROR');
  }
}

/**
 * Format wishlist response
 */
function formatWishlist(wishlist: any) {
  return {
    id: wishlist.id,
    itemCount: wishlist.items.length,
    items: wishlist.items.map((item: any) => ({
      id: item.id,
      addedAt: item.addedAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        originalPrice: item.product.originalPrice,
        image: item.product.thumbnailUrl || item.product.images[0] || null,
        stockQuantity: item.product.stockQuantity,
        inStock: item.product.stockQuantity > 0 && item.product.status === 'ACTIVE',
        slug: item.product.slug,
      },
    })),
  };
}