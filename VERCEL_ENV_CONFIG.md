# Configuración de Variables de Entorno en Vercel

**Fecha:** 2026-04-24  
**Status:** ✅ Actualizado para usar POSTGRES_PRISMA_URL  
**Problema Resuelto:** Database connection variable mismatch

---

## 🔧 CAMBIOS REALIZADOS

### ✅ Actualización de prisma/schema.prisma

```prisma
// ANTES:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// AHORA:
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

**Por qué:** Vercel proporciona automáticamente `POSTGRES_PRISMA_URL` cuando conectas una base de datos PostgreSQL. Esta es la variable recomendada por Vercel + Prisma.

---

## 📋 LISTA EXACTA DE VARIABLES REQUERIDAS

### Generadas automáticamente por Vercel (cuando conectas BD Postgres)

```
✅ POSTGRES_PRISMA_URL        → Connection string (pooled, para Prisma)
✅ POSTGRES_URL_NON_POOLING   → Connection string (direct, para migrations)
✅ POSTGRES_USER              → Username
✅ POSTGRES_PASSWORD          → Password (encrypted)
✅ POSTGRES_HOST              → Database hostname
✅ POSTGRES_DATABASE          → Database name
```

**Status:** No necesitas configurar estas manualmente - Vercel las crea automáticamente cuando conectas una BD.

---

### Variables que EL CÓDIGO REALMENTE USA (15 variables)

#### 1. NEXTAUTH_SECRET ⚠️ CRÍTICA
- **Tipo:** Privada (encriptada en Vercel)
- **Entornos:** Production, Preview, Development
- **Ejemplo:** `abc123def456ghi789jkl012mno345pq` (mín. 32 chars)
- **Generar:** `openssl rand -base64 32`
- **Qué falla:** Login/sesiones no funcionan
- **Dónde se usa:** `lib/auth.ts`

#### 2. NEXTAUTH_URL ⚠️ CRÍTICA
- **Tipo:** Privada
- **Production:** `https://prescribe-tu-multa.vercel.app`
- **Preview:** `https://...-{branch}...vercel.app`
- **Development:** `http://localhost:3000`
- **Qué falla:** Callbacks de auth fallan; redirects incorrectos
- **Dónde se usa:** `lib/auth.ts`, `app/layout.tsx`, `app/robots.ts`, etc.

#### 3. NEXTAUTH_SECRET + NEXTAUTH_URL
- **Archivos:** `lib/auth.ts` (NextAuth configuration)

#### 4. AWS_REGION
- **Valor:** `us-east-1` (no cambiar a menos que tengas S3 en otra región)
- **Qué falla:** S3 y Textract usan región incorrecta
- **Dónde se usa:** `lib/ocr.ts`

#### 5. AWS_S3_BUCKET
- **Valor:** `prescribe-tu-multa-pdfs`
- **Qué falla:** PDFs no se guardan o se guardan en bucket incorrecto
- **Dónde se usa:** `lib/ocr.ts`

#### 6. AWS_ACCESS_KEY_ID ⚠️ CRÍTICA (auto-gestionada por Vercel)
- **Tipo:** Privada (Vercel las maneja automáticamente si conectas AWS)
- **Qué falla:** S3 upload falla con 403
- **Nota:** Vercel maneja estas automáticamente en integración AWS

#### 7. AWS_SECRET_ACCESS_KEY ⚠️ CRÍTICA (auto-gestionada por Vercel)
- **Tipo:** Privada (Vercel las maneja automáticamente)
- **Qué falla:** AWS requests fallan
- **Nota:** Vercel maneja estas automáticamente en integración AWS

#### 8. RESEND_API_KEY ⚠️ CRÍTICA
- **Tipo:** Privada (encriptada)
- **Formato:** `re_` + caracteres
- **Qué falla:** No se envían emails
- **Dónde se usa:** `lib/email.ts`

#### 9. RESEND_FROM_EMAIL
- **Valor:** `noreply@prescribeulmulta.cl` (debe estar verificado en Resend)
- **Qué falla:** Email aparece como "from: undefined"
- **Dónde se usa:** `lib/email.ts`

#### 10. RESEND_SUPPORT_EMAIL
- **Valor:** `support@prescribeulmulta.cl`
- **Qué falla:** Support team no recibe notificaciones
- **Dónde se usa:** `lib/email.ts`

#### 11. CRON_SECRET ⚠️ CRÍTICA
- **Tipo:** Privada (encriptada)
- **Formato:** Token Bearer ~32-64 caracteres
- **Generar:** `openssl rand -base64 32`
- **Qué falla:** Cron jobs no se ejecutan (procesamiento de PDFs falla)
- **Dónde se usa:** `app/api/jobs/cron/route.ts`

#### 12. MERCADO_PAGO_ACCESS_TOKEN
- **Tipo:** Privada (encriptada, diferente para prod vs sandbox)
- **Production:** Token de producción
- **Preview/Dev:** Token sandbox
- **Qué falla:** Checkout no funciona; pagos no se procesan
- **Dónde se usa:** `lib/mercado-pago.ts`

#### 13. MERCADO_PAGO_NOTIFICATION_URL
- **Valor:** `https://prescribe-tu-multa.vercel.app/api/webhooks/mercado-pago`
- **Qué falla:** Webhooks de pago no llegan
- **Dónde se usa:** `lib/mercado-pago.ts`

#### 14. NEXT_PUBLIC_SUPPORT_EMAIL
- **Tipo:** Pública (visible en código compilado del cliente)
- **Valor:** `support@prescribeulmulta.cl`
- **Qué falla:** Landing page muestra email incorrecto
- **Dónde se usa:** `lib/email.ts`, landing page

#### 15. NODE_ENV
- **Production:** `production`
- **Preview/Dev:** `development`
- **Qué falla:** Logs no se filtran; comportamiento diferente
- **Nota:** Vercel lo configura automáticamente

---

### Variables NO usadas en el código (pero en .env.example)

Estas variables están en `.env.example` pero NO se usan en el código:
```
❌ ANTHROPIC_API_KEY        → NO USADA en código (fue planeada)
❌ WHATSAPP_*               → NO USADAS en código (fueron planeadas)
❌ MERCADO_PAGO_PUBLIC_KEY  → NO USADA en backend (solo frontend, no presente)
❌ PAYMENT_AMOUNT           → NO USADA en código actual
❌ LOG_LEVEL                → NO USADA en código
❌ NEXT_PUBLIC_SITE_URL     → NO USADA en código
❌ POSTGRES_URL             → Alternative (POSTGRES_PRISMA_URL es la usada)
```

---

## ✅ CHECKLIST PARA VERCEL PRODUCTION

### Auto-generadas (NO configurar manualmente)
- [x] POSTGRES_PRISMA_URL (Vercel genera automáticamente)
- [x] POSTGRES_URL_NON_POOLING (Vercel genera automáticamente)
- [x] POSTGRES_USER (Vercel genera automáticamente)
- [x] POSTGRES_PASSWORD (Vercel genera automáticamente)
- [x] POSTGRES_HOST (Vercel genera automáticamente)
- [x] POSTGRES_DATABASE (Vercel genera automáticamente)

### Debes configurar manualmente (15 variables)

**Autenticación (2):**
- [ ] NEXTAUTH_SECRET (generar: `openssl rand -base64 32`)
- [ ] NEXTAUTH_URL (`https://prescribe-tu-multa.vercel.app`)

**AWS (2):**
- [ ] AWS_REGION (`us-east-1`)
- [ ] AWS_S3_BUCKET (`prescribe-tu-multa-pdfs`)

**Email (3):**
- [ ] RESEND_API_KEY (obtener de https://resend.com)
- [ ] RESEND_FROM_EMAIL (`noreply@prescribeulmulta.cl`)
- [ ] RESEND_SUPPORT_EMAIL (`support@prescribeulmulta.cl`)

**Pagos (1):**
- [ ] MERCADO_PAGO_ACCESS_TOKEN (obtener de https://www.mercadopago.com - PRODUCTION token)
- [ ] MERCADO_PAGO_NOTIFICATION_URL (`https://prescribe-tu-multa.vercel.app/api/webhooks/mercado-pago`)

**Cron Jobs (1):**
- [ ] CRON_SECRET (generar: `openssl rand -base64 32`)

**Sitio (1):**
- [ ] NEXT_PUBLIC_SUPPORT_EMAIL (`support@prescribeulmulta.cl`)

**Runtime (1):**
- [ ] NODE_ENV (`production`) - Vercel configura esto automáticamente

**AWS Credentials (auto-gestionadas por Vercel si usas integración AWS):**
- AWS_ACCESS_KEY_ID (Vercel maneja automáticamente)
- AWS_SECRET_ACCESS_KEY (Vercel maneja automáticamente)

---

## 🔍 VERIFICAR EN VERCEL DASHBOARD

1. **Ir a:** Settings → Environment Variables
2. **Filtrar por:** PRODUCTION
3. **Verificar que existan:**
   ```
   ✓ NEXTAUTH_SECRET
   ✓ NEXTAUTH_URL
   ✓ POSTGRES_PRISMA_URL
   ✓ AWS_REGION
   ✓ AWS_S3_BUCKET
   ✓ RESEND_API_KEY
   ✓ RESEND_FROM_EMAIL
   ✓ RESEND_SUPPORT_EMAIL
   ✓ MERCADO_PAGO_ACCESS_TOKEN
   ✓ MERCADO_PAGO_NOTIFICATION_URL
   ✓ CRON_SECRET
   ✓ NEXT_PUBLIC_SUPPORT_EMAIL
   ```

---

## 🚀 PRÓXIMOS PASOS

1. **Commit la actualización de Prisma:**
   ```bash
   git add prisma/schema.prisma
   git commit -m "Fix: Use POSTGRES_PRISMA_URL for Vercel database connection"
   git push origin claude/legal-tech-platform-xjOsf
   ```

2. **Trigger nuevo deploy en Vercel con:**
   ```powershell
   vercel deploy --prod --force
   ```

3. **El error "Database not connected" debería desaparecer** porque Prisma ahora usará la variable correcta que Vercel proporciona.

---

## ❓ FAQ

**P: ¿Por qué "Database not connected" durante build?**  
R: Next.js build es static, no necesita conexión DB. Es solo un warning. Desaparece en runtime.

**P: ¿Qué pasa si olvido configurar una variable?**  
R: Depende de la variable:
- NEXTAUTH_SECRET/URL → Login falla (Error 500)
- POSTGRES_PRISMA_URL → Ya auto-configurada por Vercel
- RESEND_API_KEY → Emails no se envían
- CRON_SECRET → PDFs no se procesan
- MERCADO_PAGO → Pagos fallan

**P: ¿Puedo usar DATABASE_URL en lugar de POSTGRES_PRISMA_URL?**  
R: No. Vercel no genera DATABASE_URL. Debes usar POSTGRES_PRISMA_URL que Vercel crea automáticamente.

**P: ¿Las variables AWS_ACCESS_KEY_ID se configuran manualmente?**  
R: Vercel las maneja automáticamente si usas su integración AWS. Si no, necesitas configurarlas manualmente.

---

_Auditoría completada: 2026-04-24_  
_Cambios: prisma/schema.prisma actualizado_
