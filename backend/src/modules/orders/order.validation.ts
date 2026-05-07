import { z } from 'zod';
import { OrderStatus, ShipmentMethod } from '@prisma/client';

export const createOrderSchema = z.object({
  deliveryAddressId: z.string().uuid('Invalid delivery address ID'),
  billingAddressId: z.string().uuid('Invalid billing address ID').optional(),
  shippingMethod: z.nativeEnum(ShipmentMethod, {
    errorMap: () => ({ message: 'Invalid shipping method' }),
  }),
  couponCode: z.string().min(1, 'Coupon code cannot be empty').max(20, 'Coupon code too long').optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const addOrderNoteSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty').max(1000, 'Note too long'),
});

export const getOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.coerce.number().positive('Minimum amount must be positive').optional(),
  search: z.string().max(100).optional(),
});

export const getMyOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
});
