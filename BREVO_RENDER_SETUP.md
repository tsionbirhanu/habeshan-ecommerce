# Brevo SMTP Setup for Render Deployment

## Problem You're Seeing

```
❌ Email transporter verification failed: connect ENETUNREACH 2607:f8b0:400e:c17::6c
```

This IPv6 error means the environment variables are NOT set correctly on Render.

## Solution: Set Render Environment Variables

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Select your backend service
3. Go to **Settings** → **Environment**

### Step 2: Add These Exact Variables

Copy-paste each one (do NOT include `BREVO_` prefix duplicates):

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tsionbirhanu08@gmail.com
SMTP_PASSWORD=xsmtpsib-9ca7e20eec74b9aedd11fbe0b1ed461a7737d7e4bc6ab0d4e6fa3f60dd34b7c4-cnubVYlKxWQ3DrXF
SMTP_FROM=noreply@habeshanmarket.com
EMAIL_FROM_NAME=Habeshan Mini Market
BREVO_API_KEY=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
FRONTEND_URL=http://localhost:3000
```

### Step 3: Deploy

After adding variables:
1. Go to **Deployments** tab
2. Click **Deploy latest** or create a new deployment
3. Wait for deployment to complete

### Step 4: Check Logs

Once deployed:
1. Click **Logs** tab
2. Look for these messages:
   - ✅ `✓ Email transporter verified and ready!` → WORKING
   - ❌ `❌ Email transporter verification failed:` → CHECK VARIABLES

## Troubleshooting

### Error: "Authentication failed"
- Verify Brevo SMTP credentials are correct
- Copy from: https://app.brevo.com/settings/keys/smtp

### Error: "ENETUNREACH IPv6"
- Variables are NOT set on Render
- Follow Step 2 above
- Redeploy after setting variables

### Error: "Connection refused"
- Check SMTP_HOST is exactly: `smtp-relay.brevo.com`
- Check SMTP_PORT is exactly: `587`

## Key Points

- ✅ Local dev uses `.env` file (working)
- ✅ Render MUST have environment variables set via dashboard
- ✅ Variables take effect AFTER redeploy
- ✅ Family: 4 (IPv4 only) is now enforced in code
- ✅ Connection timeout increased to 15 seconds

## Testing Email Verification

1. Register a new user on Render
2. Check logs for email sending status
3. Look for: `✅ Email sent via Brevo SMTP`
4. Check user's email inbox for verification email

## Quick Checklist

- [ ] All SMTP variables added to Render
- [ ] Render redeployed
- [ ] Backend logs show "Email transporter verified"
- [ ] Test registration email received
- [ ] User can verify email successfully

---

If still having issues, check Render logs and provide the full error message for debugging.
