# Auditoría Completa de Variables de Entorno - Prescribe Tu Multa

**Fecha:** 2026-04-24  
**Estado:** Todas las variables requeridas para funcionamiento básico

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Total | Privadas | Públicas | Críticas |
|-----------|-------|----------|----------|----------|
| **Autenticación** | 2 | 2 | 0 | 2 |
| **Base de Datos** | 1 | 1 | 0 | 1 |
| **AWS (OCR/Archivos)** | 4 | 3 | 1 | 3 |
| **Inteligencia Artificial** | 1 | 1 | 0 | 1 |
| **Pagos** | 3 | 1 | 2 | 2 |
| **Email** | 3 | 1 | 2 | 2 |
| **WhatsApp** | 4 | 3 | 1 | 0 |
| **Cron Jobs** | 1 | 1 | 0 | 1 |
| **Sitio** | 3 | 0 | 3 | 2 |
| **Node** | 2 | 0 | 2 | 0 |
| **TOTAL** | **24** | **13 privadas** | **11 públicas** | **14 críticas** |

---

## 🔐 VARIABLES CRÍTICAS (Necesarias para Funcionamiento Básico)

### 1. AUTENTICACIÓN

#### NEXTAUTH_SECRET
- **Nombre exacto:** `NEXTAUTH_SECRET`
- **Tipo:** Privada (no NEXT_PUBLIC_)
- **Ambientes:** Production, Preview, Development
- **Formato:** String alfanumérico, mínimo 32 caracteres
- **Ejemplo:** `abc123def456ghi789jkl012mno345pq`
- **Generador:** `openssl rand -base64 32`
- **Qué falla:** Login/registro no funciona; sesiones se pierden; error 401 en rutas autenticadas
- **Dónde se usa:** NextAuth.js para encripción de JWT

#### NEXTAUTH_URL
- **Nombre exacto:** `NEXTAUTH_URL`
- **Tipo:** Privada
- **Ambientes:** Production (https://...vercel.app), Preview (https://...-branch...vercel.app), Development (http://localhost:3000)
- **Formato:** URL completa con protocolo
- **Ejemplo Production:** `https://prescribe-tu-multa.vercel.app`
- **Ejemplo Development:** `http://localhost:3000`
- **Qué falla:** Callbacks de autenticación fallan; redirect incorrecto después de login; CORS errors
- **Dónde se usa:** `lib/auth.ts` en callbacks de NextAuth

---

### 2. BASE DE DATOS

#### DATABASE_URL
- **Nombre exacto:** `DATABASE_URL`
- **Tipo:** Privada
- **Ambientes:** Production, Preview, Development
- **Formato:** `postgresql://username:password@host:port/database`
- **Ejemplo:** `postgresql://user:pass@db.supabase.co:5432/postgres?schema=public`
- **Qué falla:** Toda operación DB: no guarda solicitudes, no lee multas, no autentica usuarios
- **Dónde se usa:** `lib/db.ts` (Prisma connection string)
- **Nota:** Supabase/PostgreSQL requerido

---

### 3. AWS SERVICES (Almacenamiento y OCR de PDFs)

#### AWS_ACCESS_KEY_ID
- **Nombre exacto:** `AWS_ACCESS_KEY_ID`
- **Tipo:** Privada
- **Ambientes:** Production, Preview, Development
- **Formato:** String ~20 caracteres (AKIA...)
- **Ejemplo:** `AKIAIOSFODNN7EXAMPLE`
- **Qué falla:** No se pueden subir PDFs a S3; upload falla con 403
- **Dónde se usa:** Subida de archivos en `/api/upload`
- **Nota:** Crear en AWS IAM, NO usar root credentials

#### AWS_SECRET_ACCESS_KEY
- **Nombre exacto:** `AWS_SECRET_ACCESS_KEY`
- **Tipo:** Privada
- **Ambientes:** Production, Preview, Development
- **Formato:** String ~40 caracteres
- **Qué falla:** S3 authentication falla; PDFs no se guardan
- **Dónde se usa:** AWS SDK en upload y Textract

#### AWS_REGION
- **Nombre exacto:** `AWS_REGION`
- **Tipo:** Privada (aunque técnicamente podría ser pública)
- **Ambientes:** Production, Preview, Development
- **Formato:** `us-east-1`, `us-west-2`, etc.
- **Ejemplo:** `us-east-1`
- **Qué falla:** S3 usa región incorrecta; conexión a Textract falla
- **Dónde se usa:** AWS SDK configuration

#### AWS_S3_BUCKET
- **Nombre exacto:** `AWS_S3_BUCKET`
- **Tipo:** Privada (aunque el nombre es público)
- **Ambientes:** Production, Preview, Development
- **Formato:** `bucket-name-lowercase`
- **Ejemplo:** `prescribe-tu-multa-pdfs`
- **Qué falla:** PDFs se guardan en bucket incorrecto o falta
- **Dónde se usa:** Upload API, job de procesamiento

---

### 4. INTELIGENCIA ARTIFICIAL

#### ANTHROPIC_API_KEY
- **Nombre exacto:** `ANTHROPIC_API_KEY`
- **Tipo:** Privada
- **Ambientes:** Production, Preview, Development
- **Formato:** `sk-ant-` + caracteres
- **Ejemplo:** `sk-ant-v7-...`
- **Qué falla:** Análisis de PDFs no funciona; no se extraen datos de multas; job de procesamiento falla
- **Dónde se usa:** `jobs/process-solicitud.ts` para extraer datos del PDF con Claude
- **Nota:** Necesita acceso a Claude 3.5 Sonnet

---

### 5. PAGOS (Mercado Pago)

#### MERCADO_PAGO_ACCESS_TOKEN
- **Nombre exacto:** `MERCADO_PAGO_ACCESS_TOKEN`
- **Tipo:** Privada
- **Ambientes:** Production (token prod), Preview (token sandbox), Development (token sandbox)
- **Formato:** Token largo ~150 caracteres
- **Ejemplo:** `APP_USR-123456789...`
- **Qué falla:** Checkout no funciona; pagos no se procesan; webhook no autentica
- **Dónde se usa:** `app/api/checkout/create-preference` y webhook handler

#### MERCADO_PAGO_PUBLIC_KEY
- **Nombre exacto:** `MERCADO_PAGO_PUBLIC_KEY`
- **Tipo:** Pública (pero recomendable como privada en algunos contextos)
- **Ambientes:** Production, Preview, Development
- **Formato:** `APP_USR-...` o `APP_USR_...`
- **Qué falla:** Frontend no puede comunicar con Mercado Pago; form de pago no inicializa
- **Dónde se usa:** Frontend para Mercado Pago SDK

#### MERCADO_PAGO_NOTIFICATION_URL
- **Nombre exacto:** `MERCADO_PAGO_NOTIFICATION_URL`
- **Tipo:** Privada (pero contiene URL pública)
- **Ambientes:** Production (`https://prescribe-tu-multa.vercel.app/api/webhooks/mercado-pago`), Preview, Development
- **Formato:** URL completa HTTPS
- **Qué falla:** Webhooks de pago no llegan; no se sabe si pago fue aprobado
- **Dónde se usa:** Configuración en dashboard Mercado Pago

---

### 6. EMAIL (Resend)

#### RESEND_API_KEY
- **Nombre exacto:** `RESEND_API_KEY`
- **Tipo:** Privada
- **Ambientes:** Production, Preview, Development
- **Formato:** `re_` + caracteres
- **Ejemplo:** `re_abc123...`
- **Qué falla:** No se envían emails de confirmación; usuario no recibe notificaciones
- **Dónde se usa:** `lib/email.ts` en todas las funciones de email

#### RESEND_FROM_EMAIL
- **Nombre exacto:** `RESEND_FROM_EMAIL`
- **Tipo:** Privada (aunque es un email visible)
- **Ambientes:** Production, Preview, Development
- **Formato:** `noreply@prescribeulmulta.cl` (debe ser verificado en Resend)
- **Qué falla:** Emails aparecen como "from: undefined"; no se marcan como de confianza
- **Dónde se usa:** Header "From" en todos los emails

#### RESEND_SUPPORT_EMAIL
- **Nombre exacto:** `RESEND_SUPPORT_EMAIL`
- **Tipo:** Privada
- **Ambientes:** Production, Preview, Development
- **Formato:** `support@prescribeulmulta.cl`
- **Qué falla:** Support no recibe notificaciones de nuevas solicitudes
- **Dónde se usa:** Notificación interna cuando usuario envía formulario

---

### 7. SEGURIDAD - CRON JOBS

#### CRON_SECRET
- **Nombre exacto:** `CRON_SECRET`
- **Tipo:** Privada
- **Ambientes:** Production, Preview, Development
- **Formato:** Token Bearer ~32-64 caracteres
- **Ejemplo:** `sk_test_abc123...`
- **Generador:** `openssl rand -base64 32`
- **Qué falla:** Cron job rechaza requests no autenticadas; PDFs nunca se procesan
- **Dónde se usa:** `app/api/jobs/cron/route.ts` para validar Bearer token

---

### 8. SITIO (Frontend)

#### NEXT_PUBLIC_SITE_URL
- **Nombre exacto:** `NEXT_PUBLIC_SITE_URL`
- **Tipo:** Pública (visible en frontend)
- **Ambientes:** Production (`https://prescribeulmulta.cl` o `https://prescribe-tu-multa.vercel.app`), Preview, Development (`http://localhost:3000`)
- **Formato:** URL completa
- **Qué falla:** Links en emails apuntan a dominio incorrecto; compartir links no funciona
- **Dónde se usa:** URLs en emails, og:url, sitemap

#### NEXT_PUBLIC_SUPPORT_EMAIL
- **Nombre exacto:** `NEXT_PUBLIC_SUPPORT_EMAIL`
- **Tipo:** Pública (visible en frontend)
- **Ambientes:** Production, Preview, Development
- **Formato:** `support@prescribeulmulta.cl`
- **Qué falla:** Landing page muestra email incorrecto; usuario no sabe a quién contactar
- **Dónde se usa:** Landing page, footer, formulario

#### PAYMENT_AMOUNT
- **Nombre exacto:** `PAYMENT_AMOUNT`
- **Tipo:** Privada (aunque es público el monto)
- **Ambientes:** Production, Preview, Development
- **Formato:** Número entero en CLP
- **Ejemplo:** `19990`
- **Qué falla:** Checkout muestra monto incorrecto; pago con monto equivocado
- **Dónde se usa:** `app/api/checkout/create-preference`

---

### 9. NODE.JS RUNTIME

#### NODE_ENV
- **Nombre exacto:** `NODE_ENV`
- **Tipo:** Pública
- **Ambientes:** Production (`production`), Preview (`development`), Development (`development`)
- **Formato:** `production` | `development`
- **Qué falla:** Logs no se filtran correctamente; comportamiento diferente
- **Nota:** Vercel lo configura automáticamente

#### LOG_LEVEL
- **Nombre exacto:** `LOG_LEVEL`
- **Tipo:** Privada
- **Ambientes:** Production (`error`), Preview (`warn`), Development (`debug`)
- **Formato:** `debug` | `info` | `warn` | `error`
- **Qué falla:** Logs demasiado verbosos en prod; errores no se ven en dev
- **Dónde se usa:** System logging

---

## ⚠️ VARIABLES OPCIONALES (No-críticas)

### WhatsApp Business API (Para notificaciones SMS)
```
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN
WHATSAPP_VERIFY_TOKEN
```
**Estado:** No requeridas para MVP  
**Qué falla:** Notificaciones WhatsApp no se envían  
**Cuándo agregar:** Fase 2 de desarrollo

---

## ✅ CHECKLIST - VARIABLES EN VERCEL

### Producción
- [ ] DATABASE_URL (private, encrypted)
- [ ] NEXTAUTH_SECRET (private, encrypted)
- [ ] NEXTAUTH_URL (private, `https://prescribe-tu-multa.vercel.app`)
- [ ] AWS_ACCESS_KEY_ID (private, encrypted)
- [ ] AWS_SECRET_ACCESS_KEY (private, encrypted)
- [ ] AWS_REGION (`us-east-1`)
- [ ] AWS_S3_BUCKET (`prescribe-tu-multa-pdfs`)
- [ ] ANTHROPIC_API_KEY (private, encrypted)
- [ ] MERCADO_PAGO_ACCESS_TOKEN (private, encrypted, token PROD)
- [ ] MERCADO_PAGO_PUBLIC_KEY (private or public)
- [ ] MERCADO_PAGO_NOTIFICATION_URL (private, `https://...`)
- [ ] RESEND_API_KEY (private, encrypted)
- [ ] RESEND_FROM_EMAIL
- [ ] RESEND_SUPPORT_EMAIL
- [ ] CRON_SECRET (private, encrypted)
- [ ] NEXT_PUBLIC_SITE_URL (`https://...`)
- [ ] NEXT_PUBLIC_SUPPORT_EMAIL
- [ ] PAYMENT_AMOUNT
- [ ] NODE_ENV (`production`)
- [ ] LOG_LEVEL (`error`)

### Preview (same as Production, pero)
- NEXTAUTH_URL: branch URL
- NODE_ENV: `development`
- LOG_LEVEL: `warn`
- MERCADO_PAGO tokens: Sandbox

### Development (local)
- NODE_ENV: `development`
- LOG_LEVEL: `debug`
- MERCADO_PAGO tokens: Sandbox
- DATABASE_URL: Local o Supabase dev

---

## 🔍 VERIFICACIÓN EN VERCEL DASHBOARD

```bash
# Ver variables configuradas
vercel env ls

# Ver solo production
vercel env ls --environment production

# Ver valor (requiere permiso)
vercel env pull
```

---

## 📝 NOTAS IMPORTANTES

### 1. Diferencia entre Public y Private
```
NEXT_PUBLIC_* → Compiladas en JavaScript del cliente (público)
Otras → Solo server-side (privadas)
```

### 2. Encriptación en Vercel
Las variables privadas se almacenan encrypted y no son visibles en:
- Dashboard (solo se ve que existen)
- Logs
- Código fuente

### 3. Ambiente vs Entorno
Vercel tiene 3 ambientes:
- **Production:** Main branch (`main`)
- **Preview:** Feature branches/PR
- **Development:** Local (`vercel dev`)

---

## 🚨 VARIABLES FALTANTES ACTUALMENTE

Basado en el análisis del código, Vercel necesita estas **14 variables críticas** en Production:

```
✓ DATABASE_URL
✓ NEXTAUTH_SECRET  
✓ NEXTAUTH_URL
✓ AWS_ACCESS_KEY_ID
✓ AWS_SECRET_ACCESS_KEY
✓ AWS_REGION
✓ AWS_S3_BUCKET
✓ ANTHROPIC_API_KEY
✓ MERCADO_PAGO_ACCESS_TOKEN
✓ MERCADO_PAGO_PUBLIC_KEY
✓ MERCADO_PAGO_NOTIFICATION_URL
✓ RESEND_API_KEY
✓ RESEND_FROM_EMAIL
✓ RESEND_SUPPORT_EMAIL
✓ CRON_SECRET
✓ NEXT_PUBLIC_SITE_URL
✓ NEXT_PUBLIC_SUPPORT_EMAIL
✓ PAYMENT_AMOUNT
✓ LOG_LEVEL
```

**Total de variables usadas en código:** 14 críticas (de 24 totales en .env.example)

---

_Auditoría completada: 2026-04-24_
