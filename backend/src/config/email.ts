import { nodemailerConfig } from './nodemailer';

/**
 * Email configuration for Nodemailer SMTP
 */

export const emailConfig = {
  nodemailer: nodemailerConfig,
  isConfigured: nodemailerConfig.isConfigured,
};

export default emailConfig;
