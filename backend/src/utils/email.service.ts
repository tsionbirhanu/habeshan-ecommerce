import { getNodemailerTransporter, nodemailerConfig } from '../config/nodemailer';
import logger from './logger';

// ============================================
// EMAIL SERVICE: Nodemailer SMTP
// ============================================

// Log email configuration
logger.info('📧 Email Service Initialization:');
if (nodemailerConfig.isConfigured) {
  logger.info('   ✓ Nodemailer SMTP configured');
} else {
  logger.error('   ❌ Email service not configured - email sending will fail');
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

/**
 * Generate welcome email for new customer
 */
export const generateWelcomeEmail = (firstName: string, email: string): EmailTemplate => {
  return {
    to: email,
    subject: '🎉 Welcome to Habeshan Mini Market!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Welcome, ${firstName}!</h1>
        <p>Thank you for joining Habeshan Mini Market. We're excited to have you on board.</p>
        <p>Your account has been successfully created with email: <strong>${email}</strong></p>
        <div style="background-color: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Get Started:</h3>
          <ul>
            <li>Browse our Ethiopian & Eritrean products</li>
            <li>Add items to your cart</li>
            <li>Checkout securely with Stripe, PayPal, or Klarna</li>
            <li>Track your orders in real-time</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p style="color: #7f8c8d;">Best regards,<br/>The Habeshan Mini Market Team</p>
      </div>
    `,
  };
};

/**
 * Generate password reset email
 */
export const generatePasswordResetEmail = (
  firstName: string,
  email: string,
  resetUrl: string
): EmailTemplate => {
  return {
    to: email,
    subject: '🔐 Password Reset Request - Habeshan Mini Market',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Password Reset Request</h1>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #e74c3c;">This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #7f8c8d;">The Habeshan Mini Market Team</p>
      </div>
    `,
  };
};

/**
 * Generate order confirmation email
 */
export const generateOrderConfirmationEmail = (
  firstName: string,
  email: string,
  orderId: string,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
): EmailTemplate => {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #ecf0f1;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; text-align: right;">€${item.price.toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return {
    to: email,
    subject: `📦 Order Confirmed #${orderId} - Habeshan Mini Market`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #27ae60;">✓ Order Confirmed</h1>
        <p>Hi ${firstName},</p>
        <p>Thank you for your order! We're processing it now.</p>
        <div style="background-color: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong>Order ID:</strong> ${orderId}<br/>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </div>
        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #ecf0f1;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
          ${itemsHtml}
          <tr style="font-weight: bold; background-color: #f8f9fa;">
            <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
            <td style="padding: 10px; text-align: right;">€${totalAmount.toFixed(2)}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #7f8c8d;">You'll receive a shipping notification soon.</p>
        <p style="color: #7f8c8d;">The Habeshan Mini Market Team</p>
      </div>
    `,
  };
};

/**
 * Generate email verification email
 */
export const generateEmailVerificationEmail = (
  firstName: string,
  email: string,
  verificationUrl: string
): EmailTemplate => {
  return {
    to: email,
    subject: '✉️ Verify Your Email - Habeshan Mini Market',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Verify Your Email Address</h1>
        <p>Hi ${firstName},</p>
        <p>Thank you for signing up with Habeshan Mini Market! To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #7f8c8d;">Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #3498db;"><small>${verificationUrl}</small></p>
        <p style="color: #e74c3c;">This link will expire in 24 hours.</p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <p style="color: #7f8c8d;">The Habeshan Mini Market Team</p>
      </div>
    `,
  };
};

/**
 * Send email via Nodemailer SMTP
 */
export const sendEmail = async (emailTemplate: EmailTemplate): Promise<boolean> => {
  if (!nodemailerConfig.isConfigured) {
    logger.error('❌ Nodemailer SMTP not configured - cannot send email');
    return false;
  }

  try {
    const transporter = getNodemailerTransporter();
    if (!transporter) {
      logger.warn('⚠️ Nodemailer transporter not initialized');
      return false;
    }

    logger.info(`📤 Sending email via Nodemailer SMTP to: ${emailTemplate.to}`);
    logger.info(`   From: ${nodemailerConfig.from}`);

    const info = await transporter.sendMail({
      from: nodemailerConfig.from,
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    logger.info(`✅ Email sent successfully to ${emailTemplate.to} (MessageID: ${info.messageId})`);
    return true;
  } catch (error: any) {
    logger.error(`❌ Failed to send email via Nodemailer: ${error.message}`);
    return false;
  }
};



/**
 * Send email asynchronously (non-blocking)
 */
export const sendEmailAsync = (emailTemplate: EmailTemplate): Promise<void> => {
  return sendEmail(emailTemplate)
    .then(() => undefined)
    .catch((error) => {
      logger.error('Async email send failed:', error);
    });
};
