import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'VENDOR', 'CUSTOMER', 'DELIVERY']),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().optional(),
});

export const rejectVendorSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export const usersFilterSchema = paginationSchema.extend({
  role: z.enum(['ADMIN', 'VENDOR', 'CUSTOMER', 'DELIVERY']).optional(),
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export const vendorsFilterSchema = paginationSchema.extend({
  isApproved: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export const activityLogSchema = z.object({
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
});

export type UpdateUserRoleDTO = z.infer<typeof updateUserRoleSchema>;
export type ToggleUserStatusDTO = z.infer<typeof toggleUserStatusSchema>;
export type RejectVendorDTO = z.infer<typeof rejectVendorSchema>;
export type UsersFilterDTO = z.infer<typeof usersFilterSchema>;
export type VendorsFilterDTO = z.infer<typeof vendorsFilterSchema>;
export type ActivityLogDTO = z.infer<typeof activityLogSchema>;
