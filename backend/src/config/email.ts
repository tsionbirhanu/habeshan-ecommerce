import { env } from './environment';

/**
 * Resend API configuration for email sending
 */

export const emailConfig = {
  apiKey: env.RESEND_API_KEY,
  from: {
    email: env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    name: env.RESEND_FROM_NAME || 'Habeshan Mini Market',
  },
  isConfigured: !!env.RESEND_API_KEY,
  resendApiUrl: 'https://api.resend.com/emails',
};

export default emailConfig;
