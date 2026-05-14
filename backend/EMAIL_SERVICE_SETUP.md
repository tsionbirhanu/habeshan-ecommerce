# Email Service Configuration Guide

## Current Setup

Your backend is configured to send emails using two methods:

1. **Primary: Gmail SMTP** (configured via `SMTP_*` environment variables)
2. **Fallback: SendGrid** (configured via `SENDGRID_API_KEY`)

## For Local Development ✅

Your local setup is working correctly! You can test emails with:

```bash
npx ts-node test-email.ts
```

## For Production (Render) 🚀

### Option 1: Continue Using Gmail (Recommended for now)

Gmail SMTP requires an **App Password**, not your regular Gmail password.

**Steps:**

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Generate an App Password for "Mail" and "Linux"
4. Copy the 16-character password
5. Add to Render environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tsionbirhanu08@gmail.com
SMTP_PASSWORD=<your-16-char-app-password>
SMTP_FROM=noreply@habeshanmarket.com
EMAIL_FROM_NAME=Habeshan Mini Market
```

### Option 2: Use SendGrid (More Reliable) ✨

SendGrid is more reliable for production and has better deliverability.

**Steps:**

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key in Settings > API Keys
3. Add to Render environment variables:

```env
SENDGRID_API_KEY=SG.your_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=dummy@example.com
SMTP_PASSWORD=dummy-password
```

When SendGrid is configured, it will be used as a fallback if SMTP fails.

### Option 3: Use SendGrid as Primary

Replace the email service with direct SendGrid calls:

```typescript
// In email.service.ts, use sgMail directly instead of nodemailer
```

## Email Flow

```
User Action (Register/Reset Password)
        ↓
sendEmail() called
        ↓
Try SMTP (Gmail)
        ↓
    Success? → ✅ Done
        ↓
    Failed? → Fallback to SendGrid
        ↓
    Success? → ✅ Done
        ↓
    Failed? → ❌ Log error, continue
```

## Troubleshooting

### Problem: "Cannot find module bcrypt"
- Solution: Already fixed! Run `pnpm approve-builds` ✅

### Problem: Emails not arriving in production
1. **Check environment variables** on Render dashboard
2. **Verify SMTP credentials** - use `test-email.ts` script
3. **Check spam folder** - Gmail may flag automated emails
4. **Use SendGrid** - more reliable delivery

### Problem: Gmail rejecting emails
- Solution: Use SendGrid instead (better reputation)
- Alternative: Contact Gmail to increase sender reputation

### Problem: Render environment variables not loaded
- Re-deploy after updating variables on Render dashboard
- Variables won't take effect until deployment

## Testing in Production

To test email sending in production:

1. Make a registration request via the API
2. Check inbox for verification email
3. If not received:
   - Check spam/junk folder
   - Check Render logs for errors: `pnpm dev 2>&1 | grep -i email`
   - Re-run `test-email.ts` after SSH into Render container

## Email Templates Included

- ✉️ Email Verification
- 🎉 Welcome Email
- 🔐 Password Reset
- 📦 Order Confirmation
- And more...

All templates are in `src/utils/email.service.ts` and can be customized.

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files with real credentials
- Use environment variable management on Render
- Rotate API keys periodically
- Gmail App Passwords are specific to this app only
- SendGrid API keys can be regenerated anytime

## Next Steps

1. Update `.env` on Render with correct SMTP credentials
2. Deploy the backend
3. Test email functionality via API registration endpoint
4. Monitor logs for email sending errors

---

For more details on SendGrid setup, see: https://sendgrid.com/docs
For Gmail App Passwords: https://support.google.com/accounts/answer/185833
