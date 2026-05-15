import nodemailer from 'nodemailer';
import { env } from './environment';
import logger from '../utils/logger';

/**
 * Nodemailer transporter configuration for email sending via SMTP
 */

let transporter: nodemailer.Transporter | null = null;

export const initNodemailer = async (): Promise<nodemailer.Transporter | null> => {
  // Check if SMTP is configured
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    logger.warn('⚠️ SMTP not configured - Nodemailer will not be available');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE || false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    logger.info('✓ Nodemailer SMTP connection verified successfully');
    return transporter;
  } catch (error) {
    logger.error('❌ Failed to initialize Nodemailer:', error);
    return null;
  }
};

export const getNodemailerTransporter = (): nodemailer.Transporter | null => {
  return transporter;
};

export const nodemailerConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE || false,
  from: env.SMTP_FROM || 'noreply@habeshanmarket.com',
  isConfigured: !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD),
};

export default nodemailerConfig;
