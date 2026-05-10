import app from './app';
import { env } from './config/environment';
import emailQueue from './config/queue';
import { setupEmailQueue, onEmailJobFailed } from './jobs/email.job';
import logger from './utils/logger';

const PORT = env.PORT;

// Initialize email queue only if available
if (emailQueue) {
  try {
    setupEmailQueue(emailQueue);

    // Set up event listeners for email queue
    emailQueue.on('completed', (job: any) => {
      logger.info(`✓ Email job ${job.id} completed successfully`);
    });

    emailQueue.on('failed', (job: any, err: Error) => {
      if (job) {
        onEmailJobFailed(job, err);
      }
    });

    emailQueue.on('error', (error: Error) => {
      logger.warn(`Email queue error (will fallback to direct send): ${error.message}`);
    });

    logger.info('📧 Email queue initialized');
  } catch (error: any) {
    logger.warn(`⚠ Email queue initialization failed, will use direct email sending: ${error.message}`);
  }
} else {
  logger.info('📧 Redis unavailable - email queue disabled, using direct Nodemailer');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  if (emailQueue) {
    try {
      await emailQueue.close();
    } catch (error: any) {
      logger.error(`Error closing email queue: ${error.message}`);
    }
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  if (emailQueue) {
    try {
      await emailQueue.close();
    } catch (error: any) {
      logger.error(`Error closing email queue: ${error.message}`);
    }
  }
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});
