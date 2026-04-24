# 🚀 Instrucciones de Despliegue a Producción

**Fecha:** 2026-04-24  
**Estado:** Sistema completamente integrado y listo para despliegue  
**Rama:** `claude/legal-tech-platform-xjOsf`  
**PR:** #4 (Draft)

## ✅ Estatus Pre-Despliegue

- [x] Build completado exitosamente
- [x] TypeScript checking pasado
- [x] Todos 21 endpoints compilados
- [x] Base de datos schema actualizado (Solicitud model)
- [x] Email templates configurados
- [x] Background jobs implementados
- [x] Todas 18 variables de entorno configuradas en Vercel
- [x] PR #4 abierto con cambios listos

## 🎯 Próximos Pasos Inmediatos

### PASO 1: Desplegar a Producción (EN TU MÁQUINA WINDOWS)

Abre PowerShell en `C:\Users\romis\prescribe-tu-multa` y ejecuta:

```powershell
vercel deploy --prod
```

Esto:
- Desplegará el código a https://prescribe-tu-multa.vercel.app
- Ejecutará la migración Prisma automáticamente (crea tabla Solicitud)
- Aplicará todas 18 variables de entorno
- Activará los endpoints de API

**Tiempo estimado:** 2-3 minutos

### PASO 2: Verificar Despliegue Exitoso

Una vez completado, verifica:

```powershell
vercel --version
vercel list
```

Deberías ver el proyecto `prescribe-tu-multa` listado como PRODUCTION.

### PASO 3: Probar Formulario en Producción

1. Ve a: https://prescribe-tu-multa.vercel.app
2. Desplázate al formulario principal
3. Llena los campos:
   - Nombre: `Test Usuario`
   - Patente: `AB1234` (auto-formatea a AB-1234)
   - Email: `test@example.com` (tu email real para recibir confirmación)
   - Teléfono: `912345678`
   - Archivo: Usa cualquier PDF test
   - Términos: Marca el checkbox
4. Haz clic en "Analizar Multa"
5. Deberías ver: "✓ Solicitud recibida correctamente"

### PASO 4: Verificar Emails

**Email de Confirmación (para ti):**
- Deberías recibir en el email que pusiste: "✓ Hemos recibido tu solicitud"
- Asunto: "Hemos recibido tu solicitud - Prescribe Tu Multa"
- Contenido: Confirmación de recepción + tiempo estimado de procesamiento

**Email de Notificación Interna (para soporte):**
- Va a: support@prescribeulmulta.cl
- Asunto: "[NUEVA SOLICITUD] Test Usuario - AB-1234"
- Contenido: Detalles completos para seguimiento

Si NO recibes emails:
- Verifica que RESEND_API_KEY está configurado en Vercel
- Resend requiere dominio verificado para email real
- Por ahora, la API key puede estar en modo test

### PASO 5: Configurar Cron Job para Procesamiento

El background job procesa PDFs automáticamente, pero necesita ejecutarse periódicamente.

#### OPCIÓN A: Vercel Cron (Recomendado - Si tienes Vercel Pro)

1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Cron Jobs
2. Crea nuevo cron:
   - **URL:** `/api/jobs/cron?job=process-solicitudes`
   - **Schedule:** `*/5 * * * *` (cada 5 minutos)
   - **Timezone:** Tu zona horaria

3. Vercel ejecutará automáticamente cada 5 minutos

#### OPCIÓN B: Servicio Externo (Gratuito)

Usa **EasyCron** (https://www.easycron.com/) o **SetCron** (https://www.setcron.com/):

1. Regístrate en EasyCron (gratis)
2. Crea nuevo cron job:
   - **URL:** `https://prescribe-tu-multa.vercel.app/api/jobs/cron?job=process-solicitudes`
   - **Schedule:** `*/5 * * * *` (cada 5 minutos)
3. Agrega header HTTP:
   - **Name:** `Authorization`
   - **Value:** `Bearer [CRON_SECRET]`
   - Reemplaza `[CRON_SECRET]` con tu valor de Vercel env

Para obtener CRON_SECRET:
```powershell
vercel env ls
```
Busca `CRON_SECRET` en la lista.

### PASO 6: Probar Full Flow con PDF Real

1. Consigue una copia real de un acta RMNP
2. Sube el PDF en el formulario
3. Espera 2-5 minutos para que el cron job se ejecute
4. Deberías recibir email con análisis:
   - RUT extraído
   - Patente extraída
   - Monto de la multa
   - Estado: PRESCRITA o VIGENTE
   - Días restantes de prescripción

## 📊 Qué Sucede Después de Desplegar

### Flujo Automático:

```
Usuario Llena Formulario
        ↓
POST /api/solicitudes
        ↓
✓ Solicitud creada en BD (estado: PENDIENTE)
        ↓
📧 Email confirmación enviado al usuario
        ↓
📧 Notificación interna enviada a soporte
        ↓
[Espera cron job - cada 5 min]
        ↓
🔄 GET /api/jobs/cron?job=process-solicitudes
        ↓
Procesa solicitudes PENDIENTES:
- Descarga PDF de S3
- Extrae texto con AWS Textract
- Analiza con Claude 3.5 Sonnet
- Extrae: RUT, patente, monto, fecha
- Calcula prescripción (3 años desde fecha ingreso)
        ↓
✓ Multa creada en BD (estado: VIGENTE o PRESCRITA)
        ↓
📧 Email de análisis enviado al usuario
        ↓
Usuario ve resultados en dashboard
```

## 🔐 Variables de Entorno - Status Final

Verifica que todas estén en Vercel PRODUCTION:

```powershell
vercel env ls
```

Deberías ver (18 total):
- ✅ DATABASE_URL
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL (= https://prescribe-tu-multa.vercel.app)
- ✅ AWS_ACCESS_KEY_ID
- ✅ AWS_SECRET_ACCESS_KEY
- ✅ AWS_ACCOUNT_ID
- ✅ AWS_REGION (= us-east-1)
- ✅ AWS_ROLE_ARN
- ✅ AWS_RESOURCE_ARN
- ✅ AWS_S3_BUCKET
- ✅ PGHOST / PGPORT / PGUSER / PGDATABASE / PGSSLMODE
- ✅ ANTHROPIC_API_KEY
- ✅ RESEND_API_KEY
- ✅ RESEND_FROM_EMAIL
- ✅ RESEND_SUPPORT_EMAIL
- ✅ CRON_SECRET

## 🚨 Solución de Problemas

### Si el formulario no aparece:
```
Verifica: https://prescribe-tu-multa.vercel.app/
Debe mostrar landing page con formulario en la sección "Analiza tu Multa"
```

### Si no recibes email de confirmación:
- Verifica RESEND_API_KEY en Vercel
- Resend en modo test solo envía a addresses pre-registradas
- Para producción, verifica tu dominio en Resend dashboard

### Si el cron job no se ejecuta:
- Verifica CRON_SECRET está en Vercel (no vacío)
- Verifica el servicio cron (EasyCron/SetCron) está activo
- Revisa logs: `vercel logs` en PowerShell

### Si PDF no se procesa:
- Verifica AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY están correctos
- Verifica S3 bucket existe y tiene permisos
- Revisa logs de error: `vercel logs --tail` para errores en tiempo real

## ✨ Despliegue Completado

Una vez confirmes que todo funciona:

1. ✅ Formulario accesible en https://prescribe-tu-multa.vercel.app
2. ✅ Email confirmación recibido
3. ✅ Cron job configurado
4. ✅ PDF procesado (después de 5 min)
5. ✅ Email de análisis recibido

**SISTEMA EN PRODUCCIÓN** ✨

### Próximos Pasos Post-Producción:

- Monitorea logs: `vercel logs --tail`
- Verifica BD en Supabase: ve a https://supabase.com y busca tu proyecto
- Tabla `Solicitud` debe tener tus registros de test
- Tabla `Multa` debe tener registros procesados

---

**Tiempo total:** 5-10 minutos para despliegue + pruebas básicas

¿Necesitas ayuda con algún paso? ¿Ya desplegaste?
