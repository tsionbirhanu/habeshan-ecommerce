import { Job } from 'bull';
import sgMail from '@sendgrid/mail';
import { emailConfig } from '../config/email';
import { nodemailerConfig } from '../config/nodemailer';
import logger from '../utils/logger';

/**
 * Email Job Processor
 * Processes jobs from Bull email queue
 * Sends emails via SendGrid with retry logic
 */

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  templateId?: string;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    type: string;
  }>;
}

/**
 * Process email queue job
 * Bull automatically retries on failure (3 times with exponential backoff)
 */
export const processEmailJob = async (job: Job<EmailJobData>) => {
  try {
    if (!emailConfig.isConfigured) {
      logger.warn(
        `[EMAIL SKIPPED - NOT CONFIGURED] To: ${job.data.to}, Subject: ${job.data.subject}`
      );
      return { status: 'skipped', message: 'SendGrid not configured' };
    }

    logger.info(`Processing email job ${job.id}: ${job.data.to}`);

    const message: any = {
      to: job.data.to,
      from: {
        email: nodemailerConfig.from,
        name: 'Habeshan Mini Market',
      },
      subject: job.data.subject,
      html: job.data.html,
      replyTo: nodemailerConfig.from,
      trackingSettings: {
        clickTracking: {
          enable: true,
        },
        openTracking: {
          enable: true,
        },
      },
    };

    // Add attachments if provided
    if (job.data.attachments && job.data.attachments.length > 0) {
      message.attachments = job.data.attachments.map((att) => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.type,
        disposition: 'attachment',
      }));
    }

    // Send email via SendGrid
    const response = await sgMail.send(message);

    logger.info(
      `✓ Email sent successfully: ${job.data.to} (MessageID: ${response[0].headers['x-message-id']})`
    );

    return {
      status: 'sent',
      messageId: response[0].headers['x-message-id'],
      to: job.data.to,
    };
  } catch (error: any) {
    logger.error(`✗ Email job ${job.id} failed (attempt ${job.attemptsMade}/3): ${error.message}`);

    // Throw to trigger Bull's retry mechanism
    throw new Error(`Failed to send email to ${job.data.to}: ${error.message}`);
  }
};

/**
 * Configure job processor and retry settings
 * This should be called once in app initialization
 */
export const setupEmailQueue = (emailQueue: any) => {
  // Process 5 emails concurrently
  emailQueue.process(5, processEmailJob);

  // Configure event handlers for job lifecycle
  emailQueue.on('failed', onEmailJobFailed);
  emailQueue.on('completed', (job: Job<EmailJobData>) => {
    logger.info(`✓ Email job ${job.id} sent successfully to ${job.data.to}`);
  });

  logger.info('Email queue processor initialized (5 concurrent jobs, 3 retries)');
};

/**
 * Failed email job handler
 * Called when job exhausts all retries
 */
export const onEmailJobFailed = (job: Job<EmailJobData>, err: Error) => {
  logger.error(`❌ Email delivery failed permanently for ${job.data.to}: ${err.message}`);
  logger.error(`Job data: ${JSON.stringify(job.data)}`);
  // Could send alert to admin, log to database, etc.
};
