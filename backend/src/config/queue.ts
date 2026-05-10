import Queue from 'bull';
import { env } from './environment';
import logger from '../utils/logger';

/**
 * Email Queue Configuration
 * Uses Redis for persistent job storage
 * Bull handles retries, exponential backoff, and failed job tracking
 * Gracefully falls back to direct email sending if Redis is unavailable
 */

const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

let emailQueue: any = null;
let isRedisAvailable = true;

// Try to create email queue - if Redis is unavailable, we'll send emails directly
try {
  emailQueue = new Queue('email-queue', redisUrl);

  // Queue event listeners for monitoring
  emailQueue.on('completed', (job: any) => {
    logger.info(`✓ Email job completed: ${job.id} (${job.data.to})`);
  });

  emailQueue.on('failed', (job: any, err: Error) => {
    logger.error(`✗ Email job failed: ${job.id} - ${err.message}`);
  });

  emailQueue.on('error', (err: Error) => {
    isRedisAvailable = false;
    logger.warn(`⚠ Redis unavailable - falling back to direct email sending: ${err.message}`);
  });

  emailQueue.on('active', (job: any) => {
    logger.debug(`→ Email job processing: ${job.id}`);
  });

  // Test Redis connection
  emailQueue.client.on('error', (err: Error) => {
    isRedisAvailable = false;
    logger.warn(`⚠ Redis connection failed - falling back to direct email: ${err.message}`);
  });

  emailQueue.client.on('connect', () => {
    isRedisAvailable = true;
    logger.info('✓ Redis connection established');
  });
} catch (error: any) {
  isRedisAvailable = false;
  logger.warn(`⚠ Could not initialize Bull queue - will send emails directly: ${error.message}`);
}

// Cleanup on graceful shutdown
process.on('SIGTERM', async () => {
  if (emailQueue) {
    await emailQueue.close();
    logger.info('Email queue closed');
  }
});

export { isRedisAvailable };
export default emailQueue;
