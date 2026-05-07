import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive').max(999, 'Quantity cannot exceed 999'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(999, 'Quantity cannot exceed 999'),
});

export const applyCouponSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required').max(20, 'Coupon code too long'),
  orderTotal: z.number().positive('Order total must be positive'),
});

export const validateCartSchema = z.object({
  // No body required for cart validation
}).optional();
