# Vercel Environment Variables - COMPLETE LIST

## VARIABLES REQUERIDAS PARA VERCEL

### Base de Datos
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Supabase Dashboard | ✅ SÍ |

### NextAuth.js (Autenticación)
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `NEXTAUTH_SECRET` | (mín 32 caracteres) | Generar: `openssl rand -base64 32` | ✅ SÍ |
| `NEXTAUTH_URL` | `https://prescribe-tu-multa.vercel.app` | Tu dominio en Vercel | ✅ SÍ |

### AWS Services (Almacenamiento PDF en S3)
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `AWS_REGION` | `us-east-1` | AWS Account | ⚠️ Recomendado |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS IAM Console | ⚠️ Recomendado |
| `AWS_SECRET_ACCESS_KEY` | `wJal...` | AWS IAM Console | ⚠️ Recomendado |
| `AWS_S3_BUCKET` | `prescribe-tu-multa-pdfs` | S3 Console | ⚠️ Recomendado |

### Anthropic API (Claude para IA)
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | https://console.anthropic.com | ⚠️ Recomendado |

### Mercado Pago (Pagos Chile)
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `MERCADO_PAGO_ACCESS_TOKEN` | `APP_USR-...` | Mercado Pago API Keys | ⚠️ Recomendado |
| `MERCADO_PAGO_PUBLIC_KEY` | `APP_USR-...` | Mercado Pago API Keys | ⚠️ Recomendado |

### Resend (Email)
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `RESEND_API_KEY` | `re_...` | https://resend.com/api-keys | ⚠️ Recomendado |
| `RESEND_FROM_EMAIL` | `noreply@prescribeulmulta.cl` | Tu dominio | ⚠️ Recomendado |
| `RESEND_SUPPORT_EMAIL` | `support@prescribeulmulta.cl` | Tu email | ⚠️ Recomendado |

### WhatsApp Business API
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | `...` | Meta Business Manager | ⚠️ Recomendado |
| `WHATSAPP_PHONE_NUMBER_ID` | `...` | Meta Business Manager | ⚠️ Recomendado |
| `WHATSAPP_ACCESS_TOKEN` | `...` | Meta Business Manager | ⚠️ Recomendado |
| `WHATSAPP_VERIFY_TOKEN` | `...` | Generar string aleatorio | ⚠️ Recomendado |

### Cron Jobs
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `CRON_SECRET` | `tu-clave-secreta-123` | Generar string seguro | ⚠️ Recomendado |

### Frontend Públicas (no sensibles)
| Variable | Valor Ejemplo | Obtener De | Obligatorio |
|----------|-------|-----------|------------|
| `NEXT_PUBLIC_SITE_URL` | `https://prescribe-tu-multa.vercel.app` | Tu dominio | ⚠️ Recomendado |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@prescribeulmulta.cl` | Tu email | ⚠️ Recomendado |
| `NEXT_PUBLIC_DOMAIN` | `prescribeulmulta.cl` | Tu dominio | ⚠️ Recomendado |

---

## RESUMEN MÍNIMO PARA FUNCIONAMIENTO BÁSICO

Para que el sitio **al menos cargue** en Vercel, necesitas SOLO:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=tu-secreto-32-caracteres-minimo
NEXTAUTH_URL=https://prescribe-tu-multa.vercel.app
NODE_ENV=production
```

Las demás variables son para funcionalidades específicas (IA, pagos, emails, etc.).
Si no tienes una clave, deja un placeholder como:
- `ANTHROPIC_API_KEY=sk-ant-placeholder` (la API simplemente no funcionará hasta que lo actualices)

---

## DÓNDE CONFIGURAR EN VERCEL

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade cada variable con su valor
4. Guarda y redeploy automático ocurrirá

---

## SEGURIDAD

⚠️ NUNCA comiteas claves privadas al repositorio.
Todas las variables deben configurarse en Vercel Dashboard, no en código.

Vercel las inyectará en runtime.
