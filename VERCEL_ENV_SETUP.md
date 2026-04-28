# Configuración de Variables de Ambiente - Vercel

## Variables Requeridas en Vercel Environment

Configura estas variables en el dashboard de Vercel para que la aplicación funcione correctamente en producción.

### 1. **Configuración General**

```
NEXT_PUBLIC_SITE_URL=https://prescribetumulta.cl
```
- **Propósito**: URL base del sitio para metadata Open Graph y URLs absolutas
- **Requerido**: Sí
- **Valor de ejemplo**: `https://prescribetumulta.cl`

### 2. **Base de Datos (Supabase)**

```
DATABASE_URL=postgresql://user:password@host/dbname
DIRECT_URL=postgresql://user:password@host/dbname
```
- **Propósito**: Conexiones a PostgreSQL en Supabase
- **Requerido**: Sí
- **Nota**: El proyecto debe ser `ezdcwbxyqsbdlyvroixw`

### 3. **Supabase Storage (PDF Uploads)**

```
SUPABASE_URL=https://ezdcwbxyqsbdlyvroixw.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://ezdcwbxyqsbdlyvroixw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```
- **Propósito**: Almacenamiento de PDFs en Supabase Storage
- **Requerido**: Sí
- **Nota**: Deben apuntar al MISMO proyecto de Supabase que DATABASE_URL
- **Bucket**: `certificados` (privado)

### 4. **Autenticación (NextAuth)**

```
NEXTAUTH_URL=https://prescribetumulta.cl
NEXTAUTH_SECRET=your-secret-key-here
```
- **Propósito**: Configuración de NextAuth para login
- **Requerido**: Sí
- **Nota**: Generar con: `openssl rand -base64 32`

### 5. **Email (Resend)**

```
RESEND_API_KEY=your-resend-api-key-here
```
- **Propósito**: Envío de emails de confirmación y notificaciones
- **Requerido**: Sí

### 6. **Pagos (Mercado Pago)**

```
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your-public-key-here
MERCADO_PAGO_ACCESS_TOKEN=your-access-token-here
```
- **Propósito**: Integración de pagos
- **Requerido**: No (opcional, para funcionalidad de pagos)

### 7. **Claude API**

```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```
- **Propósito**: Análisis de PDFs con Claude AI
- **Requerido**: Sí

### 8. **WhatsApp (Opcional)**

```
WHATSAPP_TOKEN=your-whatsapp-token-here
WHATSAPP_PHONE_ID=your-phone-id-here
```
- **Propósito**: Mensajes de WhatsApp
- **Requerido**: No (opcional)

## Verificación de Configuración

### Antes de desplegar, verifica:

1. **Supabase Storage - Crear bucket:**
   ```bash
   SUPABASE_URL=https://ezdcwbxyqsbdlyvroixw.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=xxx \
   node scripts/setup-supabase-bucket.js
   ```

2. **Variables de ambiente correctas:**
   - DATABASE_URL y SUPABASE_URL apuntan al MISMO proyecto Supabase
   - Proyecto ID: `ezdcwbxyqsbdlyvroixw`
   - Todas las claves API son válidas

3. **Test local:**
   ```bash
   npm run build
   npm run dev
   ```

## Pasos en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com)
2. Selecciona el proyecto `prescribe-tu-multa`
3. Ve a **Settings → Environment Variables**
4. Añade cada variable de ambiente
5. Haz redeploy del proyecto
6. Verifica que las URLs en Open Graph sean correctas

## Troubleshooting

### Error: "Bucket not found"
- Verifica que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY apunten al proyecto correcto
- Ejecuta el script setup-supabase-bucket.js para crear el bucket
- Verifica en Supabase Dashboard que el bucket `certificados` existe

### Error: "Failed to compile"
- Asegúrate de que NEXT_PUBLIC_SITE_URL está configurada
- Reinicia el build en Vercel

### Textos con encoding roto (AnÃ¡lisis)
- Verifica que NEXT_PUBLIC_SITE_URL está configurada
- Next.js automáticamente configura UTF-8 con metadataBase
- Haz un hard refresh del navegador (Cmd+Shift+R / Ctrl+Shift+R)

## Verificación Post-Despliegue

Después de desplegar, verifica:

1. **Open Graph**: https://www.opengraph.xyz/?url=https://prescribetumulta.cl
2. **Encoding**: Los acentos se ven correctamente en la página
3. **PDF Upload**: Intenta subir un PDF de prueba
4. **Emails**: Verifica que los emails se envíen correctamente
