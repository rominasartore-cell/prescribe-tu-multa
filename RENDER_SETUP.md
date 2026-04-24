# Render Deployment Setup

## Current Status
The application has a `render.yaml` blueprint configured, but the Render service needs to be recreated to apply this configuration.

## Steps to Deploy

### 1. Delete Current Service (on Render Dashboard)
1. Go to https://dashboard.render.com
2. Find the "prescribe-tu-multa" service
3. Click Settings → Delete Service
4. Confirm deletion

**Note:** This will remove the live site temporarily (5-10 minutes).

### 2. Reconnect GitHub to Render
1. Go to https://dashboard.render.com/blueprints
2. Click "New Blueprint Instance"
3. Select your GitHub repository: `rominasartore-cell/prescribe-tu-multa`
4. Select branch: `main` (or your deployment branch)
5. Render will auto-detect `render.yaml` and create the service with correct configuration

### 3. Configure Environment Variables
After the service is created, add these secrets:
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `AWS_ACCESS_KEY_ID` - Your AWS credentials
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret
- `AWS_S3_BUCKET` - Your S3 bucket name
- `AWS_REGION` - us-east-1 or your region
- `ANTHROPIC_API_KEY` - Your Claude API key
- `MERCADO_PAGO_ACCESS_TOKEN` - Your MP token
- `RESEND_API_KEY` - Your Resend API key
- `WHATSAPP_PHONE_ID` - Your WhatsApp business phone ID
- `WHATSAPP_ACCESS_TOKEN` - Your WhatsApp access token

### 4. Service Will Deploy
Render will:
- Clone your repository
- Run `npm install && npx prisma generate && npx prisma db push`
- Build with `npm run build`
- Start with `npm start`

The site should be live at: https://prescribe-tu-multa.onrender.com

## Troubleshooting

If you see "Host not in allowlist" after deployment:
- Check that service name in Render dashboard matches `prescribe-tu-multa` (with hyphens)
- Verify NEXTAUTH_URL environment variable is set
- Restart the service

## render.yaml Configuration Summary
- **Service Name:** prescribe-tu-multa
- **Build Command:** npm install && npx prisma generate && npx prisma db push && npm run build
- **Start Command:** npm start
- **Node Environment:** node
- **Plan:** starter

The `render.yaml` file is the source of truth for the service configuration.
