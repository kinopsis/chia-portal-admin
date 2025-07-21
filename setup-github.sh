#!/bin/bash

# Script para conectar el repositorio local con GitHub
# Portal de Atención Ciudadana de Chía

echo "🚀 Configurando conexión con GitHub para chia-portal-admin"
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Verificar que git está inicializado
if [ ! -d ".git" ]; then
    echo "❌ Error: No se encontró repositorio git. Ejecuta 'git init' primero."
    exit 1
fi

# Solicitar el nombre de usuario de GitHub
read -p "📝 Ingresa tu nombre de usuario de GitHub: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Error: Nombre de usuario requerido."
    exit 1
fi

# Configurar remote origin
REPO_URL="https://github.com/$GITHUB_USER/chia-portal-admin.git"
echo "🔗 Configurando remote origin: $REPO_URL"

# Verificar si ya existe un remote origin
if git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  Remote origin ya existe. Actualizando..."
    git remote set-url origin "$REPO_URL"
else
    echo "➕ Agregando remote origin..."
    git remote add origin "$REPO_URL"
fi

# Verificar la rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $CURRENT_BRANCH"

# Si estamos en feature/initial-setup, cambiar a main primero
if [ "$CURRENT_BRANCH" = "feature/initial-setup" ]; then
    echo "🔄 Cambiando a rama main..."
    git checkout main
fi

# Subir rama main
echo "⬆️  Subiendo rama main..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Rama main subida exitosamente"
else
    echo "❌ Error al subir rama main. Verifica que el repositorio existe en GitHub."
    echo "   Crea el repositorio en: https://github.com/new"
    echo "   Nombre: chia-portal-admin"
    echo "   Descripción: Portal de Atención Ciudadana de Chía - Sistema municipal con IA integrada"
    echo "   Público: Sí"
    echo "   NO inicializar con README"
    exit 1
fi

# Cambiar a rama de desarrollo
echo "🔄 Cambiando a rama feature/initial-setup..."
git checkout feature/initial-setup

# Subir rama de desarrollo
echo "⬆️  Subiendo rama feature/initial-setup..."
git push -u origin feature/initial-setup

if [ $? -eq 0 ]; then
    echo "✅ Rama feature/initial-setup subida exitosamente"
else
    echo "❌ Error al subir rama de desarrollo"
    exit 1
fi

echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo "=================================================="
echo "📋 Próximos pasos:"
echo "1. Ir a: https://github.com/$GITHUB_USER/chia-portal-admin"
echo "2. Crear Pull Request desde 'feature/initial-setup' hacia 'main'"
echo "3. Configurar Coolify con el repositorio"
echo ""
echo "🔗 URLs importantes:"
echo "   - Repositorio: https://github.com/$GITHUB_USER/chia-portal-admin"
echo "   - Pull Requests: https://github.com/$GITHUB_USER/chia-portal-admin/pulls"
echo "   - Actions: https://github.com/$GITHUB_USER/chia-portal-admin/actions"
echo ""
echo "📖 Consulta DEPLOYMENT.md para instrucciones de despliegue en Coolify"
