import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
  phone: z.string().trim().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createAddressSchema = z.object({
  street: z.string().min(1, 'Street is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
  country: z.string().trim().default('Germany'),
  label: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  street: z.string().min(1).trim().optional(),
  city: z.string().min(1).trim().optional(),
  postalCode: z.string().min(1).trim().optional(),
  country: z.string().trim().optional(),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type CreateAddressDTO = z.infer<typeof createAddressSchema>;
export type UpdateAddressDTO = z.infer<typeof updateAddressSchema>;
