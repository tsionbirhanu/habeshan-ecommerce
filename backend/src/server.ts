import app from './app';
import { env } from './config/environment';
import emailQueue from './config/queue';
import { setupEmailQueue, onEmailJobFailed } from './jobs/email.job';
import logger from './utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const PORT = env.PORT;
const execAsync = promisify(exec);

// Run database migrations on startup
const runMigrations = async () => {
  try {
    logger.info('🔄 Checking and running database migrations...');
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      env: { ...process.env, DATABASE_URL: env.DATABASE_URL },
    });
    if (stdout) logger.info(`✅ Migration output: ${stdout}`);
    if (stderr) logger.info(`✅ Migration stderr: ${stderr}`);
    logger.info('✅ Database migrations completed successfully');
    return true;
  } catch (error: any) {
    // Migrations might already be deployed or fail for other reasons
    const errorMsg = error.message || error.toString();
    if (
      errorMsg.includes('already applied') ||
      errorMsg.includes('no pending migrations')
    ) {
      logger.info('✅ Database already up to date');
      return true;
    }
    logger.warn(`⚠️ Migration warning: ${errorMsg}`);
    logger.info('   This is usually not critical - the application can still run');
    // Don't fail the server startup, but warn about it
    return true;
  }
};

// Start server with migrations
const startServer = async () => {
  try {
    // Run migrations first
    await runMigrations();

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
        logger.warn(
          `⚠ Email queue initialization failed, will use direct email sending: ${error.message}`
        );
      }
    } else {
      logger.info('📧 Redis unavailable - email queue disabled, using direct Brevo API');
    }

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error: any) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

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

// Start the server
startServer();
