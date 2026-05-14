# Email Service: Brevo API + SMTP Fallback

## What Changed

### ✅ Primary Email Method: Brevo API
- Uses `/v3/smtp/email` endpoint
- Fast and reliable
- Better for serverless (Vercel/Render)
- Recommended for production

### ✅ Fallback Email Method: SMTP
- Uses Brevo SMTP relay or custom SMTP
- Automatically triggered if API fails
- Ensures emails always get sent
- Transparent to application

---

## Configuration

### `.env` (Local Development)
```
# Primary: Brevo API
BREVO_API_KEY=[your-brevo-api-key]
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=[your-brevo-email]
BREVO_SMTP_PASSWORD=[your-brevo-smtp-password]

# Fallback: SMTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=[your-brevo-email]
SMTP_PASSWORD=[your-brevo-smtp-password]
SMTP_FROM=noreply@habeshanmarket.com
EMAIL_FROM_NAME=Habeshan Mini Market
```

### `environment.ts` (Validation)
All email variables are validated at startup:
- `BREVO_API_KEY` (optional but recommended)
- `BREVO_SMTP_HOST`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASSWORD` (optional)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` (optional)
- App warns if both methods unavailable

### `email.service.ts` (Implementation)
```typescript
export const sendEmail = async (emailTemplate: EmailTemplate): Promise<boolean> => {
  // Step 1: Try Brevo API
  if (env.BREVO_API_KEY) {
    // Call https://api.brevo.com/v3/smtp/email
    // If success → Return true
    // If fail → Continue to step 2
  }
  
  // Step 2: Try SMTP Fallback
  if (smtpTransporter) {
    // Use nodemailer SMTP
    // If success → Return true
    // If fail → Return false
  }
  
  // Step 3: Both failed
  return false;
};
```

---

## Log Examples

### ✅ Success via API (Preferred)
```
📧 Email Service Initialization:
   ✓ Brevo API Key configured (PRIMARY)
   ✓ SMTP Fallback ready (smtp-relay.brevo.com:587)

📤 Attempting Brevo API: user@example.com
✅ Email sent via Brevo API to user@example.com: OK
```

### ⚠️ Fallback to SMTP
```
📤 Attempting Brevo API: user@example.com
⚠️ Brevo API failed (401): Invalid API key
📧 Attempting SMTP Fallback: user@example.com
✅ Email sent via SMTP to user@example.com: <msg123@brevo.com>
```

### ❌ Both Failed
```
📤 Attempting Brevo API: user@example.com
⚠️ Brevo API failed: Connection timeout
📧 Attempting SMTP Fallback: user@example.com
❌ SMTP failed: Authentication failed
❌ No email service available (Brevo API and SMTP both unavailable)
```

---

## Features

### Email Types
1. **Welcome Email** - Sent on registration
2. **Email Verification** - Sent for email verification (24h link)
3. **Password Reset** - Sent when user requests password reset (1h link)
4. **Order Confirmation** - Sent after order placement
5. **Shipping Notification** - Can be added for order tracking

### HTML Templates
All emails have professional HTML templates with:
- Branding (Habeshan Mini Market)
- Responsive design (mobile-friendly)
- Action buttons (verify, reset password)
- Clear instructions
- Company information

---

## Using Brevo API Key

### Get API Key
1. Go to https://app.brevo.com
2. Click Settings → API Keys
3. Copy your API key starting with `xkeysib-`

### Vercel Setup
1. Project Settings → Environment Variables
2. Add `BREVO_API_KEY=[your-key]`
3. Redeploy

### Test Locally
```bash
# Should see: "✓ Brevo API Key configured (PRIMARY)"
pnpm dev
```

---

## Advantages of This Approach

| Aspect | Benefit |
|--------|---------|
| **Reliability** | If API fails, SMTP automatically takes over |
| **Speed** | API is faster for serverless platforms |
| **Cost** | Free tier available, no extra charges |
| **Transparency** | Logs show which method was used |
| **Flexibility** | Easy to switch between methods |
| **Scaling** | Handles traffic spikes automatically |

---

## Monitoring

### Check Email Delivery
1. Go to Vercel Dashboard → Logs
2. Filter by timestamp
3. Look for `✅ Email sent via`

### Brevo Dashboard
1. https://app.brevo.com
2. Campaigns → Transactional → Email
3. View delivery status and statistics

### Errors to Watch
- `401` - Invalid API key
- `429` - Rate limited (too many emails)
- `500` - Brevo service issue
- `Connection timeout` - Network issue

---

## Switching to Different Email Service

### To Use SendGrid Instead
```env
BREVO_API_KEY=  # Leave empty
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxx_your_sendgrid_key_xxx
```

### To Use Gmail
```env
BREVO_API_KEY=  # Leave empty
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Next Steps

1. ✅ Backend code updated with Brevo API
2. ⏳ Set environment variables on Vercel
3. ⏳ Deploy backend to Vercel
4. ⏳ Test email verification flow
5. ⏳ Deploy frontend to Vercel
6. ⏳ Monitor production emails
