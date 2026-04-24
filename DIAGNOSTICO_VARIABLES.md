# Diagnóstico de Variables de Entorno

**Fecha:** 2024-04-24  
**Estado:** Análisis completo del proyecto  

## 📋 Tabla Completa de Variables

| # | Variable | Propósito | Tipo | Ubicación en Código | Estado Local | Necesidad | Próximo Paso |
|---|----------|-----------|------|---------------------|--------------|-----------|--------------|
| 1 | `DATABASE_URL` | Conexión Supabase PostgreSQL | Privada | `lib/db.ts`, Prisma config | ✅ Real | **CRÍTICA** | Ya configurada, lista para producción |
| 2 | `NEXTAUTH_SECRET` | Encriptación de sesiones | Privada | `lib/auth.ts` | ✅ Dev-only | **CRÍTICA** | Cambiar para producción en Vercel |
| 3 | `NEXTAUTH_URL` | URL para auth callbacks | Privada | `app/layout.tsx`, `app/robots.ts`, `lib/auth.ts` | ✅ localhost | **CRÍTICA** | Cambiar a `https://prescribe-tu-multa.vercel.app` |
| 4 | `NODE_ENV` | Ambiente (dev/prod) | Pública | Selecciona logs y comportamiento | ✅ development | Recomendada | Cambiar a `production` en Vercel |
| 5 | `AWS_REGION` | Región AWS para S3/Textract | Privada | `lib/ocr.ts` | ✅ us-east-1 | **CRÍTICA** | Mantener o ajustar según región |
| 6 | `AWS_ACCESS_KEY_ID` | Credencial AWS | Privada | Implícita en SDK | ❌ Placeholder | **CRÍTICA** | **FALTA** Obtener de AWS IAM |
| 7 | `AWS_SECRET_ACCESS_KEY` | Credencial AWS | Privada | Implícita en SDK | ❌ Placeholder | **CRÍTICA** | **FALTA** Obtener de AWS IAM |
| 8 | `AWS_S3_BUCKET` | Nombre bucket S3 | Privada | `lib/ocr.ts` | ✅ prescribe-tu-multa-pdfs | **CRÍTICA** | Crear bucket si no existe |
| 9 | `ANTHROPIC_API_KEY` | Claude API key | Privada | `lib/ai.ts` (implícita) | ❌ Placeholder | **CRÍTICA** | **FALTA** Obtener de console.anthropic.com |
| 10 | `RESEND_API_KEY` | Email transaccional | Privada | `lib/email.ts` | ❌ Placeholder | Importante | **FALTA** Obtener de Resend.com |
| 11 | `RESEND_FROM_EMAIL` | Email remitente | Pública | `lib/email.ts` | ✅ noreply@prescribeulmulta.cl | Importante | Verificar dominio en Resend |
| 12 | `RESEND_SUPPORT_EMAIL` | Email de soporte | Pública | `lib/email.ts` (no usado aún) | ✅ support@prescribeulmulta.cl | Opcional | Usar cuando esté lista |
| 13 | `MERCADO_PAGO_ACCESS_TOKEN` | MP payment processing | Privada | `lib/mercado-pago.ts` | ❌ Placeholder | **CRÍTICA** | **FALTA** Obtener de MP Dashboard |
| 14 | `MERCADO_PAGO_PUBLIC_KEY` | MP public key | Pública | (No usado en código actualmente) | ❌ Placeholder | Importante | Obtener si se integra client-side |
| 15 | `MERCADO_PAGO_NOTIFICATION_URL` | MP webhook URL | Pública | `lib/mercado-pago.ts` | ✅ localhost:3000 | Importante | Cambiar a URL producción cuando se despliegue |
| 16 | `WHATSAPP_ACCESS_TOKEN` | WhatsApp API | Privada | `lib/whatsapp.ts` | ❌ Placeholder | Opcional | **FALTA** si se quiere WhatsApp |
| 17 | `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp número | Privada | `lib/whatsapp.ts` | ❌ Placeholder | Opcional | **FALTA** si se quiere WhatsApp |
| 18 | `WHATSAPP_VERIFY_TOKEN` | WhatsApp webhook | Privada | `lib/whatsapp.ts` | ❌ Placeholder | Opcional | **FALTA** si se quiere WhatsApp |
| 19 | `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp account | Privada | `lib/whatsapp.ts` | ❌ Placeholder | Opcional | **FALTA** si se quiere WhatsApp |
| 20 | `CRON_SECRET` | Seguridad jobs | Privada | `app/api/jobs/cron/route.ts` | ✅ cron-secret-key-development-only | Importante | Cambiar en producción |
| 21 | `NEXT_PUBLIC_SITE_URL` | URL pública del sitio | Pública | Frontend, open graph | ✅ http://localhost:3000 | Importante | Cambiar a `https://prescribe-tu-multa.vercel.app` |
| 22 | `NEXT_PUBLIC_SUPPORT_EMAIL` | Email soporte (público) | Pública | Frontend, footer | ✅ support@prescribeulmulta.cl | Recomendada | Usar como es |
| 23 | `NEXT_PUBLIC_DOMAIN` | Dominio (público) | Pública | Frontend | ✅ prescribeulmulta.cl | Recomendada | Actualizar cuando tenga dominio final |
| 24 | `LOG_LEVEL` | Nivel de logging | Pública | Sistema interno | ✅ debug | Opcional | Cambiar a `warn` en producción |
| 25 | `PAYMENT_AMOUNT` | Monto pago documentos | Pública | Backend | ✅ 19990 | Importante | Mantener (CLP) |

## 🟢 CONFIGURADAS Y LISTAS (5)

1. ✅ `DATABASE_URL` - Supabase real
2. ✅ `NEXTAUTH_SECRET` - Dev-only, requiere cambio
3. ✅ `NEXTAUTH_URL` - localhost, requiere cambio
4. ✅ `AWS_REGION` - us-east-1
5. ✅ `AWS_S3_BUCKET` - Nombre bucket

**Acción:** Estas necesitan actualizarse para producción en Vercel Dashboard.

## 🟡 PARCIALMENTE CONFIGURADAS (8)

Credenciales con placeholders:
- ❌ `AWS_ACCESS_KEY_ID`
- ❌ `AWS_SECRET_ACCESS_KEY`
- ❌ `ANTHROPIC_API_KEY`
- ❌ `RESEND_API_KEY`
- ❌ `MERCADO_PAGO_ACCESS_TOKEN`
- ❌ `MERCADO_PAGO_PUBLIC_KEY`
- ❌ `WHATSAPP_ACCESS_TOKEN`
- ❌ `WHATSAPP_PHONE_NUMBER_ID`

**Acción Requerida:** Obtener valores reales para cada uno.

## 📊 Prioridad de Implementación

### FASE 1: Despliegue Básico (CRÍTICA)
Necesarias para que la página funcione en Vercel:
1. ✅ `NEXTAUTH_SECRET` - Cambiar valor
2. ✅ `NEXTAUTH_URL` - Cambiar a URL producción
3. ✅ `NEXT_PUBLIC_SITE_URL` - Cambiar a URL producción

**Impacto:** Sin estas, auth fallará y open graph no funcionará correctamente.

### FASE 2: Análisis de PDFs (CRÍTICA)
Necesarias para que funcione el procesamiento de certificados:
1. ❌ `ANTHROPIC_API_KEY` - Obtener de Anthropic
2. ❌ `AWS_ACCESS_KEY_ID` - Obtener de AWS IAM
3. ❌ `AWS_SECRET_ACCESS_KEY` - Obtener de AWS IAM

**Impacto:** Sin estas, la IA no puede analizar PDFs. Feature clave no funciona.

### FASE 3: Notificaciones (IMPORTANTE)
Necesarias para contactar al usuario:
1. ❌ `RESEND_API_KEY` - Obtener de Resend.com
2. ❌ `WHATSAPP_ACCESS_TOKEN` - Obtener de Meta (opcional)
3. ❌ `WHATSAPP_PHONE_NUMBER_ID` - Obtener de Meta (opcional)

**Impacto:** Sin email, usuario no sabe si solicitud llegó. WhatsApp es nice-to-have.

### FASE 4: Pagos (IMPORTANTE)
Necesarias para procesar pagos:
1. ❌ `MERCADO_PAGO_ACCESS_TOKEN` - Obtener de MP
2. ❌ `MERCADO_PAGO_NOTIFICATION_URL` - Actualizar URL

**Impacto:** Sin esto, pago de $19.990 CLP no funciona.

## 🔐 Obtención de Valores

### AWS (3 variables críticas)
**Ubicación:** AWS Management Console → IAM → Users → Create user  
**Permisos necesarios:**
- `s3:*` (para S3 bucket)
- `textract:*` (para OCR)

**Resultado:** Recibirás:
```
AWS_ACCESS_KEY_ID: AKIA...
AWS_SECRET_ACCESS_KEY: ...secret...
```

### Anthropic (1 variable crítica)
**Ubicación:** https://console.anthropic.com/api_keys  
**Pasos:**
1. Login o crear cuenta
2. Crear API key
3. Copiar valor

**Resultado:**
```
ANTHROPIC_API_KEY: sk-ant-v7...
```

### Resend (1 variable importante)
**Ubicación:** https://resend.com → API Keys  
**Pasos:**
1. Crear cuenta
2. Generar API key
3. Verificar dominio @prescribeulmulta.cl

**Resultado:**
```
RESEND_API_KEY: re_...
```

### Mercado Pago (2 variables importante)
**Ubicación:** https://www.mercadopago.cl → Credenciales  
**Pasos:**
1. Login a cuenta de negocio
2. Ir a Settings → Credenciales
3. Copiar token de acceso

**Resultado:**
```
MERCADO_PAGO_ACCESS_TOKEN: APP_USR-...
MERCADO_PAGO_PUBLIC_KEY: APP_USR-...
```

### WhatsApp (4 variables opcionales)
**Ubicación:** Meta Business Suite → WhatsApp Business  
**Pasos:** Más complejo, requiere solicitud de acceso a API  

## 🚀 Próximos Pasos en Orden

### AHORA EN LOCAL (Ya hecho)
- ✅ Formulario principal funciona
- ✅ Validación completa
- ✅ Build exitoso
- ✅ Testing básico pasado

### ANTES DE DESPLEGAR
1. [ ] Crear credenciales AWS real
2. [ ] Crear API key Anthropic
3. [ ] Crear API key Resend
4. [ ] Configurar Mercado Pago
5. [ ] Configurar todas en Vercel Dashboard

### DESPUÉS DE DESPLEGAR
1. [ ] Probar auth en producción
2. [ ] Probar formulario end-to-end
3. [ ] Probar análisis IA con PDF real
4. [ ] Probar emails de confirmación
5. [ ] Probar procesamiento de pago
6. [ ] Opcional: Configurar WhatsApp

## ⚠️ Warnings Importantes

1. **AWS:** Necesitas crear IAM user con acceso limitado a S3 y Textract. NO uses credenciales root.

2. **Anthropic:** La API key es privada. NO la expongas en frontend ni commits.

3. **Resend:** Necesitas verificar dominio @prescribeulmulta.cl. Solo emails desde ese dominio funcionarán.

4. **Mercado Pago:** Asegúrate que sea cuenta de NEGOCIO (no personal) para procesar pagos.

5. **Vercel:** Configura variables en PRODUCTION environment, no en Preview.

## 📝 Checklist de Verificación

- [ ] Build pasó sin errores
- [ ] Formulario valida correctamente
- [ ] Endpoints API responden
- [ ] DATABASE_URL conecta correctamente
- [ ] Variables críticas de FASE 1 obtenidas
- [ ] Variables en Vercel Dashboard configuradas
- [ ] URL de sitio actualizada
- [ ] Open Graph metadata correcta
- [ ] Email soporte funcional
- [ ] Análisis IA lista (si se completa FASE 2)
- [ ] Pagos configurados (si se completa FASE 4)

## 🎯 Estado Resumido

**Formulario Principal:** ✅ LISTO  
**Build:** ✅ EXITOSO  
**Local:** ✅ FUNCIONA  
**Despliegue:** ⏳ PENDIENTE (requiere variables de entorno)  
**Variables Críticas:** 3/3 configuradas en local, 0/3 en producción  
**Bloqueo Principal:** Obtener credenciales AWS + Anthropic
