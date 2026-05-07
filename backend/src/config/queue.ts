import Queue from 'bull';
import { env } from './environment';
import logger from '../utils/logger';

/**
 * Email Queue Configuration
 * Uses Redis for persistent job storage
 * Bull handles retries, exponential backoff, and failed job tracking
 */

const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

// Create email queue for all outbound notifications
export const emailQueue = new Queue('email-queue', redisUrl);

// Queue event listeners for monitoring
emailQueue.on('completed', (job) => {
  logger.info(`✓ Email job completed: ${job.id} (${job.data.to})`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`✗ Email job failed: ${job.id} - ${err.message}`);
});

emailQueue.on('error', (err) => {
  logger.error('Email queue error:', err);
});

emailQueue.on('active', (job) => {
  logger.debug(`→ Email job processing: ${job.id}`);
});

// Cleanup on graceful shutdown
process.on('SIGTERM', async () => {
  await emailQueue.close();
  logger.info('Email queue closed');
});

export default emailQueue;
