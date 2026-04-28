# 🚀 DEPLOYMENT A PRODUCCIÓN - INSTRUCCIONES FINALES

## ✅ LO QUE YA ESTÁ LISTO

```
✅ Código corregido y pusheado a main
✅ Metadata URLs configuradas (prescribetumulta.cl)
✅ UTF-8 encoding asegurado
✅ Bucket setup script creado
✅ Environment variables template creado
✅ Vercel env setup script creado
```

## 📋 PASOS PARA COMPLETAR EL DEPLOYMENT

### PASO 1: Obtener Credenciales Necesarias

Antes de correr el setup script, reúne estos valores:

1. **SUPABASE_SERVICE_ROLE_KEY**
   - Ve a: https://app.supabase.com
   - Proyecto: `ezdcwbxyqsbdlyvroixw`
   - Settings → API → Service role secret

2. **DATABASE_URL y DIRECT_URL**
   - Supabase Dashboard → Settings → Database
   - Copia la URI de PostgreSQL

3. **NEXTAUTH_SECRET**
   - Ya generado: `ED5+AQEQGi0Rl9zDxcnIkIbw/3bAvjAib8c3b3ba+qo=`

4. **RESEND_API_KEY**
   - Ve a: https://resend.com/api-keys
   - Copia tu API key

5. **ANTHROPIC_API_KEY**
   - Ve a: https://console.anthropic.com
   - Copia tu API key

### PASO 2: Configurar Variables en Vercel

Opción A - Automática (recomendado):
```bash
bash scripts/setup-vercel-env.sh
```
Este script:
- Requiere login en Vercel
- Configura variables públicas automáticamente
- Pide las variables sensibles una a una

Opción B - Manual:
1. Ve a https://vercel.com
2. Selecciona proyecto `prescribe-tu-multa`
3. Settings → Environment Variables
4. Añade cada variable del archivo `.env.production.example`

### PASO 3: Crear Bucket de Supabase

```bash
npm run build
SUPABASE_URL=https://ezdcwbxyqsbdlyvroixw.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/setup-supabase-bucket.js
```

Este script:
- Verifica si el bucket `certificados` existe
- Lo crea si no existe
- Es idempotente (seguro ejecutar varias veces)

### PASO 4: Verificar Configuración

```bash
# Verifica que Vercel tiene todas las variables
vercel env ls

# Output esperado:
# ✓ NEXT_PUBLIC_SITE_URL=https://prescribetumulta.cl
# ✓ SUPABASE_URL=https://ezdcwbxyqsbdlyvroixw.supabase.co
# ✓ (más variables...)
```

### PASO 5: Trigger Deploy en Vercel

Opción A - Automático (recomendado):
```bash
git push origin main
```
Vercel desplegará automáticamente

Opción B - Manual:
1. Ve a https://vercel.com/projects/prescribe-tu-multa
2. Haz click en "Deployments" → "Redeploy"

### PASO 6: Verificar Production

```bash
# 1. Abre Open Graph validator
https://www.opengraph.xyz/?url=https://prescribetumulta.cl

# Debería mostrar:
# ✓ og:url = https://prescribetumulta.cl
# ✓ og:title = Prescribe Tu Multa
# ✓ og:image = https://prescribetumulta.cl/og-image.png

# 2. Verifica encoding
# Los acentos deben verse: Análisis, Tránsito, prescripción, automáticamente

# 3. Test PDF upload
# Intenta subir un PDF desde el formulario público

# 4. Test email
# Revisa que recibas email de confirmación
```

## 🔑 VARIABLE REFERENCE RÁPIDA

```
NEXT_PUBLIC_SITE_URL=https://prescribetumulta.cl
SUPABASE_URL=https://ezdcwbxyqsbdlyvroixw.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://ezdcwbxyqsbdlyvroixw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[OBTEN DE SUPABASE]
DATABASE_URL=[OBTEN DE SUPABASE]
DIRECT_URL=[OBTEN DE SUPABASE]
NEXTAUTH_URL=https://prescribetumulta.cl
NEXTAUTH_SECRET=ED5+AQEQGi0Rl9zDxcnIkIbw/3bAvjAib8c3b3ba+qo=
RESEND_API_KEY=[OBTEN DE RESEND]
ANTHROPIC_API_KEY=[OBTEN DE ANTHROPIC]
```

## ⚡ CHECKLIST PRE-DEPLOYMENT

```
[ ] Todas las credenciales recopiladas
[ ] Script setup-vercel-env.sh ejecutado (o vars configuradas manualmente)
[ ] Bucket 'certificados' creado en Supabase
[ ] Build local exitoso: npm run build
[ ] Variables verificadas en Vercel: vercel env ls
[ ] Deploy completado en Vercel
[ ] Open Graph URLs correctas (verificadas)
[ ] Encoding UTF-8 funciona (sin anÃ¡lisis)
[ ] PDF upload prueba exitosa
[ ] Email de confirmación recibido
```

## 📞 SOPORTE

Si algo falla:

1. **"Bucket not found"**
   ```bash
   node scripts/setup-supabase-bucket.js
   ```

2. **Variables no aplican**
   - Ve a Vercel → Deployments → Redeploy
   - O haz `git push origin main`

3. **Encoding roto**
   - Verifica que NEXT_PUBLIC_SITE_URL está configurada
   - Hard refresh: Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)

4. **PDF upload fails**
   - Verifica Supabase Storage bucket `certificados` existe
   - Verifica SUPABASE_SERVICE_ROLE_KEY es válida

---

**Todo el código está listo en `main` branch. Solo necesitas configurar las variables de ambiente y ejecutar los scripts setup.**

¡Listo para producción! 🎉
