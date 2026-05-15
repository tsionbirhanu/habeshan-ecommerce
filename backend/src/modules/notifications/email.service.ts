import { promises as fs } from 'fs';
import path from 'path';
import emailQueue, { isRedisAvailable } from '../../config/queue';
import logger from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { EmailJobData } from '../../jobs/email.job';
import { sendEmail } from '../../utils/email.service';

/**
 * Email Service
 * Loads HTML templates and queues email jobs
 * All functions return job ID or throw AppError
 */

interface TemplateData {
  [key: string]: string | number | any;
}

// Cache for loaded templates
const templateCache: Map<string, string> = new Map();

/**
 * Load HTML template from file
 * Implements caching to avoid reading files repeatedly
 */
async function loadTemplate(templateName: string): Promise<string> {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);

  try {
    const content = await fs.readFile(templatePath, 'utf-8');
    templateCache.set(templateName, content);
    return content;
  } catch (error) {
    throw new AppError(`Email template not found: ${templateName}`, 500, 'TEMPLATE_NOT_FOUND');
  }
}

/**
 * Replace template variables
 * {{variableName}} → value
 */
function replaceVariables(template: string, data: TemplateData): string {
  let html = template;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, String(value));
  });

  // Ensure all variables are replaced (warn about unused variables)
  const unreplacedVars = html.match(/{{[^}]+}}/g);
  if (unreplacedVars) {
    logger.warn(`Unreplaced variables in template: ${unreplacedVars.join(', ')}`);
  }

  return html;
}

/**
 * Queue email job
 * Common function used by all email sending functions
 * Falls back to direct Resend API sending if Redis/Bull is unavailable
 */
async function queueEmail(
  to: string,
  subject: string,
  html: string,
  templateId?: string,
  data?: TemplateData,
  attachments?: EmailJobData['attachments']
): Promise<string> {
  // If Redis/Bull is available, use the queue
  if (emailQueue && isRedisAvailable) {
    try {
      const jobData: EmailJobData = {
        to,
        subject,
        html,
        templateId,
        data,
        attachments,
      };

      const job = await emailQueue.add(jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      logger.info(`Email queued: ${to} | Template: ${templateId} | Job ID: ${job.id}`);
      return job.id.toString();
    } catch (error: any) {
      logger.warn(`Failed to queue email via Bull, falling back to direct send: ${error.message}`);
    }
  }

  // Fallback: Send email directly via Resend API if queue is unavailable
  try {
    logger.info(
      `[DIRECT SEND] Sending email directly via Resend API: ${to} | Template: ${templateId}`
    );
    const success = await sendEmail({ to, subject, html });

    if (success) {
      logger.info(`✓ Email sent directly via Resend API: ${to}`);
      return 'direct-send-' + Date.now();
    } else {
      throw new Error('Direct email send failed');
    }
  } catch (error: any) {
    logger.error(`Failed to send email directly: ${error.message}`);
    throw new AppError(`Failed to send email to ${to}`, 500, 'EMAIL_SEND_ERROR');
  }
}

/**
 * WELCOME EMAIL
 * Sent when user registers
 */
export async function sendWelcomeEmail(user: {
  email: string;
  firstName: string;
}): Promise<string> {
  const template = await loadTemplate('welcome');
  const html = replaceVariables(template, {
    firstName: user.firstName,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(user.email, 'Welcome to Habeshan Mini Market!', html, 'welcome', {
    firstName: user.firstName,
  });
}

/**
 * VENDOR REGISTRATION PENDING EMAIL
 * Sent when vendor application is submitted
 */
export async function sendVendorRegistrationEmail(vendor: {
  email: string;
  firstName: string;
}): Promise<string> {
  const template = await loadTemplate('vendor-pending');
  const html = replaceVariables(template, {
    firstName: vendor.firstName,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(
    vendor.email,
    'Your Vendor Application is Under Review',
    html,
    'vendor-pending',
    { firstName: vendor.firstName }
  );
}

/**
 * VENDOR APPROVED EMAIL
 * Sent when vendor application is approved
 */
export async function sendVendorApprovedEmail(vendor: {
  email: string;
  firstName: string;
}): Promise<string> {
  const template = await loadTemplate('vendor-approved');
  const html = replaceVariables(template, {
    firstName: vendor.firstName,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(vendor.email, '🎉 Your Vendor Account is Approved!', html, 'vendor-approved', {
    firstName: vendor.firstName,
  });
}

/**
 * VENDOR REJECTED EMAIL
 * Sent when vendor application is rejected
 */
export async function sendVendorRejectedEmail(vendor: {
  email: string;
  firstName: string;
  applicationDate: string;
  rejectionReason: string;
}): Promise<string> {
  const template = await loadTemplate('vendor-rejected');
  const html = replaceVariables(template, {
    firstName: vendor.firstName,
    applicationDate: vendor.applicationDate,
    rejectionReason: vendor.rejectionReason,
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(vendor.email, 'Vendor Application Review', html, 'vendor-rejected', {
    firstName: vendor.firstName,
  });
}

/**
 * ORDER CONFIRMATION EMAIL
 * Sent when order is created
 */
export async function sendOrderConfirmationEmail(order: {
  email: string;
  firstName: string;
  orderId: string;
  orderDate: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}): Promise<string> {
  const template = await loadTemplate('order-confirmation');

  // Build items table HTML
  const itemsTable = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border: 1px solid #bdc3c7;">${item.name}</td>
      <td style="padding: 10px; text-align: center; border: 1px solid #bdc3c7;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right; border: 1px solid #bdc3c7;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  const html = replaceVariables(template, {
    firstName: order.firstName,
    orderId: order.orderId,
    orderDate: order.orderDate,
    totalAmount: order.totalAmount.toFixed(2),
    itemsTable,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(
    order.email,
    `Order Confirmed - #${order.orderId}`,
    html,
    'order-confirmation',
    { orderId: order.orderId, totalAmount: order.totalAmount }
  );
}

/**
 * PAYMENT CONFIRMED EMAIL
 * Sent when payment is received
 */
export async function sendPaymentConfirmedEmail(payment: {
  email: string;
  firstName: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
}): Promise<string> {
  const template = await loadTemplate('payment-confirmed');
  const html = replaceVariables(template, {
    firstName: payment.firstName,
    orderId: payment.orderId,
    amount: payment.amount.toFixed(2),
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(
    payment.email,
    `Payment Confirmed - #${payment.orderId}`,
    html,
    'payment-confirmed',
    { orderId: payment.orderId, amount: payment.amount }
  );
}

/**
 * SHIPMENT EMAIL
 * Sent when order is shipped
 */
export async function sendShipmentEmail(shipment: {
  email: string;
  firstName: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
}): Promise<string> {
  const template = await loadTemplate('shipment');
  const html = replaceVariables(template, {
    firstName: shipment.firstName,
    orderId: shipment.orderId,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    trackingUrl: shipment.trackingUrl,
    estimatedDelivery: shipment.estimatedDelivery,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(
    shipment.email,
    `Your Order is On the Way - #${shipment.orderId}`,
    html,
    'shipment',
    { orderId: shipment.orderId, trackingNumber: shipment.trackingNumber }
  );
}

/**
 * DELIVERY CONFIRMATION EMAIL
 * Sent when order is delivered
 */
export async function sendDeliveryConfirmationEmail(delivery: {
  email: string;
  firstName: string;
  orderId: string;
  deliveryDate: string;
  deliveryAddress: string;
}): Promise<string> {
  const template = await loadTemplate('delivery');
  const html = replaceVariables(template, {
    firstName: delivery.firstName,
    orderId: delivery.orderId,
    deliveryDate: delivery.deliveryDate,
    deliveryAddress: delivery.deliveryAddress,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(
    delivery.email,
    `Your Order has been Delivered! - #${delivery.orderId}`,
    html,
    'delivery',
    { orderId: delivery.orderId }
  );
}

/**
 * PASSWORD RESET EMAIL
 * Sent when user requests password reset
 */
export async function sendPasswordResetEmail(reset: {
  email: string;
  firstName: string;
  resetLink: string;
  expiresIn: string;
}): Promise<string> {
  const template = await loadTemplate('password-reset');
  const html = replaceVariables(template, {
    firstName: reset.firstName,
    resetLink: reset.resetLink,
    expiresIn: reset.expiresIn,
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(reset.email, 'Reset Your Password', html, 'password-reset', {
    firstName: reset.firstName,
  });
}

/**
 * REFUND PROCESSED EMAIL
 * Sent when refund is approved and processed
 */
export async function sendRefundProcessedEmail(refund: {
  email: string;
  firstName: string;
  orderId: string;
  refundAmount: number;
  refundReason: string;
  refundDate: string;
  paymentMethod: string;
}): Promise<string> {
  const template = await loadTemplate('refund');
  const html = replaceVariables(template, {
    firstName: refund.firstName,
    orderId: refund.orderId,
    refundAmount: refund.refundAmount.toFixed(2),
    refundReason: refund.refundReason,
    refundDate: refund.refundDate,
    paymentMethod: refund.paymentMethod,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(refund.email, `Refund Processed - #${refund.orderId}`, html, 'refund', {
    orderId: refund.orderId,
    refundAmount: refund.refundAmount,
  });
}

/**
 * ORDER CANCELLED EMAIL
 * Sent when order is cancelled
 */
export async function sendOrderCancelledEmail(order: {
  email: string;
  firstName: string;
  orderId: string;
  cancellationDate: string;
  cancellationReason: string;
}): Promise<string> {
  const template = await loadTemplate('cancelled');
  const html = replaceVariables(template, {
    firstName: order.firstName,
    orderId: order.orderId,
    cancellationDate: order.cancellationDate,
    cancellationReason: order.cancellationReason,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(order.email, `Order Cancelled - #${order.orderId}`, html, 'cancelled', {
    orderId: order.orderId,
  });
}

/**
 * LOW STOCK ALERT EMAIL
 * Sent to admin/vendor when inventory is low
 */
export async function sendLowStockAlertEmail(alert: {
  email: string; // Admin or vendor email
  lowStockItems: Array<{
    name: string;
    sku: string;
    currentStock: number;
    minThreshold: number;
  }>;
}): Promise<string> {
  const template = await loadTemplate('low-stock-alert');

  // Build low stock items list
  const lowStockItems = alert.lowStockItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #bdc3c7;"><strong>${item.name}</strong></td>
        <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">${item.sku}</td>
        <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; color: #e74c3c;"><strong>${item.currentStock}</strong></td>
        <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">${item.minThreshold}</td>
      </tr>
      `
    )
    .join('');

  const itemsListHtml = `
    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
      <thead>
        <tr style="background-color: #fff3cd;">
          <th style="padding: 8px; text-align: left; border: 1px solid #bdc3c7;">Product</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #bdc3c7;">SKU</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #bdc3c7;">Current Stock</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #bdc3c7;">Min Threshold</th>
        </tr>
      </thead>
      <tbody>
        ${lowStockItems}
      </tbody>
    </table>
  `;

  const html = replaceVariables(template, {
    lowStockItems: itemsListHtml,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(alert.email, `⚠️ Low Stock Alert - Action Required`, html, 'low-stock-alert');
}

/**
 * REVIEW SUBMITTED EMAIL (to customer)
 * Sent when customer submits a review (confirmation)
 */
export async function sendReviewSubmittedEmail(data: {
  email: string;
  firstName: string;
  productName: string;
  reviewId: string;
}): Promise<string> {
  const template = await loadTemplate('review-submitted');
  const html = replaceVariables(template, {
    firstName: data.firstName,
    productName: data.productName,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(
    data.email,
    `Thank you for your review of ${data.productName}`,
    html,
    'review-submitted',
    { productName: data.productName }
  );
}

/**
 * REVIEW APPROVED EMAIL (to customer)
 * Sent when admin approves a review
 */
export async function sendReviewApprovedEmail(data: {
  email: string;
  firstName: string;
  productName: string;
  reviewId: string;
}): Promise<string> {
  const template = await loadTemplate('review-approved');
  const html = replaceVariables(template, {
    firstName: data.firstName,
    productName: data.productName,
    reviewUrl: `${process.env.FRONTEND_URL || 'https://habeshan.de'}/products/${data.reviewId}`,
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(data.email, `Your review has been published! ✓`, html, 'review-approved', {
    productName: data.productName,
  });
}

/**
 * REVIEW REJECTED EMAIL (to customer)
 * Sent when admin rejects a review
 */
export async function sendReviewRejectedEmail(data: {
  email: string;
  firstName: string;
  productName: string;
  reason: string;
}): Promise<string> {
  const template = await loadTemplate('review-rejected');
  const html = replaceVariables(template, {
    firstName: data.firstName,
    productName: data.productName,
    reason: data.reason,
    appUrl: process.env.FRONTEND_URL || 'https://habeshan.de',
    currentYear: new Date().getFullYear(),
  });

  return queueEmail(data.email, `Your review needs attention`, html, 'review-rejected', {
    productName: data.productName,
  });
}
