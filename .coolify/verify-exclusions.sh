#!/bin/bash

# Script para verificar que las exclusiones de documentación funcionan correctamente
# Portal de Atención Ciudadana de Chía

set -e

echo "🔍 Verificando exclusiones de documentación..."

# Función para verificar si un archivo/directorio está excluido
check_exclusion() {
    local path="$1"
    local description="$2"
    
    if [ -e "$path" ]; then
        echo "❌ ADVERTENCIA: $description encontrado en: $path"
        echo "   Este archivo/directorio debería estar excluido del build"
        return 1
    else
        echo "✅ $description correctamente excluido"
        return 0
    fi
}

# Verificar exclusiones en el directorio de build
BUILD_DIR=".next"
if [ -d "$BUILD_DIR" ]; then
    echo "📦 Verificando build directory: $BUILD_DIR"
    
    # Verificar que no hay archivos de documentación en el build
    if find "$BUILD_DIR" -name "*.md" -o -name "Docs" -o -name "docs" | grep -q .; then
        echo "❌ ADVERTENCIA: Archivos de documentación encontrados en el build:"
        find "$BUILD_DIR" -name "*.md" -o -name "Docs" -o -name "docs" || true
    else
        echo "✅ No se encontraron archivos de documentación en el build"
    fi
else
    echo "📦 Build directory no encontrado (normal si no se ha ejecutado build)"
fi

# Verificar .dockerignore
echo "🐳 Verificando .dockerignore..."
if grep -q "Docs/" .dockerignore; then
    echo "✅ Docs/ está en .dockerignore"
else
    echo "❌ ADVERTENCIA: Docs/ no está en .dockerignore"
fi

# Verificar que la carpeta Docs existe en el proyecto
if [ -d "Docs" ]; then
    echo "📁 Carpeta Docs encontrada en el proyecto"
    echo "📊 Contenido de Docs:"
    ls -la Docs/ | head -10
    echo "📏 Tamaño total de Docs: $(du -sh Docs 2>/dev/null || echo 'No calculable')"
else
    echo "📁 Carpeta Docs no encontrada en el proyecto"
fi

# Verificar configuración de Next.js
echo "⚙️ Verificando next.config.js..."
if grep -q "ignore-loader" next.config.js; then
    echo "✅ Configuración de webpack para excluir archivos .md encontrada"
else
    echo "❌ ADVERTENCIA: Configuración de webpack para excluir .md no encontrada"
fi

echo ""
echo "🎯 Resumen de verificación:"
echo "   - Los archivos de documentación deben estar excluidos del build de producción"
echo "   - Esto reduce el tamaño del bundle y mejora la seguridad"
echo "   - La carpeta Docs/ debe existir en desarrollo pero no en producción"

echo ""
echo "✅ Verificación de exclusiones completada"
