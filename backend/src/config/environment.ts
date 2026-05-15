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

  // Email Configuration (Resend)
  RESEND_API_KEY: z.string().describe('Resend API key for transactional emails - REQUIRED'),
  RESEND_FROM_EMAIL: z.string().optional(),
  RESEND_FROM_NAME: z.string().default('Habeshan Mini Market'),
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
  if (errors.RESEND_API_KEY) {
    console.error('\n⚠️ Email Configuration Error:');
    console.error('   You must set the following variable:');
    console.error('   - RESEND_API_KEY=<your-resend-api-key>');
    console.error('\n   Get your API key from: https://resend.com/');
    console.error('   On Render: Set this in Settings → Environment');
    console.error('   Then redeploy your service');
  }
  
  process.exit(1);
}

export const env = parsed.data;

// Log critical configuration on startup (for debugging on Render)
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Production Configuration Loaded:');
  console.log(`   RESEND_API_KEY: ${env.RESEND_API_KEY ? '✓ Configured' : '❌ MISSING'}`);
  console.log(`   RESEND_FROM_EMAIL: ${env.RESEND_FROM_EMAIL || 'onboarding@resend.dev (default)'}`);
  console.log(`   DATABASE_URL: ${env.DATABASE_URL ? 'SET' : 'MISSING'}`);
  console.log(`   FRONTEND_URL: ${env.FRONTEND_URL}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
}
