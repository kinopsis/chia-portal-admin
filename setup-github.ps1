# Script PowerShell para conectar el repositorio local con GitHub
# Portal de Atención Ciudadana de Chía

Write-Host "🚀 Configurando conexión con GitHub para chia-portal-admin" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar que git está inicializado
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: No se encontró repositorio git. Ejecuta 'git init' primero." -ForegroundColor Red
    exit 1
}

# Solicitar el nombre de usuario de GitHub
$GITHUB_USER = Read-Host "📝 Ingresa tu nombre de usuario de GitHub"

if ([string]::IsNullOrWhiteSpace($GITHUB_USER)) {
    Write-Host "❌ Error: Nombre de usuario requerido." -ForegroundColor Red
    exit 1
}

# Configurar remote origin
$REPO_URL = "https://github.com/$GITHUB_USER/chia-portal-admin.git"
Write-Host "🔗 Configurando remote origin: $REPO_URL" -ForegroundColor Yellow

# Verificar si ya existe un remote origin
try {
    $existingOrigin = git remote get-url origin 2>$null
    if ($existingOrigin) {
        Write-Host "⚠️  Remote origin ya existe. Actualizando..." -ForegroundColor Yellow
        git remote set-url origin $REPO_URL
    }
} catch {
    Write-Host "➕ Agregando remote origin..." -ForegroundColor Cyan
    git remote add origin $REPO_URL
}

# Verificar la rama actual
$CURRENT_BRANCH = git branch --show-current
Write-Host "📍 Rama actual: $CURRENT_BRANCH" -ForegroundColor Cyan

# Si estamos en feature/initial-setup, cambiar a main primero
if ($CURRENT_BRANCH -eq "feature/initial-setup") {
    Write-Host "🔄 Cambiando a rama main..." -ForegroundColor Yellow
    git checkout main
}

# Subir rama main
Write-Host "⬆️  Subiendo rama main..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Rama main subida exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al subir rama main. Verifica que el repositorio existe en GitHub." -ForegroundColor Red
    Write-Host "   Crea el repositorio en: https://github.com/new" -ForegroundColor Yellow
    Write-Host "   Nombre: chia-portal-admin" -ForegroundColor Yellow
    Write-Host "   Descripción: Portal de Atención Ciudadana de Chía - Sistema municipal con IA integrada" -ForegroundColor Yellow
    Write-Host "   Público: Sí" -ForegroundColor Yellow
    Write-Host "   NO inicializar con README" -ForegroundColor Yellow
    exit 1
}

# Cambiar a rama de desarrollo
Write-Host "🔄 Cambiando a rama feature/initial-setup..." -ForegroundColor Yellow
git checkout feature/initial-setup

# Subir rama de desarrollo
Write-Host "⬆️  Subiendo rama feature/initial-setup..." -ForegroundColor Yellow
git push -u origin feature/initial-setup

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Rama feature/initial-setup subida exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al subir rama de desarrollo" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada exitosamente!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ir a: https://github.com/$GITHUB_USER/chia-portal-admin" -ForegroundColor White
Write-Host "2. Crear Pull Request desde 'feature/initial-setup' hacia 'main'" -ForegroundColor White
Write-Host "3. Configurar Coolify con el repositorio" -ForegroundColor White
Write-Host ""
Write-Host "🔗 URLs importantes:" -ForegroundColor Cyan
Write-Host "   - Repositorio: https://github.com/$GITHUB_USER/chia-portal-admin" -ForegroundColor White
Write-Host "   - Pull Requests: https://github.com/$GITHUB_USER/chia-portal-admin/pulls" -ForegroundColor White
Write-Host "   - Actions: https://github.com/$GITHUB_USER/chia-portal-admin/actions" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulta DEPLOYMENT.md para instrucciones de despliegue en Coolify" -ForegroundColor Yellow
