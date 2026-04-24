# Prescribe Tu Multa - Setup Guide

## Overview

Prescribe Tu Multa is a legal-tech platform for analyzing Chilean traffic fines. This guide covers all setup steps.

## Architecture

- **Frontend**: Next.js 14 with React 18
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3
- **AI Extraction**: Anthropic Claude 3.5 Sonnet
- **Payments**: Mercado Pago (Chile)
- **Email**: Resend
- **Notifications**: WhatsApp Business API

## Prerequisites

- Node.js 18+ and npm
- GitHub account for deployment
- Credit card (for Supabase, AWS, Render, etc.)

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/rominasartore-cell/prescribe-tu-multa.git
cd prescribe-tu-multa
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add these minimum values for local testing:

```env
# Database (use Supabase or local PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/prescribe-tu-multa"

# Authentication
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# AWS (placeholder for local development)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA_placeholder"
AWS_SECRET_ACCESS_KEY="placeholder"
AWS_S3_BUCKET="prescribe-tu-multa-pdfs"

# Anthropic API
ANTHROPIC_API_KEY="sk-ant-placeholder"

# Mercado Pago (Chile)
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-placeholder"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-placeholder"
MERCADO_PAGO_NOTIFICATION_URL="http://localhost:3000/api/webhooks/mercado-pago"

# Resend Email
RESEND_API_KEY="re_placeholder"
RESEND_FROM_EMAIL="noreply@prescribeulmulta.cl"
RESEND_SUPPORT_EMAIL="support@prescribeulmulta.cl"

# Application
NODE_ENV="development"
PAYMENT_AMOUNT="19990"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Set Up Database

#### Option A: Using Supabase (Recommended)

1. Sign up at https://supabase.com
2. Create new project
3. Copy PostgreSQL connection string
4. Update `DATABASE_URL` in `.env.local`
5. Run migrations:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

#### Option B: Using Docker (Local PostgreSQL)

```bash
# Start PostgreSQL container
docker-compose up -d

# Run migrations
npx prisma db push

# Seed test data
npx prisma db seed
```

### 4. Run Dev Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Test Locally

**Home Page**: http://localhost:3000
- Check all sections render correctly
- Verify links work

**Register**: http://localhost:3000/auth/register
- Create account with test@example.com / password123
- Verify form validation

**Login**: http://localhost:3000/auth/login
- Login with created account
- Should redirect to /dashboard

**Dashboard**: http://localhost:3000/dashboard
- Should show "No multas" message initially
- Test PDF upload will fail without AWS credentials (expected)

**Legal Pages**:
- http://localhost:3000/legal/terms
- http://localhost:3000/legal/privacy

## Production Deployment

### 1. Set Up Supabase (Production Database)

1. Create separate Supabase project for production
2. Get PostgreSQL connection string
3. Ensure it includes password in URL

### 2. Deploy to Render

1. Push code to GitHub (`main` branch)
2. Sign up at https://render.com
3. Create new "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: prescribe-tu-multa
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: 
     ```
     npm install && npx prisma db push && npm run build
     ```
   - **Start Command**: `npm start`
6. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://prescribe-tu-multa.onrender.com
   NODE_ENV=production
   (Add other API keys from .env.example)
   ```
7. Click "Deploy"
8. Wait for build to complete (~5-10 minutes)

### 3. Get Render URL

After successful deployment:
- Render will provide URL: `https://prescribe-tu-multa.onrender.com`
- Test: Visit the URL in browser, should see home page

### 4. Connect Custom Domain

#### At Render (App Settings)
- Add custom domain: `prescribeulmulta.cl`
- Copy DNS records provided

#### At Domain Registrar (GoDaddy, Namecheap, etc.)
- Update DNS records:
  - **CNAME**: Point `www.prescribeulmulta.cl` to Render URL
  - **A Record**: Or add root domain redirect
- Wait for DNS to propagate (5-30 minutes)

### 5. Enable SSL

Render provides free SSL automatically once DNS is connected.

### 6. Complete Environment Setup

Add remaining API keys in Render dashboard:

**AWS Services**:
1. Create AWS account (free tier available)
2. Create S3 bucket for PDF storage
3. Create IAM user with S3 access
4. Add credentials to Render

**Anthropic API**:
1. Get API key from https://console.anthropic.com
2. Add to Render environment

**Mercado Pago**:
1. Sign up at https://www.mercadopago.cl
2. Enable webhook notifications
3. Set webhook URL to: `https://prescribeulmulta.cl/api/webhooks/mercado-pago`
4. Add credentials to Render

**Resend Email**:
1. Sign up at https://resend.com
2. Verify domain `prescribeulmulta.cl`
3. Add API key to Render

**WhatsApp Business API** (Optional):
1. Apply for WhatsApp Business API
2. Add business account ID and tokens to Render

## Testing Production

### 1. Test Home Page
```
https://prescribeulmulta.cl
```
Should show landing page.

### 2. Register
```
https://prescribeulmulta.cl/auth/register
Create test account
```

### 3. Login
```
https://prescribeulmulta.cl/auth/login
Login with test account
```

### 4. Upload PDF
```
https://prescribeulmulta.cl/dashboard/new
Drag and drop a PDF (or upload any PDF file)
```
(Will show extraction result if AI is configured)

### 5. View Result
```
https://prescribeulmulta.cl/dashboard
Should show uploaded multa
Click to see details and purchase button
```

### 6. Test Payment (Optional)
- Use Mercado Pago test mode for testing
- Click "Pagar con Mercado Pago"
- Use Mercado Pago test credentials

## Troubleshooting

### Build Fails
Check Render build logs for errors:
- Missing environment variables
- Database connection failed
- Prisma migration failed

### Page Returns 500
Check Render logs:
```
Render Dashboard → App Logs
```

### Database Connection Error
1. Verify DATABASE_URL is correct
2. Check Supabase IP whitelist (allow all IPs)
3. Test connection:
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

### API Key Errors
1. Verify each key is correct
2. Check if service is enabled in account
3. Add `console.log()` to debug which key is missing

### Payment Not Working
1. Verify Mercado Pago credentials
2. Check webhook URL is accessible
3. Test with Mercado Pago sandbox mode

### Email Not Sending
1. Verify Resend API key
2. Check from email is verified in Resend
3. Verify recipient email is correct

## Monitoring

Monitor health check:
```
https://prescribeulmulta.cl/api/health
```
Should return `{"status":"ok"}`

## Next Steps

1. ✅ Local development working
2. ✅ Deploy to Render
3. ✅ Connect domain
4. Get API keys and complete integration
5. Announce publicly

## Support

For issues, check logs at:
- Local: Terminal where `npm run dev` runs
- Production: Render Dashboard → App Logs

## Security

- NEVER commit `.env.local` to git
- Use strong `NEXTAUTH_SECRET`
- Keep API keys confidential
- Enable 2FA on all service accounts
- Regularly review Render logs for suspicious activity
