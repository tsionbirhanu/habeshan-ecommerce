import { stripe, stripeWebhookSecret } from '../../config/stripe';
import { AppError } from '../../utils/errors';
// import Stripe from 'stripe'; // Using 'any' type for Event for now

export interface CreatePaymentIntentData {
  orderId: string;
  customerId: string;
  amount: number; // in cents
  customerEmail: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  status: string;
}

export interface RefundResult {
  refundId: string;
  amount: number;
  status: string;
  reason?: string;
}

/**
 * Create a Stripe PaymentIntent for an order
 * Amount should be in cents (e.g., 1000 for €10.00)
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentData
): Promise<PaymentIntentResult> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount), // Ensure amount is in cents
      currency: 'eur',
      receipt_email: data.customerEmail,
      metadata: {
        orderId: data.orderId,
        customerId: data.customerId,
      },
      description: `Payment for order ${data.orderId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret || '',
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to create payment intent: ${error.message}`,
      400,
      'STRIPE_PAYMENT_INTENT_ERROR'
    );
  }
};

/**
 * Verify and fetch a PaymentIntent's current status
 */
export const verifyPaymentIntent = async (
  paymentIntentId: string
): Promise<{
  status: string;
  amount: number;
  amountReceived: number;
  amountCapturable: number;
  orderId: string;
  customerId: string;
}> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      amountReceived: paymentIntent.amount_received,
      amountCapturable: paymentIntent.amount_capturable,
      orderId: paymentIntent.metadata?.orderId || '',
      customerId: paymentIntent.metadata?.customerId || '',
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to verify payment intent: ${error.message}`,
      400,
      'STRIPE_VERIFICATION_ERROR'
    );
  }
};

/**
 * Refund a payment (full or partial)
 * Amount in cents. If not provided, refunds full amount
 */
export const refundPayment = async (
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<RefundResult> => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount) : undefined,
      reason: (reason as any) || undefined,
      metadata: {
        reason: reason || 'No reason provided',
      },
    });

    return {
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status || 'succeeded',
      reason: reason || 'No reason provided',
    };
  } catch (error: any) {
    throw new AppError(`Failed to refund payment: ${error.message}`, 400, 'STRIPE_REFUND_ERROR');
  }
};

/**
 * Verify Stripe webhook signature using raw body
 * IMPORTANT: Use raw body (not JSON parsed) for signature verification
 */
export const verifyWebhookSignature = (signature: string, rawBody: Buffer | string): any => {
  try {
    // Ensure signature header exists
    if (!signature) {
      throw new AppError('Missing Stripe signature header', 401, 'STRIPE_SIGNATURE_MISSING');
    }

    // Convert string to Buffer if needed
    const body = typeof rawBody === 'string' ? Buffer.from(rawBody) : rawBody;

    // Verify signature and construct event
    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);

    return event;
  } catch (error: any) {
    throw new AppError(
      `Webhook signature verification failed: ${error.message}`,
      401,
      'STRIPE_SIGNATURE_VERIFICATION_FAILED'
    );
  }
};
