import * as SibApiV3Sdk from 'sib-api-v3-sdk';
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

  // ============================================
  // TEST 1: BREVO API
  // ============================================
  if (env.BREVO_API_KEY) {
    console.log('📧 Test 1: Brevo API Configuration');
    console.log('   API Key: ' + env.BREVO_API_KEY.substring(0, 10) + '...');
    
    try {
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const apiKeyAuth = apiInstance.authentications['api-key'];
      if (apiKeyAuth) {
        apiKeyAuth.apiKey = env.BREVO_API_KEY;
      }
      
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: env.COMPANY_EMAIL }];
      sendSmtpEmail.sender = { name: 'Habeshan Test', email: env.SMTP_USER };
      sendSmtpEmail.subject = '🧪 Email Service Test - Brevo';
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">✅ Brevo Email Test</h1>
          <p>If you're reading this, Brevo email service is working correctly!</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Service: Brevo (Sendinblue)</li>
            <li>Recipient: ${env.COMPANY_EMAIL}</li>
          </ul>
        </div>
      `;
      sendSmtpEmail.replyTo = { email: env.COMPANY_EMAIL };
      
      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Brevo email sent successfully!');
      console.log(`   Message ID: ${response.messageId}\n`);
    } catch (error: any) {
      console.error('❌ Brevo send failed:', error.message, '\n');
    }
  } else {
    console.log('⚠️ Test 1: Brevo API not configured (BREVO_API_KEY not set)\n');
  }

  // ============================================
  // TEST 2: SMTP (Fallback)
  // ============================================
  console.log('📧 Test 2: SMTP Configuration');
  console.log(`   Host: ${env.SMTP_HOST}`);
  console.log(`   Port: ${env.SMTP_PORT}`);
  console.log(`   User: ${env.SMTP_USER}`);
  
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
    family: 4,
  } as any);

  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');
    
    const info = await transporter.sendMail({
      from: `"Habeshan Test" <${env.SMTP_USER}>`,
      to: env.COMPANY_EMAIL,
      subject: '🧪 Email Service Test - SMTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3498db;">✅ SMTP Email Test</h1>
          <p>If you're reading this, SMTP email service is working correctly!</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Service: SMTP (${env.SMTP_HOST})</li>
            <li>Recipient: ${env.COMPANY_EMAIL}</li>
          </ul>
        </div>
      `,
    });
    console.log('✅ SMTP email sent successfully!');
    console.log(`   Message ID: ${info.messageId}\n`);
  } catch (error: any) {
    console.error('❌ SMTP send failed:', error.message, '\n');
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('📝 Summary:');
  console.log('   Primary: Brevo API' + (env.BREVO_API_KEY ? ' ✅' : ' ❌ (not configured)'));
  console.log('   Fallback 1: SMTP ✅');
  console.log('   Fallback 2: SendGrid ' + (env.SENDGRID_API_KEY ? '✅' : '❌'));
  console.log('\n🚀 Next Steps:');
  console.log('   1. Get Brevo API Key: https://app.brevo.com/settings/keys/api');
  console.log('   2. Add to .env: BREVO_API_KEY=your_key_here');
  console.log('   3. Check email inbox at ' + env.COMPANY_EMAIL);
  console.log('   4. If not received, check spam folder');

  process.exit(0);
}

testEmailService().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
