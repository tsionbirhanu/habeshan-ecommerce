import { z } from 'zod';
import { CouponType } from '@prisma/client';

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Code must be at least 3 characters')
      .max(20, 'Code must not exceed 20 characters')
      .regex(
        /^[A-Z0-9_-]+$/,
        'Code must contain only uppercase letters, numbers, hyphens and underscores'
      )
      .transform((val) => val.toUpperCase()),
    type: z.nativeEnum(CouponType),
    value: z
      .number()
      .positive('Value must be greater than 0')
      .refine((val) => val <= 100, {
        message: 'Percentage value cannot exceed 100%',
      }),
    minOrderValue: z.number().min(0, 'Minimum order value cannot be negative').optional(),
    maxUses: z
      .number()
      .int('Maximum uses must be an integer')
      .positive('Maximum uses must be greater than 0')
      .optional(),
    expiresAt: z.coerce
      .date()
      .refine((date) => date > new Date(), {
        message: 'Expiration date must be in the future',
      })
      .optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // For PERCENTAGE type, validate value <= 100
      if (data.type === CouponType.PERCENTAGE && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: 'Percentage discount cannot exceed 100%',
      path: ['value'],
    }
  );

export const updateCouponSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: 'Expiration date must be in the future',
    })
    .optional(),
  maxUses: z
    .number()
    .int('Maximum uses must be an integer')
    .positive('Maximum uses must be greater than 0')
    .optional(),
});

export const validateCouponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .transform((val) => val.toUpperCase()),
  orderTotal: z.number().positive('Order total must be greater than 0'),
});

export const getCouponListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  type: z.nativeEnum(CouponType).optional(),
  search: z.string().max(50).optional(),
});
