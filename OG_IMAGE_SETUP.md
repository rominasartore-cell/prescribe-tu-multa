# Open Graph Image Dinámico con ogcdn.net

## Descripción

Se configuró una imagen Open Graph **dinámica** usando ogcdn.net. Esto permite generar imágenes sociales personalizadas sin necesidad de almacenar múltiples archivos de imagen.

## Formato de URL

```
https://ogcdn.net/{templateId}/v{version}/{variable1}/{variable2}/{variable3}/.../og.png
```

### Componentes:

- **`{templateId}`**: ID único del template en ogcdn.net
- **`{version}`**: Versión del template (ej: v1, v2)
- **`{variable1}, {variable2}, etc`**: Variables dinámicas
  - **URL Encoded**: Todos los espacios, acentos y caracteres especiales deben estar codificados
  - **Default Values**: Si una variable usa su valor por defecto, reemplazar con `_`
- **Termina en**: `/og.png`

## Ejemplo Actual

```
https://ogcdn.net/prescribe-tu-multa/v1/Prescribe%20Tu%20Multa/An%C3%A1lisis%20de%20Multas%20de%20Tr%C3%A1nsito/og.png
```

### Decodificación:
- `prescribe-tu-multa`: Template ID
- `v1`: Versión
- `Prescribe%20Tu%20Multa`: "Prescribe Tu Multa" (URL encoded)
- `An%C3%A1lisis%20de%20Multas%20de%20Tr%C3%A1nsito`: "Análisis de Multas de Tránsito" (URL encoded)

## Cómo Crear un Template en ogcdn.net

1. **Ve a**: https://www.opengraph.xyz/
2. **Crea un nuevo template** con tu diseño
3. **Obtén el Template ID** (ej: `prescribe-tu-multa`)
4. **Define variables dinámicas**:
   - Title (variable opcional)
   - Subtitle (variable opcional)
   - Description (variable opcional)
5. **Copia la URL base**

## Configuración en Vercel

### Opción 1: Usar URL Default (Recomendado para inicio)

No necesitas hacer nada. Se usará:
```
https://ogcdn.net/prescribe-tu-multa/v1/Prescribe%20Tu%20Multa/An%C3%A1lisis%20de%20Multas%20de%20Tr%C3%A1nsito/og.png
```

### Opción 2: Configurar URL Personalizada

1. Ve a Vercel Dashboard → prescribe-tu-multa → Settings → Environment Variables
2. Agrega variable:
   ```
   NEXT_PUBLIC_OG_IMAGE_URL=https://ogcdn.net/{tu-template-id}/v{version}/{var1}/{var2}/.../og.png
   ```
3. Haz redeploy

## Uso en el Código

En `app/layout.tsx`:

```typescript
const OG_IMAGE_URL =
  process.env.NEXT_PUBLIC_OG_IMAGE_URL ||
  'https://ogcdn.net/prescribe-tu-multa/v1/Prescribe%20Tu%20Multa/An%C3%A1lisis%20de%20Multas%20de%20Tr%C3%A1nsito/og.png';

export const metadata: Metadata = {
  openGraph: {
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE_URL,  // ← Usa la URL dinámmica
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE_URL],  // ← Usa la URL dinámica
  },
};
```

## Ventajas

✅ **Dinámico**: Cambia sin redeploy (si usas template con variables)
✅ **Sin archivos**: No necesita guardar PNGs en el proyecto
✅ **URL Encoded**: Soporta caracteres especiales (acentos, emojis, etc)
✅ **Configurable**: Usa `NEXT_PUBLIC_OG_IMAGE_URL` si necesitas cambiar
✅ **Social Sharing**: Funciona con Facebook, Twitter, LinkedIn, WhatsApp

## URL Encoding Referencia

| Carácter | Encoded |
|----------|---------|
| Espacio | `%20` |
| á | `%C3%A1` |
| é | `%C3%A9` |
| í | `%C3%AD` |
| ó | `%C3%B3` |
| ú | `%C3%BA` |
| ñ | `%C3%B1` |
| & | `%26` |
| # | `%23` |
| ? | `%3F` |

## Verificación

Para verificar que la imagen OG funciona:

1. **Online Validator**:
   - https://www.opengraph.xyz/?url=https://prescribetumulta.cl
   - https://cards-dev.twitter.com/validator

2. **En redes sociales**:
   - Pega el enlace en Facebook
   - Pega el enlace en Twitter
   - Pega el enlace en WhatsApp

Deberías ver la imagen personalizada de ogcdn.net.

## Solución de Problemas

### "Imagen no aparece"
- Verifica que la URL está completa: termina en `/og.png`
- Verifica URL encoding: espacios → `%20`, acentos → `%C3%A1`, etc
- Verifica que el template existe en ogcdn.net

### "Carácter especial se ve mal"
- Asegúrate de URL encodear: `Análisis` → `An%C3%A1lisis`
- Usa: https://www.urlencoder.org/ para verificar

### "Cambios no se aplican"
- Borra cache: Ctrl+Shift+R (hard refresh)
- Verifica en: https://www.opengraph.xyz/
- Haz redeploy en Vercel

## Variables de Ambiente

```bash
# .env.production
NEXT_PUBLIC_OG_IMAGE_URL=https://ogcdn.net/prescribe-tu-multa/v1/Prescribe%20Tu%20Multa/An%C3%A1lisis%20de%20Multas%20de%20Tr%C3%A1nsito/og.png
```

## Alternativas

Si no quieres usar ogcdn.net:

1. **Vercel OG Image Generation**: https://vercel.com/docs/functions/og-image-generation
2. **Cloudinary**: https://cloudinary.com/
3. **imgix**: https://www.imgix.com/
4. **CloudFront + Lambda**: Para control total

## Referencias

- **ogcdn.net**: https://www.opengraph.xyz/
- **OG Image Validator**: https://www.opengraph.xyz/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **URL Encoder**: https://www.urlencoder.org/
