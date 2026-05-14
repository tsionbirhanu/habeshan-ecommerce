# Email Service Configuration Guide

## Current Setup

Your backend now uses a **three-tier email service** with automatic fallbacks:

1. **Primary: Brevo (Sendinblue) API** ⭐ Recommended for production
2. **Fallback 1: Gmail SMTP**
3. **Fallback 2: SendGrid API**

## Email Service Flow

```
User Action (Register/Reset Password)
        ↓
sendEmail() called
        ↓
Try Brevo API
        ↓
    Success? → ✅ Done
        ↓
    Failed? → Fallback to SMTP (Gmail)
        ↓
    Success? → ✅ Done
        ↓
    Failed? → Fallback to SendGrid
        ↓
    Success? → ✅ Done
        ↓
    Failed? → ❌ Log error, continue
```

## For Local Development ✅

Your local setup is working correctly! You can test all email services with:

```bash
npx ts-node test-email.ts
```

## For Production (Render) 🚀

### Option 1: Brevo API (Recommended) ⭐

Brevo is the most reliable and feature-rich option for production.

**Steps:**

1. Sign up at [Brevo](https://app.brevo.com) (formerly Sendinblue)
2. Go to **Settings > Keys & Credentials**
3. Copy your **SMTP Key** (API Key)
4. Add to Render environment variables:

```env
BREVO_API_KEY=your_api_key_here
# Keep SMTP credentials as fallback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tsionbirhanu08@gmail.com
SMTP_PASSWORD=<your-app-password>
SMTP_FROM=noreply@habeshanmarket.com
```

**Benefits:**
- ✅ Best deliverability rates
- ✅ Free tier: 300 emails/day
- ✅ Full email templates in dashboard
- ✅ Analytics and tracking
- ✅ No rate limits
- ✅ Excellent support

### Option 2: Gmail SMTP (Fallback)

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

### Option 3: SendGrid (Alternative)

SendGrid is another reliable option if you prefer not to use Brevo.

**Steps:**

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key in Settings > API Keys
3. Add to Render environment variables:

```env
SENDGRID_API_KEY=SG.your_api_key_here
# SMTP as secondary fallback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=dummy@example.com
SMTP_PASSWORD=dummy-password
```

## Environment Variables

```env
# ========== BREVO EMAIL SERVICE (API) ==========
BREVO_API_KEY=your_brevo_api_key_here  # Primary (recommended)

# ========== EMAIL CONFIGURATION (SMTP) ==========
SMTP_HOST=smtp.gmail.com               # Fallback 1
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tsionbirhanu08@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@habeshanmarket.com

# ========== SENDGRID (Optional Fallback) ==========
SENDGRID_API_KEY=SG.your_key_here     # Fallback 2

# ========== OTHER EMAIL SETTINGS ==========
EMAIL_FROM_NAME=Habeshan Mini Market
FRONTEND_URL=https://habeshan.de
COMPANY_EMAIL=info@habeshan.de
```

## Troubleshooting

### Problem: "Cannot find module bcrypt"
- Solution: Run `pnpm approve-builds` ✅

### Problem: Emails not arriving in production
1. **Check environment variables** on Render dashboard
2. **Verify credentials** - run `npx ts-node test-email.ts`
3. **Check spam folder** - automated emails may be flagged
4. **Check logs** - look for email sending errors in Render logs

### Problem: Brevo API not working
- Verify API key is correct
- Check Brevo account status (not suspended)
- Try SMTP/SendGrid fallbacks
- Check Render logs for API error messages

### Problem: Gmail SMTP rejected
- Use App Password (not regular password)
- Ensure 2FA is enabled
- Check Gmail security settings
- Verify SMTP credentials are correct
- Consider using Brevo instead (better reputation)

### Problem: IPv4/IPv6 connectivity (ENETUNREACH)
- ✅ Already fixed in the code with `family: 4` setting
- Forces IPv4 instead of IPv6 on Render

## Testing in Production

1. **Deploy to Render** after updating environment variables
2. **Make a registration request** via API
3. **Check inbox** for verification email (10-30 seconds)
4. **If not received:**
   - Check spam/junk folder
   - Check Render logs: `pnpm dev 2>&1 | grep -i email`
   - Run `npx ts-node test-email.ts` after SSH into container

## Email Templates Included

All templates are in `src/utils/email.service.ts`:

- ✉️ Email Verification (24-hour link expiry)
- 🎉 Welcome Email
- 🔐 Password Reset (1-hour link expiry)
- 📦 Order Confirmation
- Custom templates can be added easily

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files with real credentials
- Use environment variable management on Render
- Rotate API keys periodically
- Gmail App Passwords are specific to this app
- API keys can be regenerated anytime
- Use HTTPS for all email links

## Recommended Production Setup

```env
# Primary email service
BREVO_API_KEY=your_brevo_key

# Fallback SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: SendGrid fallback
SENDGRID_API_KEY=SG.your_key

# Email settings
EMAIL_FROM_NAME=Habeshan Mini Market
SMTP_FROM=noreply@habeshanmarket.com
FRONTEND_URL=https://habeshan.de
COMPANY_EMAIL=info@habeshan.de
```

## Comparing Email Services

| Feature | Brevo | Gmail SMTP | SendGrid |
|---------|-------|-----------|----------|
| Free Tier | 300/day | Limited | 100/day |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Speed | 1-5s | 5-10s | 1-5s |
| Templates | Built-in | No | Built-in |
| Analytics | ✅ | ❌ | ✅ |
| Support | Excellent | Limited | Good |

**Recommendation:** Use Brevo for production, SMTP as fallback. ✅

## Getting Help

- Brevo Docs: https://developers.brevo.com
- Gmail App Password: https://support.google.com/accounts/answer/185833
- SendGrid Docs: https://sendgrid.com/docs
- Email Headers: Check bounce/failure headers for diagnostics

---

Last Updated: May 14, 2026

