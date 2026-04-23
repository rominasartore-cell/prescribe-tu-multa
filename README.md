# Prescribe Tu Multa

Legal-tech platform for analyzing Chilean traffic fines (multas) and determining their prescription status with automated legal document generation.

## Features

- **Free Preliminary Analysis**: Upload your RMNP certificate and instantly see RUT, license plate, amount, and prescription status
- **AI-Powered Extraction**: AWS Textract + Claude 3.5 Sonnet for accurate data extraction from PDF certificates
- **Prescription Calculation**: Automatic 3-year prescription timeline per Chilean law
- **Legal Documents**: Generate professional PDF analysis + DOCX judicial documents ($19.990 CLP)
- **Multi-Channel Delivery**: Results via email and WhatsApp
- **Secure Processing**: End-to-end encryption, GDPR-compliant data handling
- **Production-Ready**: Single-vendor deployment on Vercel, PostgreSQL, AWS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, NextAuth.js
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **AI/ML**: Anthropic Claude 3.5 Sonnet API
- **OCR**: AWS Textract
- **Storage**: AWS S3 (encrypted)
- **Payment**: Mercado Pago API (native to Chile)
- **Email**: Resend
- **Messaging**: WhatsApp Business API
- **Document Generation**: PDFKit (PDF), docx (Word)
- **Deployment**: Vercel (serverless)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS Account (for Textract & S3)
- Anthropic API key
- Mercado Pago merchant account
- Resend account

### Local Setup

```bash
# Clone and install
git clone <repo>
cd prescribe-tu-multa
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start database
docker-compose up -d

# Run migrations
npx prisma db push

# Seed test data (optional)
npx prisma db seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

### Test Credentials

- Email: `test@example.com`
- Password: `password123`

## API Endpoints

### Authentication

```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "phone": "+56912345678"
}

# NextAuth.js handles /api/auth/[...nextauth]
```

### Upload & Analysis

```bash
POST /api/upload
Content-Type: multipart/form-data
{
  "file": <PDF>
}

Response:
{
  "success": true,
  "multa": {
    "id": "uuid",
    "rut": "12345678-9",
    "patente": "ABC-1234",
    "monto": 450000,
    "estado": "PRESCRITA",
    "diasRestantes": 0
  }
}
```

### Get Multas

```bash
GET /api/multas
Authorization: Bearer <jwt>

Response:
{
  "success": true,
  "multas": [
    {
      "id": "uuid",
      "rut": "12345678-9",
      "patente": "ABC-1234",
      "monto": 450000,
      "estado": "PRESCRITA",
      "pagado": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Generate Documents

```bash
# PDF (requires payment)
GET /api/generate/pdf?multaId=uuid
Authorization: Bearer <jwt>
-> Returns PDF file

# DOCX (requires payment)
GET /api/generate/docx?multaId=uuid
Authorization: Bearer <jwt>
-> Returns Word document
```

### Create Payment Preference

```bash
POST /api/checkout/create-preference
{
  "multaId": "uuid"
}

Response:
{
  "success": true,
  "init_point": "https://www.mercadopago.com/checkout/..."
}
```

## Database Schema

```
User
  - id (PK)
  - email (unique)
  - password (hashed)
  - phone
  - rut
  - createdAt, updatedAt

Multa
  - id (PK)
  - userId (FK)
  - rut, patente, monto, articulo
  - fechaIngreso, fechaPrescripcion, estado
  - diasRestantes
  - pdfOriginalUrl, pdfTextUrl
  - documentoPdfUrl, documentoDocxUrl
  - pagado (boolean)
  - createdAt, updatedAt

Pago
  - id (PK)
  - multaId (unique FK)
  - userId (FK)
  - monto (19990 CLP)
  - mercadoPagoId
  - estado
  - createdAt, updatedAt

Notificacion
  - id (PK)
  - multaId (FK, nullable)
  - userId (FK)
  - tipo (EMAIL|WHATSAPP|SMS)
  - destinatario
  - mensaje, asunto
  - estado
  - intentos
  - proximoIntento
  - createdAt, updatedAt

AuditLog
  - id (PK)
  - userId (FK, nullable)
  - accion, recurso, recursoId
  - detalles, ipAddress, userAgent
  - createdAt
```

## Prescription Logic

Multas in Chile prescribe in **3 years** from RMNP entry date.

```
Formula:
prescriptionDate = fechaIngreso + 3 years
isPrescribed = today > prescriptionDate
diasRestantes = prescriptionDate - today
```

## Deployment

### Vercel (Recommended)

```bash
# Connect GitHub and deploy
vercel deploy --prod

# Set environment variables in Vercel dashboard
```

### Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

See `.env.example` for complete list (30+ variables including AWS, Anthropic, Mercado Pago, email, WhatsApp).

## Security

- Passwords: bcryptjs (12 salt rounds)
- Sessions: JWT with NextAuth.js
- Database: Encrypted (AES-256 at rest, TLS in transit)
- Files: AWS S3 with signed URLs, auto-delete after 90 days
- API: CORS, rate limiting, input validation with Zod

## Legal Notes

- **NOT legal advice**: Platform is informational. Users must consult lawyers.
- **No warranty**: Provided "as-is" without guarantees
- **Data protection**: ARCO rights under Chilean Law 19.628
- **Terms & Privacy**: See `/legal/terms` and `/legal/privacy`

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Type check
npm run type-check
```

## Scripts

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm start             # Start production server
npm run lint          # ESLint
npm run type-check    # TypeScript check
npm test              # Run tests
npm run db:push       # Prisma schema sync
npm run db:seed       # Seed test data
```

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit: `git commit -m "Add feature"`
3. Push: `git push origin feature/my-feature`
4. Create pull request

## Support

- Email: `support@prescribetumlta.cl`
- GitHub Issues: Report bugs here
- Documentation: See full docs in-app

## License

Proprietary. All rights reserved © 2024 Prescribe Tu Multa.

---

**Built with ❤️ for Chilean drivers. Prescription dates matter.**
