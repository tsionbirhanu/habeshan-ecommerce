import { z } from 'zod';

// Settings categories schemas
const storeSettingsSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

const shippingSettingsSchema = z.object({
  freeShippingThreshold: z.number().positive().optional(),
  defaultShippingMethod: z.string().optional(),
});

const taxSettingsSchema = z.object({
  foodVatRate: z.number().min(0).max(100).optional(),
  generalVatRate: z.number().min(0).max(100).optional(),
});

const paymentSettingsSchema = z.object({
  enabledMethods: z
    .array(z.enum(['STRIPE', 'PAYPAL', 'KLARNA', 'BANK_TRANSFER', 'CASH_ON_DELIVERY']))
    .optional(),
});

const notificationsSettingsSchema = z.object({
  adminEmail: z.string().email().optional(),
  lowStockAlert: z.boolean().optional(),
});

const seoSettingsSchema = z.object({
  defaultMetaTitle: z.string().optional(),
  defaultMetaDescription: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
});

const socialSettingsSchema = z.object({
  whatsappNumber: z.string().optional(),
  telegramHandle: z.string().optional(),
  instagramUrl: z.string().url().optional(),
  facebookUrl: z.string().url().optional(),
});

// Combined update settings schema
export const updateSettingsSchema = z.object({
  store: storeSettingsSchema.optional(),
  shipping: shippingSettingsSchema.optional(),
  tax: taxSettingsSchema.optional(),
  payment: paymentSettingsSchema.optional(),
  notifications: notificationsSettingsSchema.optional(),
  seo: seoSettingsSchema.optional(),
  social: socialSettingsSchema.optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
