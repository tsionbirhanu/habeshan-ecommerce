import app from './app';
import { env } from './config/environment';
import { emailQueue } from './config/queue';
import { setupEmailQueue, onEmailJobFailed } from './jobs/email.job';
import logger from './utils/logger';

const PORT = env.PORT;

// Initialize email queue
setupEmailQueue(emailQueue);

// Set up event listeners for email queue
emailQueue.on('completed', (job) => {
  logger.info(`✓ Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
  if (job) {
    onEmailJobFailed(job, err);
  }
});

emailQueue.on('error', (error) => {
  logger.error(`Email queue error: ${error.message}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await emailQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await emailQueue.close();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`📧 Email queue initialized and ready`);
});
