import Stripe from 'stripe';
import { env } from './environment';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const stripePublishableKey = env.STRIPE_PUBLISHABLE_KEY;
export const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET;
