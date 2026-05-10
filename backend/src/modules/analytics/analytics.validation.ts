import { z } from 'zod';

// Date range filtering
const dateRangeSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Sales report query
export const salesReportSchema = dateRangeSchema.extend({
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// Product report query
export const productReportSchema = dateRangeSchema.extend({
  categoryId: z.string().uuid().optional(),
  sortBy: z.enum(['revenue', 'units', 'views', 'conversion']).default('revenue'),
  limit: z.string().transform(Number).default('100'),
});

// Customer report query (simple, no complex filters needed)
export const customerReportSchema = z.object({});

// Inventory report query (simple, no complex filters needed)
export const inventoryReportSchema = z.object({});

// Payment report query
export const paymentReportSchema = dateRangeSchema.extend({});

// Export report query
export const exportReportSchema = z.object({
  type: z.enum(['sales', 'products', 'customers', 'inventory', 'payments']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  format: z.enum(['csv', 'json']).default('json'),
});

export type SalesReportQuery = z.infer<typeof salesReportSchema>;
export type ProductReportQuery = z.infer<typeof productReportSchema>;
export type CustomerReportQuery = z.infer<typeof customerReportSchema>;
export type InventoryReportQuery = z.infer<typeof inventoryReportSchema>;
export type PaymentReportQuery = z.infer<typeof paymentReportSchema>;
export type ExportReportQuery = z.infer<typeof exportReportSchema>;
