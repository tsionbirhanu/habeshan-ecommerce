import { Request, Response, NextFunction } from 'express';
import { PrismaClient, OrderStatus, PaymentStatus, UserRole } from '@prisma/client';
import * as stripeService from './stripe.service';
import * as paypalService from './paypal.service';
import * as klarnaService from './klarna.service';
import * as invoiceService from './invoice.service';
import * as inventoryService from '../inventory/inventory.service';
import { NotFoundError, ForbiddenError, ValidationError, AppError } from '../../utils/errors';
import logger from '../../utils/logger';
import { sendEmail, generateOrderConfirmationEmail } from '../../utils/email.service';
import { env } from '../../config/environment';

const prisma = new PrismaClient();

/**
 * Create Stripe PaymentIntent for an order
 * Protected - CUSTOMER only (can access own orders)
 */
export const createStripePaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    const customerId = req.user!.userId;

    if (!orderId) {
      throw new ValidationError('orderId is required');
    }

    // Get order and validate it belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenError('This order does not belong to you');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new ValidationError(
        `Order must be in PENDING_PAYMENT status. Current status: ${order.status}`
      );
    }

    if (!order.payment) {
      throw new ValidationError('Payment record not found for this order');
    }

    // Create Stripe PaymentIntent
    const amountInCents = Math.round(Number(order.totalAmount) * 100);
    const paymentIntentResult = await stripeService.createPaymentIntent({
      orderId,
      customerId,
      amount: amountInCents,
      customerEmail: order.customer.email,
    });

    // Update payment record with PaymentIntent ID
    await prisma.payment.update({
      where: { orderId },
      data: {
        transactionId: paymentIntentResult.paymentIntentId,
        providerResponse: {
          clientSecret: paymentIntentResult.clientSecret,
          paymentIntentId: paymentIntentResult.paymentIntentId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: customerId,
        action: 'CREATE_PAYMENT_INTENT',
        entity: 'PAYMENT',
        entityId: order.payment.id,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntentResult.clientSecret,
        paymentIntentId: paymentIntentResult.paymentIntentId,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        amount: paymentIntentResult.amount,
        amountFormatted: (paymentIntentResult.amount / 100).toFixed(2),
        orderId,
      },
      message: 'PaymentIntent created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Stripe webhook events
 * PUBLIC endpoint - NO authentication required
 * CRITICAL: Raw body must be used for signature verification
 */
export const handleStripeWebhook = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'] as string;

    // Get raw body (set up in app.ts middleware)
    const rawBody = req.body;

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(signature, rawBody);

    logger.info(`Received Stripe webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as any);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as any);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as any);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 to Stripe immediately
    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error(`Webhook error: ${error.message}`, error);
    // Return 400 for invalid signatures
    if (error.code === 'STRIPE_SIGNATURE_VERIFICATION_FAILED') {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    // Return 200 anyway to prevent retry
    return res.status(200).json({ received: true, error: error.message });
  }
};

/**
 * Handle payment_intent.succeeded event
 * Update Payment status to COMPLETED
 * Update Order status to CONFIRMED
 * Deduct inventory
 * Queue order confirmation email
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const orderId = paymentIntent.metadata?.orderId;
  const customerId = paymentIntent.metadata?.customerId;

  if (!orderId || !customerId) {
    throw new AppError(
      'Missing orderId or customerId in PaymentIntent metadata',
      400,
      'INVALID_WEBHOOK_METADATA'
    );
  }

  // Find payment record
  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });

  if (!payment) {
    throw new NotFoundError('Payment record not found');
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.COMPLETED,
      transactionId: paymentIntent.id,
      providerResponse: {
        ...(payment.providerResponse as any),
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amountReceived: paymentIntent.amount_received,
        succeededAt: new Date().toISOString(),
      },
    },
  });

  // Get order with items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      customer: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Update order status to CONFIRMED
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
      updatedAt: new Date(),
    },
  });

  // Deduct stock for all order items
  for (const item of order.items) {
    await inventoryService.deductStock(item.productId, item.quantity, orderId);
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: 'SYSTEM',
      action: 'PAYMENT_SUCCEEDED',
      entity: 'PAYMENT',
      entityId: payment.id,
      changes: {
        paymentStatus: 'COMPLETED',
        orderStatus: 'CONFIRMED',
      },
    },
  });

  // Send order confirmation email
  const emailTemplate = generateOrderConfirmationEmail(
    order.customer.firstName,
    order.customer.email,
    orderId,
    Number(order.totalAmount),
    order.items.map((item) => ({
      name: item.productId,
      quantity: item.quantity,
      price: Number(item.unitPrice) / 100,
    }))
  );
  await sendEmail(emailTemplate);

  // Generate invoice automatically
  invoiceService
    .generateInvoice(orderId)
    .then((invoiceData) => {
      logger.info(`Invoice generated: ${invoiceData.invoiceNumber} for order ${orderId}`);
    })
    .catch((err: any) => {
      logger.error(`Failed to generate invoice: ${err.message}`);
    });
}

/**
 * Handle payment_intent.payment_failed event
 * Update Payment status to FAILED
 * Release inventory reservations
 * Queue payment failed email
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    throw new AppError(
      'Missing orderId in PaymentIntent metadata',
      400,
      'INVALID_WEBHOOK_METADATA'
    );
  }

  // Find payment record
  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });

  if (!payment) {
    throw new NotFoundError('Payment record not found');
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
      providerResponse: {
        ...(payment.providerResponse as any),
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        lastPaymentError: paymentIntent.last_payment_error?.message,
        failedAt: new Date().toISOString(),
      },
    },
  });

  // Get order with items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      customer: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Note: Order status remains PENDING_PAYMENT, inventory reservations are kept
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: PaymentStatus.FAILED,
      updatedAt: new Date(),
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: 'SYSTEM',
      action: 'PAYMENT_FAILED',
      entity: 'PAYMENT',
      entityId: payment.id,
      changes: {
        paymentStatus: 'FAILED',
        reason: paymentIntent.last_payment_error?.message,
      },
    },
  });

  logger.error(`Payment failed for order ${orderId}: ${paymentIntent.last_payment_error?.message}`);

  // TODO: Queue payment failed email notification
}

/**
 * Handle charge.refunded event
 * Update Payment status to REFUNDED or PARTIALLY_REFUNDED
 * Update Order status to REFUNDED
 * Restore inventory
 */
async function handleChargeRefunded(charge: any) {
  const paymentIntentId = charge.payment_intent;

  if (!paymentIntentId) {
    throw new AppError('Missing payment_intent in charge object', 400, 'INVALID_WEBHOOK_DATA');
  }

  // Find payment by transactionId (PaymentIntent ID)
  const payment = await prisma.payment.findFirst({
    where: { transactionId: paymentIntentId },
  });

  if (!payment) {
    logger.warn(`Payment not found for PaymentIntent ${paymentIntentId}`);
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    include: {
      items: true,
      customer: {
        select: { id: true, email: true },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Determine refund status
  const chargeRefunded = charge.refunded;
  const amountRefunded = charge.amount_refunded || 0;
  const totalAmount = charge.amount || 0;

  let newPaymentStatus: typeof PaymentStatus.REFUNDED | typeof PaymentStatus.PARTIALLY_REFUNDED =
    PaymentStatus.REFUNDED;
  if (amountRefunded > 0 && amountRefunded < totalAmount) {
    newPaymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
  }

  // Update payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newPaymentStatus,
      refundedAmount: amountRefunded / 100, // Convert from cents
      providerResponse: {
        ...(payment.providerResponse as any),
        chargeId: charge.id,
        refunded: chargeRefunded,
        amountRefunded,
        refundedAt: new Date().toISOString(),
      },
    },
  });

  // Update order status to REFUNDED
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status: OrderStatus.REFUNDED,
      paymentStatus: newPaymentStatus,
      updatedAt: new Date(),
    },
  });

  // Restore inventory for all items
  for (const item of order.items) {
    await inventoryService.restoreStock(item.productId, item.quantity, payment.orderId);
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: 'SYSTEM',
      action: 'PAYMENT_REFUNDED',
      entity: 'PAYMENT',
      entityId: payment.id,
      changes: {
        paymentStatus: newPaymentStatus,
        orderStatus: 'REFUNDED',
        amountRefunded,
      },
    },
  });

  logger.info(`Payment refunded for order ${payment.orderId}: ${newPaymentStatus}`);

  // TODO: Queue refund confirmation email
}

/**
 * Get payment status for an order
 * Protected - CUSTOMER (own order) or ADMIN
 */
export const getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const user = req.user!;

    // Get order first to check permissions
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        customer: {
          select: { id: true, email: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check permissions
    if (user.role === UserRole.CUSTOMER && order.customerId !== user.userId) {
      throw new ForbiddenError('This order does not belong to you');
    }

    if (!order.payment) {
      throw new NotFoundError('Payment not found for this order');
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        method: order.payment.method,
        status: order.payment.status,
        amount: Number(order.payment.amount),
        amountFormatted: Number(order.payment.amount).toFixed(2),
        transactionId: order.payment.transactionId,
        refundedAmount: Number(order.payment.refundedAmount),
        createdAt: order.payment.createdAt,
        updatedAt: order.payment.updatedAt,
        providerResponse: order.payment.providerResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund a payment (Admin only)
 * Protected - ADMIN
 */
export const refundPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    // Get payment
    const payment = await prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            items: true,
            customer: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Check if payment can be refunded
    if (
      payment.status !== PaymentStatus.COMPLETED &&
      payment.status !== PaymentStatus.PARTIALLY_REFUNDED
    ) {
      throw new ValidationError(`Payment cannot be refunded. Current status: ${payment.status}`);
    }

    if (!payment.transactionId) {
      throw new ValidationError('No PaymentIntent ID found for this payment');
    }

    // Check if order is refundable
    const order = payment.order;
    if (
      order.status !== OrderStatus.DELIVERED &&
      order.status !== OrderStatus.COMPLETED &&
      order.status !== OrderStatus.RETURNED
    ) {
      throw new ValidationError(
        `Order must be delivered or returned to refund. Current status: ${order.status}`
      );
    }

    // Calculate refund amount in cents
    const maxRefundableAmount = Number(payment.amount) - Number(payment.refundedAmount);
    const refundAmountInCents = amount
      ? Math.round(amount * 100)
      : Math.round(maxRefundableAmount * 100);

    if (refundAmountInCents <= 0) {
      throw new ValidationError('Refund amount must be greater than 0');
    }

    if (refundAmountInCents > Math.round(maxRefundableAmount * 100)) {
      throw new ValidationError(
        `Refund amount exceeds remaining refundable amount. Max: €${maxRefundableAmount.toFixed(2)}`
      );
    }

    // Call Stripe to refund
    const refundResult = await stripeService.refundPayment(
      payment.transactionId,
      refundAmountInCents,
      reason
    );

    // Update payment record
    const newRefundedTotal = Number(payment.refundedAmount) + refundResult.amount / 100;
    const newPaymentStatus =
      newRefundedTotal >= Number(payment.amount)
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIALLY_REFUNDED;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        refundedAmount: newRefundedTotal,
        providerResponse: {
          ...(payment.providerResponse as any),
          refundId: refundResult.refundId,
          refundedAmount: newRefundedTotal * 100,
          refundedAt: new Date().toISOString(),
        },
      },
    });

    // Update order status if fully refunded
    if (newPaymentStatus === PaymentStatus.REFUNDED) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.REFUNDED,
          paymentStatus: newPaymentStatus,
          updatedAt: new Date(),
        },
      });

      // Restore inventory for all items
      for (const item of order.items) {
        await inventoryService.restoreStock(item.productId, item.quantity, orderId);
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'REFUND_PAYMENT',
        entity: 'PAYMENT',
        entityId: payment.id,
        changes: {
          refundAmount: refundResult.amount / 100,
          newStatus: newPaymentStatus,
          reason,
        },
      },
    });

    logger.info(
      `Payment refunded for order ${orderId}: €${(refundResult.amount / 100).toFixed(2)}`
    );

    // TODO: Queue refund confirmation email

    res.status(200).json({
      success: true,
      data: {
        refundId: refundResult.refundId,
        amount: refundResult.amount / 100,
        amountFormatted: (refundResult.amount / 100).toFixed(2),
        status: refundResult.status,
        paymentStatus: newPaymentStatus,
        totalRefunded: newRefundedTotal,
        totalRefundedFormatted: newRefundedTotal.toFixed(2),
      },
      message: 'Payment refunded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create PayPal Order
 * Protected - CUSTOMER only (own order)
 */
export const createPaypalOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const customerId = req.user!.userId;

    if (!orderId) {
      throw new ValidationError('orderId is required');
    }

    // Get order and validate
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenError('This order does not belong to you');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new ValidationError(
        `Order must be in PENDING_PAYMENT status. Current status: ${order.status}`
      );
    }

    if (!order.payment) {
      throw new ValidationError('Payment record not found');
    }

    // Create PayPal order items
    const paypalItems = order.items.map((item) => ({
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unit_amount: {
        currency_code: 'EUR',
        value: (Number(item.unitPrice) / 100).toFixed(2),
      },
    }));

    // Create PayPal order
    const paypalResult = await paypalService.createOrder({
      orderId,
      customerId,
      amount: Number(order.totalAmount).toFixed(2),
      items: paypalItems,
      customerEmail: order.customer.email,
      returnUrl: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/paypal/return`,
      cancelUrl: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/paypal/cancel`,
    });

    // Update payment with PayPal order ID
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        method: 'PAYPAL',
        transactionId: paypalResult.paypalOrderId,
        providerResponse: {
          paypalOrderId: paypalResult.paypalOrderId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: customerId,
        action: 'CREATE_PAYPAL_ORDER',
        entity: 'PAYMENT',
        entityId: order.payment.id,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        paypalOrderId: paypalResult.paypalOrderId,
        approvalUrl: paypalResult.approvalUrl,
        orderId,
      },
      message: 'PayPal order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Capture PayPal Order
 * Protected - CUSTOMER
 */
export const capturePaypalOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    const customerId = req.user!.userId;

    if (!paypalOrderId || !orderId) {
      throw new ValidationError('paypalOrderId and orderId are required');
    }

    // Get order and validate
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenError('This order does not belong to you');
    }

    if (!order.payment) {
      throw new ValidationError('Payment record not found');
    }

    // Capture PayPal order
    const captureResult = await paypalService.captureOrder(paypalOrderId);

    // Update payment
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: captureResult.captureId,
        providerResponse: {
          ...(order.payment.providerResponse as any),
          captureId: captureResult.captureId,
          status: captureResult.status,
          capturedAt: new Date().toISOString(),
        },
      },
    });

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
        updatedAt: new Date(),
      },
    });

    // Deduct inventory
    for (const item of order.items) {
      await inventoryService.deductStock(item.productId, item.quantity, orderId);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: customerId,
        action: 'PAYPAL_PAYMENT_CAPTURED',
        entity: 'PAYMENT',
        entityId: order.payment.id,
        changes: { paymentStatus: 'COMPLETED', orderStatus: 'CONFIRMED' },
      },
    });

    // Send order confirmation email
    sendEmailAsync(
      generateOrderConfirmationEmail(
        order.customer.firstName,
        order.customer.email,
        orderId,
        Number(order.totalAmount),
        order.items.map((item) => ({
          name: item.id,
          quantity: item.quantity,
          price: Number(item.unitPrice) / 100,
        }))
      )
    );

    logger.info(`PayPal payment captured for order ${orderId}`);

    res.status(200).json({
      success: true,
      data: {
        captureId: captureResult.captureId,
        status: captureResult.status,
        orderId,
      },
      message: 'Payment captured successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle PayPal Webhook
 * PUBLIC - NO authentication
 */
export const handlePaypalWebhook = async (req: Request, res: Response) => {
  try {
    const transmissionId = req.headers['transmission_id'] as string;
    const transmissionTime = req.headers['transmission_time'] as string;
    const certUrl = req.headers['cert_url'] as string;
    const transmissionSig = req.headers['transmission_signature'] as string;
    const webhookBody = JSON.stringify(req.body);

    // Verify signature
    const isValid = await paypalService.verifyWebhookSignature(
      transmissionId,
      transmissionTime,
      certUrl,
      transmissionSig,
      webhookBody
    );

    if (!isValid) {
      logger.warn('Invalid PayPal webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`PayPal webhook event: ${event.event_type}`);

    // Handle events
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaypalCaptureRefunded(event.resource);
        break;
      default:
        logger.info(`Unhandled PayPal event: ${event.event_type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error(`PayPal webhook error: ${error.message}`, error);
    return res.status(200).json({ received: true });
  }
};

async function handlePaypalCaptureRefunded(refund: any) {
  const captureId = refund.id;
  if (!captureId) return;

  const payment = await prisma.payment.findFirst({
    where: { transactionId: captureId },
  });

  if (!payment) return;

  const refundAmount = Number(refund.amount?.value || 0);
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.REFUNDED,
      refundedAmount: refundAmount,
    },
  });
}

/**
 * Create Klarna Session
 * Protected - CUSTOMER
 */
export const createKlarnaSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const customerId = req.user!.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
        payment: true,
      },
    });

    if (!order) throw new NotFoundError('Order not found');
    if (order.customerId !== customerId)
      throw new ForbiddenError('This order does not belong to you');
    if (!order.payment) throw new ValidationError('Payment record not found');

    // Create Klarna cart items
    const klarnaItems = order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      tax_rate: 1900, // 19% VAT
      total_price_including_tax: Number(item.totalPrice),
      total_price_excluding_tax: Math.round((Number(item.totalPrice) / 1.19) * 100),
      total_tax_amount: Math.round(
        (Number(item.totalPrice) - Number(item.totalPrice) / 1.19) * 100
      ),
    }));

    const sessionResult = await klarnaService.createSession({
      orderId,
      customerId,
      amount: Number(order.totalAmount),
      items: klarnaItems,
      customerEmail: order.customer.email,
      customerFirstName: order.customer.firstName,
      customerLastName: order.customer.lastName,
      redirectUrl: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/klarna/confirm`,
    });

    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        method: 'KLARNA',
        transactionId: sessionResult.sessionId,
        providerResponse: {
          sessionId: sessionResult.sessionId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: sessionResult.sessionId,
        clientToken: sessionResult.clientToken,
        redirectUrl: sessionResult.redirectUrl,
        orderId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm Klarna Order
 * Protected - CUSTOMER
 */
export const confirmKlarnaOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, orderId } = req.body;
    const customerId = req.user!.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
        payment: true,
      },
    });

    if (!order) throw new NotFoundError('Order not found');
    if (order.customerId !== customerId)
      throw new ForbiddenError('This order does not belong to you');

    const confirmResult = await klarnaService.confirmOrder(sessionId);

    await prisma.payment.update({
      where: { id: order.payment!.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: confirmResult.klarnaOrderId,
        providerResponse: {
          ...(order.payment!.providerResponse as any),
          klarnaOrderId: confirmResult.klarnaOrderId,
          confirmedAt: new Date().toISOString(),
        },
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
      },
    });

    for (const item of order.items) {
      await inventoryService.deductStock(item.productId, item.quantity, orderId);
    }

    sendEmailAsync(
      generateOrderConfirmationEmail(
        order.customer.firstName,
        order.customer.email,
        orderId,
        Number(order.totalAmount),
        order.items.map((item) => ({
          name: '',
          quantity: item.quantity,
          price: Number(item.unitPrice) / 100,
        }))
      )
    );

    res.status(200).json({
      success: true,
      data: { klarnaOrderId: confirmResult.klarnaOrderId, orderId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Klarna Webhook
 * PUBLIC - NO authentication
 */
export const handleKlarnaWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-klarna-signature'] as string;
    const body = JSON.stringify(req.body);

    const isValid = klarnaService.verifyWebhookSignature(signature, body, env.KLARNA_API_KEY || '');
    if (!isValid) {
      logger.warn('Invalid Klarna webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`Klarna webhook event: ${event.event_type}`);

    switch (event.event_type) {
      case 'order.refunded':
        await handleKlarnaOrderRefunded(event.order_id, event.refund_amount);
        break;
      default:
        logger.info(`Unhandled Klarna event: ${event.event_type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error(`Klarna webhook error: ${error.message}`, error);
    return res.status(200).json({ received: true });
  }
};

async function handleKlarnaOrderRefunded(klarnaOrderId: string, refundAmount: number) {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: klarnaOrderId },
  });

  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.REFUNDED,
      refundedAmount: refundAmount / 100,
    },
  });
}

/**
 * Get available payment methods
 * PUBLIC endpoint
 */
export const getPaymentMethods = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      methods: [
        {
          id: 'stripe',
          name: 'Card Payment (Stripe)',
          description: 'Pay with Visa, Mastercard, or other cards',
          icon: 'credit-card',
          enabled: !!env.STRIPE_SECRET_KEY,
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Fast, safe, and secure payment with PayPal',
          icon: 'paypal',
          enabled: !!env.PAYPAL_CLIENT_ID,
        },
        {
          id: 'klarna',
          name: 'Klarna',
          description: 'Buy now, pay later with Klarna',
          icon: 'klarna',
          enabled: !!env.KLARNA_API_KEY,
        },
      ],
    },
  });
};

/**
 * Get Invoice Data (JSON)
 * Protected - CUSTOMER (own order) or ADMIN
 */
export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Verify access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userRole !== 'ADMIN' && order.customerId !== userId) {
      throw new ForbiddenError('Not authorized to access this invoice');
    }

    const invoiceData = await invoiceService.getInvoiceData(orderId);

    res.status(200).json({
      success: true,
      data: invoiceData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download Invoice PDF
 * Protected - CUSTOMER (own order) or ADMIN
 */
export const downloadInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Verify access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userRole !== 'ADMIN' && order.customerId !== userId) {
      throw new ForbiddenError('Not authorized to download this invoice');
    }

    const invoiceData = await invoiceService.getInvoiceData(orderId);
    const pdfBuffer = await invoiceService.generateInvoicePDF(orderId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payment Receipt (Simpler than invoice)
 * Protected - CUSTOMER (own order) or ADMIN
 */
export const getPaymentReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Verify access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userRole !== 'ADMIN' && order.customerId !== userId) {
      throw new ForbiddenError('Not authorized to access this receipt');
    }

    const receipt = await invoiceService.getPaymentReceipt(orderId);

    res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send Invoice Email (Admin only)
 * Protected - ADMIN only
 */
export const sendInvoiceEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;

    if (req.user!.role !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can send invoices');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        customer: {
          select: { email: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await invoiceService.sendInvoiceEmail(orderId, order.customer.email);

    res.status(200).json({
      success: true,
      message: 'Invoice email sent successfully',
    });
  } catch (error) {
    next(error);
  }
};
