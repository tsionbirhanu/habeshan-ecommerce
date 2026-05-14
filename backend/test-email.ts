import nodemailer from 'nodemailer';
import { env } from './src/config/environment';
import logger from './src/utils/logger';

/**
 * Email diagnostic test script
 * Run with: npx ts-node test-email.ts
 */
async function testEmailService() {
  console.log('🔍 Email Service Diagnostic Test');
  console.log('================================\n');

  // Log configuration (safe values only)
  console.log('📧 SMTP Configuration:');
  console.log(`   Host: ${env.SMTP_HOST}`);
  console.log(`   Port: ${env.SMTP_PORT}`);
  console.log(`   Secure: ${env.SMTP_SECURE}`);
  console.log(`   User: ${env.SMTP_USER}`);
  console.log(`   From: ${env.SMTP_FROM || env.SMTP_USER}`);
  console.log('');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Test 1: Verify connection
    console.log('🧪 Test 1: Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Test 2: Send test email
    console.log('🧪 Test 2: Sending Test Email...');
    const testEmail = {
      from: `"${env.EMAIL_FROM_NAME}" <${env.SMTP_FROM || env.SMTP_USER}>`,
      to: env.COMPANY_EMAIL,
      subject: '🧪 Email Service Test - Habeshan Mini Market',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">✅ Email Service Test</h1>
          <p>If you're reading this, the email service is working correctly!</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>SMTP Host: ${env.SMTP_HOST}</li>
            <li>From: ${env.SMTP_FROM || env.SMTP_USER}</li>
            <li>Recipient: ${env.COMPANY_EMAIL}</li>
          </ul>
          <p>This was sent from your backend server.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);

    // Test 3: Check for delivery confirmation
    console.log('🧪 Test 3: Summary');
    console.log('✅ All tests passed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Check your email inbox at ' + env.COMPANY_EMAIL);
    console.log('   2. If email not received:');
    console.log('      - Check Gmail security settings');
    console.log('      - Verify app password is correct');
    console.log('      - Check spam/junk folder');
    console.log('   3. If tests fail, check error messages above');

  } catch (error: any) {
    console.error('❌ Test Failed!\n');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('   1. Verify SMTP credentials in .env file');
    console.error('   2. For Gmail: Use App Password, not regular password');
    console.error('   3. Enable "Less Secure App Access" if using Gmail');
    console.error('   4. Check Gmail account security settings');
    console.error('   5. Consider using SendGrid as alternative');
    
    if (error.code === 'EAUTH') {
      console.error('\n⚠️  Authentication Error: Your credentials may be incorrect');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection Error: Cannot connect to SMTP server');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Timeout Error: SMTP server not responding');
    }
  }

  process.exit(0);
}

testEmailService().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
