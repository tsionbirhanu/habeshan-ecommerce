import sgMail from '@sendgrid/mail';
import { env } from './environment';

/**
 * SendGrid configuration for email sending
 */
if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

export const emailConfig = {
  apiKey: env.SENDGRID_API_KEY,
  from: {
    email: env.SMTP_FROM || 'noreply@habeshan.de',
    name: env.EMAIL_FROM_NAME || 'Habeshan Mini Market',
  },
  isConfigured: !!env.SENDGRID_API_KEY,
};

export default sgMail;
