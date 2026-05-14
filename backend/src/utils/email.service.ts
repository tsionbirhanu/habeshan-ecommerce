import nodemailer from 'nodemailer';
import { env } from '../config/environment';
import logger from './logger';
import dns from 'dns';

// ============================================
// BREVO SMTP CONFIGURATION
// ============================================
// Email transporter configured for Brevo SMTP (smtp-relay.brevo.com)
// This provides reliable transactional email delivery for email verification and notifications

// Force IPv4 DNS resolution at Node.js level (helps on Render)
dns.setDefaultResultOrder('ipv4first');

// Log the SMTP configuration for debugging
logger.info(`📧 Initializing email transporter with SMTP host: ${env.SMTP_HOST}`);
logger.info(`   SMTP_PORT: ${env.SMTP_PORT}`);
logger.info(`   SMTP_SECURE: ${env.SMTP_SECURE}`);
logger.info(`   SMTP_USER: ${env.SMTP_USER ? '***' + env.SMTP_USER.slice(-4) : 'NOT SET'}`);
logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST, // smtp-relay.brevo.com for Brevo
  port: env.SMTP_PORT, // 587
  secure: env.SMTP_SECURE, // false
  auth: {
    user: env.SMTP_USER, // Brevo SMTP username
    pass: env.SMTP_PASSWORD, // Brevo SMTP password
  },
  tls: {
    // Do not fail on invalid certs - common for many SMTP providers in production
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000, // 15 seconds
  socketTimeout: 15000,     // 15 seconds
  family: 4, // Forces IPv4 ONLY (fixes ENETUNREACH errors on Render when IPv6 fails)
  greylist: false, // Disable greylisting
  logger: false, // Disable nodemailer debug logging (use our logger instead)
  dkim: {
    domainName: 'habeshanmarket.com',
    keySelector: 'default',
    privateKey: '', // Empty - will use Brevo's DKIM
  },
} as any);

// Verify transporter connection on startup
logger.info(`🔍 Verifying email transporter connection...`);
transporter.verify((error: Error | null, _success: boolean) => {
  if (error) {
    logger.error(`❌ Email transporter verification failed: ${error.message}`);
    logger.error(`   SMTP Host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    logger.error(`   SMTP User: ${env.SMTP_USER}`);
    logger.error('   This may be due to:');
    logger.error('   1. Incorrect SMTP credentials');
    logger.error('   2. Network/firewall issues (IPv6 vs IPv4)');
    logger.error('   3. Render environment variables not set correctly');
  } else {
    logger.info(`✅ Email transporter verified and ready!`);
    logger.info(`   Service: Brevo SMTP`);
    logger.info(`   Host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    logger.info(`   Mode: IPv4 only (family: 4)`);
  }
});

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
 * Send email via Brevo SMTP
 */
export const sendEmail = async (emailTemplate: EmailTemplate): Promise<boolean> => {
  try {
    const fromName = env.EMAIL_FROM_NAME || 'Habeshan Mini Market';
    const fromEmail = env.SMTP_FROM || env.SMTP_USER;

    logger.info(`📧 Sending email via Brevo SMTP to ${emailTemplate.to} (Subject: ${emailTemplate.subject})`);

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    logger.info(`✅ Email sent via Brevo SMTP to ${emailTemplate.to}: ${info.messageId}`);
    return true;
  } catch (error: any) {
    logger.error(`❌ Failed to send email via Brevo SMTP to ${emailTemplate.to}: ${error.message}`);
    if (error.stack) logger.debug(error.stack);
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
