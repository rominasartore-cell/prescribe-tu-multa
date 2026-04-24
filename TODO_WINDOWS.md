# 🪟 INSTRUCCIONES PARA WINDOWS

## LO QUE ESTÁ LISTO ✅

```
Build:        ✅ COMPLETADO (127 KB optimizado)
API:          ✅ LISTO (13 endpoints)
Database:     ✅ CONFIGURADA (18 env vars)
Email:        ✅ INTEGRADO (Resend)
Jobs:         ✅ IMPLEMENTADO (Background processing)
```

## LO QUE TIENES QUE HACER (3 PASOS)

### PASO 1: Abre PowerShell en tu carpeta

```powershell
cd C:\Users\romis\prescribe-tu-multa
```

### PASO 2: Despliegue a Producción

```powershell
vercel deploy --prod
```

**Esto ejecutará:**
- ✅ Deploy a https://prescribe-tu-multa.vercel.app
- ✅ Migración de BD automática (crea tabla Solicitud)
- ✅ Aplica 18 variables de entorno
- ✅ Activa todos los API endpoints

**Tiempo:** 2-3 minutos

**Verás algo como:**
```
> Vercel CLI 33.6.0
> Deploying ~/prescribe-tu-multa
> Using existing project ...
> Deployed to production [COMPLETED] [1s]
> https://prescribe-tu-multa.vercel.app
```

### PASO 3: Prueba el Formulario (en tu navegador)

1. Ve a: **https://prescribe-tu-multa.vercel.app**

2. Desplázate al formulario "Analiza tu Multa"

3. Llena:
   ```
   Nombre:      Test User
   Patente:     AB1234  (auto-formatea a AB-1234)
   Email:       TU_EMAIL@gmail.com (para recibir confirmación)
   Teléfono:    912345678
   Archivo:     Cualquier PDF
   Términos:    ✓ Marca el checkbox
   ```

4. Haz clic en "Analizar Multa"

5. **Deberías ver:**
   ```
   ✓ Solicitud recibida correctamente
   ```

### PASO 4: Configura el Cron Job (automático)

El cron job procesa PDFs automáticamente cada 5 minutos.

#### Opción A: Vercel Cron (si tienes Vercel Pro)

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `prescribe-tu-multa`
3. Settings → Cron Jobs
4. New Cron Job:
   - URL: `/api/jobs/cron?job=process-solicitudes`
   - Schedule: `*/5 * * * *`
5. Save

#### Opción B: EasyCron (gratis, recomendado)

1. Ve a: https://www.easycron.com
2. Sign Up (libre)
3. Cron Jobs → New Cron Job
4. HTTP POST Request:
   ```
   URL: https://prescribe-tu-multa.vercel.app/api/jobs/cron?job=process-solicitudes
   ```
5. Custom Header:
   ```
   Name: Authorization
   Value: Bearer [TU_CRON_SECRET]
   ```
   
   Para obtener TU_CRON_SECRET en PowerShell:
   ```powershell
   vercel env ls | grep CRON_SECRET
   ```

6. Cron Expression: `*/5 * * * *` (cada 5 minutos)
7. Create

---

## ¿QUÉ PASA DESPUÉS?

### Cuando envías el formulario:

```
1. Tu solicitud se guarda en BD
2. Recibes email: "✓ Hemos recibido tu solicitud"
3. Support team recibe: "[NUEVA SOLICITUD] Test User - AB-1234"
```

### Cada 5 minutos (cron job):

```
1. El job busca solicitudes pendientes
2. Descarga tu PDF de S3
3. Extrae texto con AWS Textract
4. Analiza con Claude 3.5 Sonnet
5. Crea una Multa en la BD con:
   - RUT extraído
   - Patente extraída
   - Monto de la multa
   - Estado: PRESCRITA o VIGENTE
   - Días restantes
6. Te envía email con los resultados
```

---

## ✨ RESULTADO FINAL

Después de seguir estos 4 pasos:

```
🎉 SISTEMA EN PRODUCCIÓN

✅ https://prescribe-tu-multa.vercel.app ACTIVO
✅ Formulario funcional
✅ Base de datos integrada
✅ Emails enviándose
✅ Análisis automático de PDFs
✅ Claude extrayendo información
✅ Cálculo de prescripción automático
```

---

## 🆘 AYUDA RÁPIDA

| Problema | Solución |
|----------|----------|
| Deploy falla | `vercel login` luego `vercel deploy --prod` |
| No veo formulario | Espera 30 seg, recarga página (Ctrl+F5) |
| No recibo emails | Verifica email en spam, verifica RESEND_API_KEY en Vercel |
| Cron no corre | Verifica que EasyCron está activo, Bearer token correcto |
| Error en logs | `vercel logs --tail` para ver errores en tiempo real |

---

## 📝 CHECKLIST

```
[ ] Abrí PowerShell en C:\Users\romis\prescribe-tu-multa
[ ] Ejecuté: vercel deploy --prod
[ ] Esperé a que completara (2-3 minutos)
[ ] Fui a https://prescribe-tu-multa.vercel.app
[ ] Formulario aparece y funciona
[ ] Recibí email de confirmación
[ ] Configuré cron job (EasyCron o Vercel)
[ ] Envié otro formulario de prueba
[ ] Esperé 5 minutos
[ ] Recibí email con análisis de la multa
```

---

## 🚀 TIEMPO ESTIMADO

- Despliegue: **2-3 minutos**
- Prueba formulario: **5 minutos**
- Config cron: **5 minutos**
- **TOTAL: 12-15 minutos**

---

**¿Listo? Abre PowerShell en `C:\Users\romis\prescribe-tu-multa` y ejecuta:**

```powershell
vercel deploy --prod
```

¡Eso es todo! 🎉
