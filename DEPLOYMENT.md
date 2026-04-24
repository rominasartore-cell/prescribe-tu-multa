# Prescribe Tu Multa - Deployment Guide

## Quick Start

This guide covers deploying to Render with Supabase PostgreSQL database.

### Step 1: Set up Supabase Database

1. Go to https://supabase.com and sign up (free tier available)
2. Create a new project
3. Go to Project Settings → Database → Connection string
4. Copy the PostgreSQL connection string (use "psql" version, replace [YOUR-PASSWORD] with your actual password)
5. Add `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres"
   ```

### Step 2: Run Migrations Locally

```bash
npm install
npx prisma db push
npx prisma db seed
```

### Step 3: Deploy to Render

1. Push code to GitHub
2. Go to https://render.com and sign up
3. Create new "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `npm install && npx prisma db push && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables** (from Project Settings):
     ```
     DATABASE_URL=postgresql://...
     NEXTAUTH_SECRET=your-secret-here
     NEXTAUTH_URL=https://your-render-url.onrender.com
     NODE_ENV=production
     ```
6. Add other API keys as needed (AWS, Anthropic, Mercado Pago, Resend, WhatsApp)

### Step 4: Connect Domain

1. In Render project settings, copy the URL (e.g., `prescribe-tu-multa.onrender.com`)
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Update DNS records:
   - **CNAME**: Point your domain to your Render URL
   - **TXT**: Add any verification records Render requires

### Step 5: Enable SSL

Render provides free SSL automatically once DNS is configured.

## Environment Variables Required

### Database
- `DATABASE_URL`: PostgreSQL connection string from Supabase

### Authentication
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your production domain

### AWS Services (for PDF storage)
- `AWS_REGION`: e.g., `us-east-1`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`: e.g., `prescribe-tu-multa-pdfs`

### Anthropic API (for data extraction)
- `ANTHROPIC_API_KEY`: Get from https://console.anthropic.com

### Mercado Pago (payments)
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_PUBLIC_KEY`
- `MERCADO_PAGO_NOTIFICATION_URL`: https://yourdomain.com/api/webhooks/mercado-pago

### Resend (email)
- `RESEND_API_KEY`: Get from https://resend.com
- `RESEND_FROM_EMAIL`: noreply@yourdomain.com
- `RESEND_SUPPORT_EMAIL`: support@yourdomain.com

### WhatsApp Business API
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`

### Application
- `NODE_ENV`: `production`
- `LOG_LEVEL`: `error` (for production)
- `PAYMENT_AMOUNT`: `19990` (CLP)
- `NEXT_PUBLIC_SITE_URL`: https://yourdomain.com
- `NEXT_PUBLIC_SUPPORT_EMAIL`: support@yourdomain.com

## Troubleshooting

### App won't load
- Check `DATABASE_URL` is correct
- Run `npx prisma db push` to verify schema

### Payments not working
- Verify Mercado Pago credentials
- Check webhook URL is accessible

### Emails not sending
- Verify Resend API key is valid
- Check email domain is verified in Resend

### PDF uploads failing
- Verify AWS credentials and bucket name
- Check S3 bucket has proper CORS settings
