import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0').optional(),
  reason: z
    .enum(['duplicate', 'fraudulent', 'requested_by_customer', 'other'], {
      errorMap: () => ({ message: 'Invalid refund reason' }),
    })
    .optional(),
});

export const createPaypalOrderSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
});

export const capturePaypalOrderSchema = z.object({
  paypalOrderId: z.string().min(1, 'PayPal Order ID required'),
  orderId: z.string().uuid('Invalid order ID format'),
});

export const createKlarnaSessionSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
});

export const confirmKlarnaOrderSchema = z.object({
  sessionId: z.string().min(1, 'Session ID required'),
  orderId: z.string().uuid('Invalid order ID format'),
});
