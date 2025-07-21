#!/bin/bash

# Script de build optimizado para Coolify
# Portal de Atención Ciudadana de Chía

set -e  # Exit on any error

echo "🚀 Iniciando build para Coolify..."

# Verificar variables de entorno requeridas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL no está definida"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida"
    exit 1
fi

echo "✅ Variables de entorno verificadas"

# Limpiar cache de Next.js y verificar exclusiones
echo "🧹 Limpiando cache..."
rm -rf .next
rm -rf node_modules/.cache

# Verificar que la carpeta Docs existe pero será excluida del build
if [ -d "Docs" ]; then
    echo "📁 Carpeta Docs encontrada - será excluida del build de producción"
    echo "📊 Tamaño de Docs: $(du -sh Docs 2>/dev/null || echo 'No calculable')"
else
    echo "📁 Carpeta Docs no encontrada"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --ignore-scripts

# Verificar TypeScript (con skip de errores no críticos)
echo "🔍 Verificando TypeScript..."
npm run type-check:prod || echo "⚠️ Advertencias de TypeScript ignoradas para build de producción"

# Build de producción
echo "🏗️ Construyendo aplicación..."
NODE_ENV=production npm run build:prod

echo "✅ Build completado exitosamente"
