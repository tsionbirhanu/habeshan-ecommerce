import { z } from 'zod';
import { InventoryAction } from '@prisma/client';

export const getInventorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  lowStockOnly: z.enum(['true', 'false']).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  reorderLevel: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
  action: z.literal('ADJUSTMENT'),
});

export const getInventoryHistorySchema = z.object({
  productId: z.string().uuid().optional(),
  action: z.nativeEnum(InventoryAction).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const reserveStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  orderId: z.string().uuid(),
});

export const releaseReservationSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  orderId: z.string().uuid(),
});

export const deductStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  orderId: z.string().uuid(),
});

export const restoreStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  orderId: z.string().uuid(),
});
