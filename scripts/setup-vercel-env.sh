#!/bin/bash

# Vercel Environment Variables Setup Script
# Este script configura todas las variables de ambiente requeridas en Vercel

set -e

echo "=========================================="
echo "Prescribe Tu Multa - Vercel Setup Script"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables a configurar
declare -A ENV_VARS=(
  ["NEXT_PUBLIC_SITE_URL"]="https://prescribetumulta.cl"
  ["SUPABASE_URL"]="https://ezdcwbxyqsbdlyvroixw.supabase.co"
  ["NEXT_PUBLIC_SUPABASE_URL"]="https://ezdcwbxyqsbdlyvroixw.supabase.co"
  ["NEXTAUTH_URL"]="https://prescribetumulta.cl"
)

echo -e "${YELLOW}Este script configurará las variables de ambiente en Vercel.${NC}"
echo ""
echo "Variables a configurar:"
echo "  - NEXT_PUBLIC_SITE_URL"
echo "  - SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXTAUTH_URL"
echo "  - SUPABASE_SERVICE_ROLE_KEY (solicitar al usuario)"
echo "  - DATABASE_URL (solicitar al usuario)"
echo "  - DIRECT_URL (solicitar al usuario)"
echo "  - NEXTAUTH_SECRET (solicitar al usuario)"
echo "  - RESEND_API_KEY (solicitar al usuario)"
echo "  - ANTHROPIC_API_KEY (solicitar al usuario)"
echo ""

# Verificar que vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI no está instalado.${NC}"
  echo "Instálalo con: npm install -g vercel"
  exit 1
fi

echo -e "${GREEN}✅ Vercel CLI detectado${NC}"
echo ""

# Verificar que estamos logueados en Vercel
echo -e "${YELLOW}Verificando login en Vercel...${NC}"
if ! vercel projects --json &> /dev/null; then
  echo -e "${YELLOW}No estás logueado. Iniciando login...${NC}"
  vercel login
fi

echo ""
echo -e "${YELLOW}Selecciona el proyecto:${NC}"
vercel projects --json > /tmp/vercel_projects.json

# Mostrar proyectos disponibles
echo "Proyectos disponibles:"
cat /tmp/vercel_projects.json | grep '"name"' | head -10

echo ""
read -p "Ingresa el nombre del proyecto (prescribe-tu-multa): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-prescribe-tu-multa}

echo ""
echo -e "${YELLOW}Configurando variables de ambiente para proyecto: $PROJECT_NAME${NC}"
echo ""

# Variables públicas (sin credenciales sensibles)
echo -e "${GREEN}1. Configurando variables públicas...${NC}"
for VAR in "${!ENV_VARS[@]}"; do
  VALUE="${ENV_VARS[$VAR]}"
  echo -n "  Configurando $VAR... "
  vercel env add "$VAR" production < <(echo "$VALUE") 2>/dev/null || echo "⚠️ Ya existe"
  echo "✅"
done

echo ""
echo -e "${YELLOW}2. Variables sensibles (requieren valores reales):${NC}"
echo ""
echo "Necesitas configurar estas variables manualmente:"
echo ""

SENSITIVE_VARS=(
  "SUPABASE_SERVICE_ROLE_KEY:Obtenlo de Supabase Dashboard > Settings > API"
  "DATABASE_URL:URL de conexión PostgreSQL (Supabase)"
  "DIRECT_URL:URL de conexión directa a PostgreSQL"
  "NEXTAUTH_SECRET:Generado: ED5+AQEQGi0Rl9zDxcnIkIbw/3bAvjAib8c3b3ba+qo="
  "RESEND_API_KEY:Obtenlo de https://resend.com/api-keys"
  "ANTHROPIC_API_KEY:Obtenlo de https://console.anthropic.com"
  "MERCADO_PAGO_ACCESS_TOKEN:Obtenlo de Mercado Pago Dashboard"
)

for VAR_INFO in "${SENSITIVE_VARS[@]}"; do
  VAR_NAME="${VAR_INFO%:*}"
  VAR_HINT="${VAR_INFO#*:}"
  echo "  $VAR_NAME"
  echo "    Descripción: $VAR_HINT"
  echo ""
  read -s -p "    Ingresa el valor (o presiona Enter para saltear): " VAR_VALUE
  echo ""
  if [ ! -z "$VAR_VALUE" ]; then
    echo -n "    Configurando... "
    vercel env add "$VAR_NAME" production < <(echo "$VAR_VALUE") 2>/dev/null || echo "⚠️ Error"
    echo "✅"
  fi
  echo ""
done

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Configuración completada!"
echo "==========================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Verifica que todas las variables estén configuradas:"
echo "   vercel env ls"
echo ""
echo "2. Crea el bucket de Supabase:"
echo "   npm run build"
echo "   node scripts/setup-supabase-bucket.js"
echo ""
echo "3. Haz trigger a un redeploy en Vercel para que los cambios tomen efecto"
echo ""
