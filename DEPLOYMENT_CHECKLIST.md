# Prescribe Tu Multa - Deployment Checklist

## Pre-Deployment Security Checklist

### Environment & Secrets
- [ ] All environment variables set in `.env.local` (locally) or deployment platform
- [ ] `NEXTAUTH_SECRET` is 32+ random characters (generate: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] AWS credentials have minimal IAM permissions (Textract, S3 only)
- [ ] Mercado Pago credentials are production keys (not sandbox)
- [ ] API keys rotate every 90 days
- [ ] No credentials in Git history (check: `git log -p`)
- [ ] `.env.local` is in `.gitignore`

### Database
- [ ] PostgreSQL version 14+ running
- [ ] Migrations applied: `npx prisma db push`
- [ ] Seed data loaded: `npx prisma db seed`
- [ ] Backups configured (daily)
- [ ] Connection string uses SSL/TLS
- [ ] Database user has minimal permissions
- [ ] Max connections set appropriately
- [ ] Indices created on userId, estado, createdAt

### AWS Configuration
- [ ] S3 bucket created with versioning
- [ ] S3 encryption enabled (AES-256)
- [ ] S3 lifecycle policy (auto-delete after 90 days)
- [ ] S3 blocks public access
- [ ] Textract IAM role configured
- [ ] CORS policy set for S3 access
- [ ] CloudFront CDN in front of S3 (optional but recommended)

### SSL/TLS
- [ ] SSL certificate acquired (LetsEncrypt or commercial)
- [ ] Certificate covers domain and www subdomain
- [ ] Certificate renewal automated (LetsEncrypt auto-renew)
- [ ] TLS 1.2+ enforced
- [ ] HSTS header enabled (Strict-Transport-Security)

## Functionality Checklist

### Authentication
- [ ] Registration works: POST /api/auth/register
- [ ] Login works: POST /api/auth/callback/credentials
- [ ] Logout clears session
- [ ] Passwords hashed with bcryptjs (12 rounds)
- [ ] JWT tokens expire after 30 days
- [ ] CSRF protection enabled

### File Upload & Processing
- [ ] PDF upload to S3 succeeds
- [ ] AWS Textract extracts text from PDF
- [ ] Claude API receives extracted text
- [ ] AI extracts RUT, patente, monto correctly
- [ ] Validation rejects invalid data
- [ ] Prescription date calculated correctly (3 years)
- [ ] Multa record created in database

### Prescription Logic
- [ ] 3-year calculation: fechaIngreso + 3 years = fechaPrescripcion
- [ ] Status: today > fechaPrescripcion = PRESCRITA
- [ ] diasRestantes calculated correctly
- [ ] Edge cases tested (leap years, boundary dates)

### Payment Flow
- [ ] Mercado Pago preference created correctly
- [ ] Payment link redirects to MP checkout
- [ ] Webhook signature verification passes
- [ ] Payment updates multa.pagado = true
- [ ] Payment record created in Pago table

### Document Generation
- [ ] PDF generated with correct data
- [ ] DOCX generated with judicial format
- [ ] Documents uploaded to S3
- [ ] Download links functional
- [ ] Payment gate (403) enforced
- [ ] PDF includes prescription status
- [ ] DOCX includes legal reasoning

### Notifications
- [ ] Preliminary result emails sent
- [ ] WhatsApp notifications sent (if phone provided)
- [ ] Email templates formatted correctly
- [ ] Retry logic works (max 3 attempts)
- [ ] Notification status tracked in database

### Dashboard
- [ ] Authenticated users see their multas
- [ ] Status badges display correctly (green/red)
- [ ] Ownership verification prevents access to other users' data
- [ ] Upload form accepts PDF files
- [ ] File size limit enforced (50MB)

## Performance Checklist

### Response Times
- [ ] Homepage loads in <2s
- [ ] Upload API responds in <5s
- [ ] PDF generation completes in <10s
- [ ] Dashboard list renders in <1s

### Database
- [ ] Indices on userId, estado, createdAt exist
- [ ] Query EXPLAIN ANALYZE shows index usage
- [ ] Connection pooling configured
- [ ] Slow queries monitored

### Frontend
- [ ] Lighthouse score >85 (desktop)
- [ ] Lighthouse score >75 (mobile)
- [ ] Images optimized (Next.js Image component)
- [ ] CSS is minified
- [ ] JavaScript is minified
- [ ] Code splitting working

### Caching
- [ ] API responses cached (30s for safe endpoints)
- [ ] Static assets cached (1 year)
- [ ] CloudFront/CDN caching configured
- [ ] Cache invalidation working

## Monitoring & Logging

### Error Tracking
- [ ] Sentry (or similar) configured
- [ ] Console errors logged
- [ ] API errors logged with context
- [ ] Email/WhatsApp failures logged

### Analytics
- [ ] Google Analytics configured
- [ ] Events tracked (signup, upload, payment)
- [ ] Funnels visualized
- [ ] Conversion rates monitored

### Uptime Monitoring
- [ ] Uptime.com (or similar) configured
- [ ] Alerts on 500 errors
- [ ] Alerts on timeouts >5s
- [ ] Alerts on failed webhook processing

### Logging
- [ ] Audit logs created for:
  - [ ] User registration
  - [ ] PDF uploads
  - [ ] Multa creation
  - [ ] Payment processing
  - [ ] Document generation
  - [ ] Data access (by userId)

## Compliance & Legal

### Data Protection
- [ ] GDPR compliance (if EU users)
- [ ] ARCO rights (Chilean Law 19.628)
  - [ ] Access: Users can request their data
  - [ ] Rectification: Users can correct data
  - [ ] Cancellation: Users can request deletion
  - [ ] Opposition: Users can opt-out of marketing
- [ ] Data deletion workflow implemented
- [ ] Data export functionality (JSON/CSV)

### Terms & Privacy
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Disclaimer about legal advice
- [ ] Warranty limitations documented
- [ ] No warranty clause included

### Payment Compliance
- [ ] PCI DSS: Payment processing done via Mercado Pago (no card data stored)
- [ ] Invoices generated and stored
- [ ] Tax ID on receipts (if applicable)

## Testing Checklist

### Unit Tests
- [ ] Validator tests pass: `npm test -- validator.test`
- [ ] Prescription tests pass: `npm test -- prescription.test`
- [ ] All edge cases tested

### Integration Tests
- [ ] Registration → Login flow works
- [ ] Upload → Analysis → Result flow works
- [ ] Payment → Document generation flow works
- [ ] User isolation verified (can't access other users' data)

### E2E Tests
- [ ] Register with new email
- [ ] Login with credentials
- [ ] Upload sample RMNP PDF
- [ ] Verify preliminary result
- [ ] Purchase documents ($19.990)
- [ ] Download PDF
- [ ] Download DOCX
- [ ] Receive email with documents

### Security Tests
- [ ] SQL injection attempts blocked
- [ ] XSS payloads escaped
- [ ] CSRF tokens validated
- [ ] API auth required for protected routes
- [ ] Ownership checks prevent unauthorized access
- [ ] Rate limiting enforced

## Deployment Steps

### Vercel Deployment
```bash
# 1. Connect repo to Vercel
vercel link

# 2. Set environment variables in Vercel dashboard
# (DATABASE_URL, NEXTAUTH_SECRET, AWS_*, ANTHROPIC_API_KEY, etc)

# 3. Deploy
vercel deploy --prod

# 4. Verify
curl https://yourdomain.com/api/health
```

### Docker Deployment
```bash
# 1. Build image
docker-compose -f docker-compose.prod.yml build

# 2. Run
docker-compose -f docker-compose.prod.yml up -d

# 3. Setup SSL certificates
# Copy cert.pem and key.pem to ./certs/

# 4. Verify
curl https://yourdomain.com/api/health
```

## Post-Deployment

### Smoke Tests
- [ ] Homepage loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] Can upload PDF
- [ ] Can see preliminary result
- [ ] Can purchase documents
- [ ] Can download PDF
- [ ] Can download DOCX

### DNS & Domain
- [ ] Domain DNS points to correct IP
- [ ] www subdomain configured
- [ ] Email verification records (SPF, DKIM, DMARC)
- [ ] SSL certificate valid

### Monitoring Enabled
- [ ] Logs accessible
- [ ] Error alerts configured
- [ ] Performance metrics visible
- [ ] Uptime monitor active

### Backup Verification
- [ ] Database backup completed
- [ ] Backup restoration tested
- [ ] Backup frequency: daily
- [ ] Retention: 30 days

## Maintenance

### Regular Tasks
- [ ] Security updates applied (npm audit --fix)
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Log rotation configured
- [ ] SSL certificate renewal (60 days before expiry)
- [ ] Database backups verified (monthly restore test)

### Monitoring
- [ ] Error rates reviewed weekly
- [ ] Performance metrics reviewed weekly
- [ ] User feedback collected
- [ ] Security patches applied immediately

---

**Last Updated**: April 23, 2024
**Status**: Pre-Production Checklist - 100+ items
