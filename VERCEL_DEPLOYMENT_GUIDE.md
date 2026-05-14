# 🚀 Deploy Backend on Vercel with Brevo Email API

## Overview

Your backend will use:
- **Email Primary:** Brevo API (faster, more reliable)
- **Email Fallback:** Brevo SMTP (if API fails)
- **Database:** PostgreSQL (Neon)
- **Hosting:** Vercel

---

## Step 1: Prepare Your Code ✅

**Status:** Backend already configured with Brevo API integration:
- ✅ `.env` has Brevo API key and SMTP credentials
- ✅ `environment.ts` validates all required variables
- ✅ `email.service.ts` uses Brevo API with SMTP fallback
- ✅ Build passes successfully

---

## Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub, GitLab, or Bitbucket
3. Authorize Vercel to access your repositories

---

## Step 3: Deploy Backend on Vercel

### Option A: Deploy from Git (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Brevo email API integration"
   git push origin main
   ```

2. **Go to Vercel Dashboard:** https://vercel.com/dashboard

3. **Click "Add New" → "Project"**

4. **Import your GitHub repository:**
   - Select `habeshan-ecommerce` repo
   - Click "Import"

5. **Configure Project Settings:**
   - **Framework Preset:** Node.js
   - **Root Directory:** `backend` (important!)
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

6. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# In backend directory
cd backend
vercel
```

---

## Step 4: Set Environment Variables on Vercel

1. **After deployment, go to Project Settings:**
   - https://vercel.com/dashboard → Your Project → Settings

2. **Click "Environment Variables"**

3. **Add all these variables** (copy exact values from your `.env` file):

```
DATABASE_URL=[your-neon-database-url]
JWT_SECRET=[your-jwt-secret]
JWT_ACCESS_EXPIRY=1d
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=10
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
LOG_LEVEL=info
STRIPE_SECRET_KEY=[your-stripe-secret-key]
STRIPE_PUBLISHABLE_KEY=[your-stripe-public-key]
STRIPE_WEBHOOK_SECRET=[your-stripe-webhook-secret]
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
KLARNA_API_KEY=your_klarna_api_key
KLARNA_REGION=eu
KLARNA_MODE=playground
BREVO_API_KEY=[from-app.brevo.com/settings/keys/api]
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=[your-brevo-email]
BREVO_SMTP_PASSWORD=[from-app.brevo.com/settings/keys/smtp]
SMTP_FROM=noreply@habeshanmarket.com
EMAIL_FROM_NAME=Habeshan Mini Market
FRONTEND_URL=https://your-frontend.vercel.app
COMPANY_NAME=Habeshan Mini Market
COMPANY_ADDRESS=Straße 123, 10115 Berlin
COMPANY_TAX_ID=DE123456789
COMPANY_EMAIL=info@habeshan.de
COMPANY_PHONE=+49 30 12345678
```

**Where to find credentials:**
- **Brevo API Key:** https://app.brevo.com/settings/keys/api
- **Brevo SMTP Credentials:** https://app.brevo.com/settings/keys/smtp
- **Stripe Keys:** https://dashboard.stripe.com/apikeys

4. **Click "Save"** for each variable

---

## Step 5: Update Frontend API URL

Your frontend needs to know where backend is deployed:

**File:** `frontend/.env`

```
NEXT_PUBLIC_API_URL=https://your-backend-vercel-domain.vercel.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-stripe-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Get Backend URL:**
1. Go to Vercel dashboard → Your Backend Project
2. Copy the domain (e.g., `habeshan-backend.vercel.app`)

---

## Step 6: Redeploy After Environment Variables

1. After adding environment variables, Vercel should auto-redeploy
2. If not, manually redeploy:
   - Click "Deployments" tab
   - Find latest deployment
   - Click "..." → "Redeploy"

---

## Step 7: Test Email Verification

1. **Register a new user:**
   - Go to your frontend
   - Create new account
   - Watch backend logs in Vercel

2. **Check backend logs:**
   - Vercel Dashboard → Logs
   - Look for these messages:

```
✅ Email sent via Brevo API to user@example.com: OK
or
✅ Email sent via SMTP to user@example.com: [messageId]
```

3. **Check email inbox:**
   - You should receive verification email
   - Click link to verify email
   - Account is activated ✅

---

## Understanding Email Flow

### ✅ Normal Flow (Brevo API Primary)
```
User registers
    ↓
Generate verification email
    ↓
Try Brevo API first → 📤 Success ✅
    ↓
Verification email sent instantly
```

### ⚠️ Fallback Flow (If API Fails)
```
User registers
    ↓
Generate verification email
    ↓
Try Brevo API → ❌ Fails (network, rate limit, etc.)
    ↓
Fallback to SMTP → 📧 Success ✅
    ↓
Verification email sent via SMTP
```

---

## Monitoring Emails

**Check What's Working:**
- Go to Vercel → Your Project → "Logs"
- Filter by timeframe
- Look for `📤 Attempting Brevo API` or `📧 Attempting SMTP Fallback`

**Log Messages Explained:**

| Message | Meaning |
|---------|---------|
| `📤 Attempting Brevo API` | Using primary email method |
| `✅ Email sent via Brevo API` | Email delivered via API ✅ |
| `⚠️ Brevo API failed` | API failed, trying SMTP |
| `📧 Attempting SMTP Fallback` | Using backup SMTP method |
| `✅ Email sent via SMTP` | Email delivered via SMTP ✅ |
| `❌ No email service available` | Both methods failed ❌ |

---

## Troubleshooting

### Error: "No email service available"
**Cause:** Both Brevo API and SMTP are failing
**Fix:** 
1. Check all env variables are set correctly in Vercel dashboard
2. Verify Brevo credentials are correct
3. Check Vercel logs for specific error

### Error: "Brevo API failed (401)"
**Cause:** Invalid API key
**Fix:**
1. Go to https://app.brevo.com/settings/keys/api
2. Copy correct API key
3. Update `BREVO_API_KEY` in Vercel environment variables
4. Redeploy

### Error: "SMTP Authentication failed"
**Cause:** Wrong SMTP credentials
**Fix:**
1. Go to https://app.brevo.com/settings/keys/smtp
2. Copy correct BREVO_SMTP_USER and BREVO_SMTP_PASSWORD
3. Update variables in Vercel
4. Redeploy

### Email arrives but with wrong sender
**Cause:** `SMTP_FROM` email not verified in Brevo
**Fix:**
1. Go to https://app.brevo.com/settings/senders
2. Add/verify `noreply@habeshanmarket.com`
3. Or use your verified email as sender

---

## Performance Comparison

| Method | Speed | Reliability | Cost |
|--------|-------|-------------|------|
| Brevo API | ⚡ Very Fast | ⭐⭐⭐⭐⭐ High | Free tier available |
| SMTP Relay | 📧 Medium | ⭐⭐⭐⭐ Good | Included with Brevo |

**Result:** Brevo API is primary because it's faster and more reliable on Vercel's serverless platform.

---

## Vercel-Specific Configuration

**Why Vercel for Backend?**
- ✅ Serverless functions (scale automatically)
- ✅ No server management needed
- ✅ Free tier includes 100GB bandwidth/month
- ✅ Auto-scaling for traffic spikes
- ✅ Built-in monitoring and logs
- ✅ Easy environment variable management

**Important Notes:**
- Vercel has 60-second timeout limit for functions
- For long operations, use background jobs (we have Bull email queue)
- Database connections should use connection pooling (Neon PgBouncer)

---

## What's Next?

After successful deployment:

1. ✅ Test email verification end-to-end
2. ✅ Test order confirmation emails
3. ✅ Test password reset emails
4. ✅ Monitor Brevo API usage at app.brevo.com
5. ✅ Set up email templates in Brevo for better tracking
6. ✅ Deploy frontend to Vercel
7. ✅ Update ALLOWED_ORIGINS with frontend URL
8. ✅ Test full user flow on production

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Backend directory set as root
- [ ] All environment variables added to Vercel
- [ ] Redeploy after adding variables
- [ ] Backend logs show email service initialized
- [ ] Test registration email sent successfully
- [ ] Update frontend API URL
- [ ] Deploy frontend
- [ ] End-to-end test on production

---

## Backend URL Format

Your backend will be accessible at:
```
https://your-project-name.vercel.app/api/[endpoint]
```

Example:
```
POST https://habeshan-backend.vercel.app/api/auth/register
```

**Update Frontend:**
```env
NEXT_PUBLIC_API_URL=https://habeshan-backend.vercel.app/api
```

---

## Support

For issues:
1. Check Vercel logs: `Deployments → Latest → Logs`
2. Check Brevo dashboard: https://app.brevo.com
3. Verify all environment variables are set
4. Test with curl:
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```
