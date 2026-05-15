import { env } from './environment';

/**
 * Brevo API configuration for email sending
 */

export const emailConfig = {
  apiKey: env.BREVO_API_KEY,
  from: {
    email: env.SMTP_FROM || 'noreply@habeshan.de',
    name: env.EMAIL_FROM_NAME || 'Habeshan Mini Market',
  },
  isConfigured: !!env.BREVO_API_KEY,
  brevoApiUrl: 'https://api.brevo.com/v3/smtp/email',
};

export default emailConfig;
