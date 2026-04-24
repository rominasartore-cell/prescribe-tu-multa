# Vercel Deployment - PASO A PASO

## PASO 1: Conectar GitHub a Vercel (Una sola vez)

1. Ve a **https://vercel.com/new**
2. Haz click en **"Continue with GitHub"**
3. Autoriza Vercel a acceder a tu GitHub (si no lo has hecho)
4. Busca el repositorio **`prescribe-tu-multa`**
5. Haz click en **"Import"**

---

## PASO 2: Configurar el Proyecto en Vercel

### Framework y Settings (Vercel detecta automáticamente)
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
```
**NO CAMBIES NADA - Están correctos por defecto**

### Build Settings
```
Build Output Settings: Auto (Vercel detectará)
Node.js Version: 18.x o superior (recomendado)
```

---

## PASO 3: Environment Variables (IMPORTANTE)

**Antes de hacer click en "Deploy", AÑADE ESTAS VARIABLES EN VERCEL:**

### Mínimo necesario (obligatorio para que cargue):
```
DATABASE_URL = postgresql://postgres:ptbt35OuJcNyi9ZB@db.ezdcwbxyqsbdlyvroixw.supabase.co:5432/postgres

NEXTAUTH_SECRET = prescribe-tu-multa-dev-secret-key-minimum-32-characters-long-12345

NEXTAUTH_URL = https://prescribe-tu-multa.vercel.app

NODE_ENV = production
```

### Opcionales (para funcionalidades específicas):
```
NEXT_PUBLIC_SITE_URL = https://prescribe-tu-multa.vercel.app

NEXT_PUBLIC_SUPPORT_EMAIL = support@prescribeulmulta.cl

NEXT_PUBLIC_DOMAIN = prescribeulmulta.cl

AWS_REGION = us-east-1

AWS_ACCESS_KEY_ID = (obtener de AWS)

AWS_SECRET_ACCESS_KEY = (obtener de AWS)

AWS_S3_BUCKET = prescribe-tu-multa-pdfs

ANTHROPIC_API_KEY = (obtener de Anthropic)

MERCADO_PAGO_ACCESS_TOKEN = (obtener de Mercado Pago)

MERCADO_PAGO_PUBLIC_KEY = (obtener de Mercado Pago)

RESEND_API_KEY = (obtener de Resend)

RESEND_FROM_EMAIL = noreply@prescribeulmulta.cl

RESEND_SUPPORT_EMAIL = support@prescribeulmulta.cl

WHATSAPP_BUSINESS_ACCOUNT_ID = (opcional)

WHATSAPP_PHONE_NUMBER_ID = (opcional)

WHATSAPP_ACCESS_TOKEN = (opcional)

WHATSAPP_VERIFY_TOKEN = (opcional)

CRON_SECRET = cron-secret-key-development-only
```

**INSTRUCCIONES PARA CADA VARIABLE:**

En Vercel Dashboard:
1. Click en **"Settings"** (dentro del proyecto)
2. Click en **"Environment Variables"**
3. Añade cada variable con su valor exacto
4. Haz click en **"Save"**

Vercel hará redeploy automático.

---

## PASO 4: Hacer el Deploy

### Opción A: Desde Vercel Dashboard
1. Click en **"Deploy"** (botón azul grande)
2. Vercel clonará tu repo, instalará dependencias, hará build y desplegará
3. Espera 2-5 minutos

### Opción B: Automático (Recomendado)
- Cada vez que hagas push a `main` en GitHub
- Vercel automáticamente hará build y deploy
- Verás el estado en Vercel Dashboard

---

## PASO 5: Acceder a tu Sitio

### URL de Vercel (inmediata):
```
https://prescribe-tu-multa.vercel.app
```

**Esta URL estará lista INMEDIATAMENTE después del deploy.**

---

## PASO 6: Conectar Dominio Propio (Opcional - si tienes uno)

Si tienes un dominio como `prescribeulmulta.cl`:

### En Vercel Dashboard:
1. Click en **"Settings"** → **"Domains"**
2. Click en **"Add Domain"**
3. Ingresa tu dominio: `prescribeulmulta.cl`
4. Vercel te dará instrucciones de DNS

### En tu registrador de dominio (GoDaddy, Namecheap, etc.):
Vercel te indicará si debes cambiar:
- **Nameservers** (cambiar a los de Vercel - más fácil)
- O **CNAME records** (si prefieres mantener tu registrador actual)

**Tiempo para propagación:** 24-48 horas

---

## VERIFICACIÓN DEL DEPLOY

### Desde Vercel Dashboard:
- Verás un estado de "✓ Ready" cuando esté completado
- Verás logs de build en la sección "Deployments"

### Desde tu navegador:
```
1. Abre https://prescribe-tu-multa.vercel.app
2. Verifica que cargue la página principal
3. Abre Developer Tools (F12)
4. Revisa Console (debería estar vacía o sin errores críticos)
5. Verifica que veas:
   - Header con "Prescribe Tu Multa"
   - Hero section
   - Botones "Analizar Mi Multa" y "Ver cómo funciona"
   - Footer con links legales
```

---

## SOLUCIÓN DE PROBLEMAS

### Error: Build failed
```
Verifica en Logs (Vercel Dashboard → Deployments → Ver logs)
Probablemente falte una variable de entorno o hay error en código
```

### Error: Page loads but shows error
```
1. Abre F12 → Console
2. Copia el error exacto
3. Revisa si falta DATABASE_URL o NEXTAUTH_SECRET
4. Actualiza la variable en Vercel → redeploy
```

### Error: Cannot find module
```
Verifica que npm ci se ejecutó correctamente
A veces Vercel cachea mal - ve a Settings → Clear build cache
Luego redeploy
```

---

## PRÓXIMOS PASOS DESPUÉS DEL DEPLOY

1. **Obtén las claves reales:**
   - AWS (para S3)
   - Anthropic (para IA)
   - Mercado Pago (para pagos)
   - Resend (para emails)
   - WhatsApp (para notificaciones)

2. **Actualiza variables en Vercel** con los valores reales

3. **Prueba funcionalidades:**
   - Registro en /auth/register
   - Login en /auth/login
   - Subida de PDF en /dashboard/new
   - Checkout en /dashboard/multas/[id]

---

## COMANDO RÁPIDO DE REFERENCIA

Si trabajas localmente y quieres probar antes de pushear:
```bash
npm run build          # Verificar que compila
npm run dev            # Probar en http://localhost:3000
git push origin main   # Push a GitHub
                       # Vercel detectará y hará deploy automático
```

---

## ESTADO FINAL

**Cuando todo esté listo:**
- ✅ URL pública: `https://prescribe-tu-multa.vercel.app`
- ✅ Variables de entorno configuradas
- ✅ Deploy automático en cada push
- ✅ Dominio propio conectado (opcional)
- ✅ Listo para agregar nuevas funcionalidades
