import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('1d'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  ALLOWED_ORIGINS: z.string().transform((val) => val.split(',')),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // PayPal Configuration
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_MODE: z.enum(['sandbox', 'production']).default('sandbox'),

  // Klarna Configuration
  KLARNA_API_KEY: z.string().optional(),
  KLARNA_REGION: z.string().default('eu'),
  KLARNA_MODE: z.enum(['playground', 'production']).default('playground'),

  // Email Configuration
  SMTP_HOST: z.string().describe('SMTP server hostname (e.g., smtp-relay.brevo.com for Brevo)'),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default('false'),
  SMTP_USER: z.string().describe('SMTP username (Brevo SMTP username)'),
  SMTP_PASSWORD: z.string().describe('SMTP password (Brevo SMTP password)'),
  SMTP_FROM: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default('Habeshan Mini Market'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Redis Configuration (Email Queue)
  REDIS_URL: z.string().optional(),

  // Company Configuration (German invoicing)
  COMPANY_NAME: z.string().default('Habeshan Mini Market'),
  COMPANY_ADDRESS: z.string().default('Street 123, 10115 Berlin'),
  COMPANY_TAX_ID: z.string().default('DE123456789'),
  COMPANY_EMAIL: z.string().email().default('info@habeshan.de'),
  COMPANY_PHONE: z.string().optional(),
  COMPANY_WEBSITE: z.string().optional(),
  COMPANY_BANK_NAME: z.string().optional(),
  COMPANY_BANK_ACCOUNT: z.string().optional(),
  COMPANY_BANK_CODE: z.string().optional(),
  COMPANY_IBAN: z.string().optional(),
  COMPANY_BIC: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error('❌ Invalid environment variables:', errors);
  
  // Provide helpful error messages for email configuration
  if (errors.SMTP_HOST || errors.SMTP_USER || errors.SMTP_PASSWORD) {
    console.error('\n⚠️ Email Configuration Error:');
    console.error('   You must set these variables for Brevo SMTP:');
    console.error('   - SMTP_HOST=smtp-relay.brevo.com');
    console.error('   - SMTP_USER=<your-brevo-username>');
    console.error('   - SMTP_PASSWORD=<your-brevo-password>');
    console.error('\n   On Render: Set these in Settings → Environment');
    console.error('   Then redeploy your service');
  }
  
  process.exit(1);
}

export const env = parsed.data;
