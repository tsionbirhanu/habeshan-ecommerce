import nodemailer from 'nodemailer';
import { NodemailerTransportOptions } from 'nodemailer/lib/smtp-transport';
import sgMail from '@sendgrid/mail';
import { env } from '../config/environment';
import logger from './logger';

// Configure primary SMTP transporter
const smtpConfig: NodemailerTransportOptions = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD, // MUST be App Password for Gmail (not regular password)
  },
  tls: {
    // Do not fail on invalid certs - common for many SMTP providers in production
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000,     // 10 seconds
  family: 4, // 🔥 IMPORTANT: forces IPv4 (fixes ENETUNREACH errors on Render)
} as any;

const transporter = nodemailer.createTransport(smtpConfig);

// Configure SendGrid as fallback if API key is provided
let sendGridConfigured = false;
if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
  sendGridConfigured = true;
  logger.info('✓ SendGrid configured as email fallback');
}

// Verify SMTP transporter connection
transporter.verify((error: Error | null, _success: boolean) => {
  if (error) {
    logger.error(`❌ SMTP transporter verification failed: ${error.message}`);
    logger.error('Check your SMTP environment variables (HOST, PORT, USER, PASSWORD)');
  } else {
    logger.info(`✓ SMTP transporter verified and ready (${env.SMTP_HOST}:${env.SMTP_PORT})`);
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
 * Send email with SMTP fallback to SendGrid
 */
export const sendEmail = async (emailTemplate: EmailTemplate): Promise<boolean> => {
  const fromName = env.EMAIL_FROM_NAME || 'Habeshan Mini Market';
  const fromEmail = env.SMTP_FROM || env.SMTP_USER;
  
  try {
    logger.info(`📧 Attempting to send email to ${emailTemplate.to} (Subject: ${emailTemplate.subject})`);

    // Try SMTP first
    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: emailTemplate.to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      logger.info(`✅ Email sent via SMTP to ${emailTemplate.to}: ${info.messageId}`);
      return true;
    } catch (smtpError: any) {
      logger.warn(`⚠️ SMTP send failed: ${smtpError.message}`);
      
      // Fallback to SendGrid if SMTP fails and SendGrid is configured
      if (sendGridConfigured) {
        logger.info('🔄 Falling back to SendGrid...');
        
        const msg = {
          to: emailTemplate.to,
          from: fromEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          replyTo: env.COMPANY_EMAIL,
        };

        const response = await sgMail.send(msg);
        logger.info(`✅ Email sent via SendGrid to ${emailTemplate.to}: ${response[0].statusCode}`);
        return true;
      } else {
        throw smtpError; // Re-throw if no SendGrid fallback
      }
    }
  } catch (error: any) {
    logger.error(`❌ Failed to send email to ${emailTemplate.to}:`);
    logger.error(`   Error: ${error.message}`);
    if (error.response?.body) {
      logger.error(`   Response: ${JSON.stringify(error.response.body)}`);
    }
    if (error.stack) logger.debug(error.stack);
    
    return false;
  }
};

/**
 * Send email asynchronously (non-blocking)
 * Useful for non-critical emails that shouldn't block the response
 */
export const sendEmailAsync = (emailTemplate: EmailTemplate): void => {
  // Fire and forget - log errors but don't block
  sendEmail(emailTemplate)
    .then((success) => {
      if (!success) {
        logger.warn(`Async email send may have failed for ${emailTemplate.to}`);
      }
    })
    .catch((error) => {
      logger.error('Critical error in async email send:', error);
    });
};
