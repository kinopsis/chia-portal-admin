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

Write-Host ""
Write-Host "📋 PASO 1: Crear repositorio en GitHub" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "1. Ve a: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Repository name: chia-portal-admin" -ForegroundColor Yellow
Write-Host "3. Description: Portal de Atención Ciudadana de Chía - Sistema municipal con IA integrada" -ForegroundColor Yellow
Write-Host "4. Visibility: Public" -ForegroundColor Yellow
Write-Host "5. NO marcar 'Initialize with README'" -ForegroundColor Yellow
Write-Host "6. Hacer clic en 'Create repository'" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "¿Ya creaste el repositorio en GitHub? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "❌ Por favor crea el repositorio primero y luego ejecuta este script nuevamente." -ForegroundColor Red
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

Write-Host ""
Write-Host "📋 PASO 3: Crear Pull Request" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "1. Ve a: https://github.com/$GITHUB_USER/chia-portal-admin" -ForegroundColor Yellow
Write-Host "2. Hacer clic en 'Compare & pull request' (aparecerá automáticamente)" -ForegroundColor Yellow
Write-Host "3. O ir a 'Pull requests' → 'New pull request'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Configuración del Pull Request:" -ForegroundColor White
Write-Host "- Base: main" -ForegroundColor Gray
Write-Host "- Compare: feature/initial-setup" -ForegroundColor Gray
Write-Host "- Title: Initial Setup - Portal de Atención Ciudadana Ready for Deployment" -ForegroundColor Gray
Write-Host ""
Write-Host "📄 Descripción del PR (copia y pega):" -ForegroundColor White
Write-Host "Ver archivo GITHUB_SETUP.md para la descripción completa del Pull Request" -ForegroundColor Gray
Write-Host ""

Write-Host "🔗 URLs importantes:" -ForegroundColor Cyan
Write-Host "   - Repositorio: https://github.com/$GITHUB_USER/chia-portal-admin" -ForegroundColor White
Write-Host "   - Pull Requests: https://github.com/$GITHUB_USER/chia-portal-admin/pulls" -ForegroundColor White
Write-Host "   - New PR: https://github.com/$GITHUB_USER/chia-portal-admin/compare/main...feature/initial-setup" -ForegroundColor White
Write-Host ""

Write-Host "📋 Próximos pasos para Coolify:" -ForegroundColor Cyan
Write-Host "1. Merge el Pull Request" -ForegroundColor White
Write-Host "2. Configurar proyecto en Coolify" -ForegroundColor White
Write-Host "3. Configurar variables de entorno" -ForegroundColor White
Write-Host "4. Desplegar en producción" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulta DEPLOYMENT.md para instrucciones detalladas de despliegue en Coolify" -ForegroundColor Yellow

# Abrir URLs automáticamente
Write-Host ""
$openBrowser = Read-Host "¿Quieres abrir el repositorio en el navegador? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "https://github.com/$GITHUB_USER/chia-portal-admin"
    Start-Sleep -Seconds 2
    Start-Process "https://github.com/$GITHUB_USER/chia-portal-admin/compare/main...feature/initial-setup"
}
