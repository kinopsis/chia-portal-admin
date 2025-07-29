#!/bin/bash

# Script para ejecutar pruebas E2E de búsqueda del dashboard funcionario
# Portal de Atención Ciudadana de Chía

set -e

echo "🚀 Iniciando pruebas E2E de búsqueda para dashboard funcionario..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que el servidor de desarrollo esté corriendo
log "Verificando servidor de desarrollo..."
if ! curl -s http://localhost:3000 > /dev/null; then
    error "El servidor de desarrollo no está corriendo en puerto 3000"
    error "Por favor ejecuta: npm run dev"
    exit 1
fi
success "Servidor de desarrollo está corriendo"

# Verificar que Playwright esté instalado
log "Verificando instalación de Playwright..."
if ! npx playwright --version > /dev/null 2>&1; then
    error "Playwright no está instalado"
    error "Por favor ejecuta: npm install @playwright/test"
    exit 1
fi
success "Playwright está instalado"

# Instalar navegadores si es necesario
log "Verificando navegadores de Playwright..."
npx playwright install --with-deps

# Función para ejecutar pruebas específicas
run_test_suite() {
    local test_file=$1
    local description=$2
    
    log "Ejecutando: $description"
    
    if npx playwright test "$test_file" --reporter=line; then
        success "✅ $description - PASÓ"
        return 0
    else
        error "❌ $description - FALLÓ"
        return 1
    fi
}

# Contador de resultados
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Ejecutar pruebas individuales
log "=== INICIANDO PRUEBAS DE BÚSQUEDA FUNCIONARIO ==="

# Pruebas de Trámites
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test_suite "tests/e2e/funcionario/funcionario-tramites-search.spec.ts" "Búsqueda de Trámites"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Pruebas de OPAs
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test_suite "tests/e2e/funcionario/funcionario-opas-search.spec.ts" "Búsqueda de OPAs"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Pruebas de FAQs
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test_suite "tests/e2e/funcionario/funcionario-faqs-search.spec.ts" "Búsqueda de FAQs"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Pruebas de Integración
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_test_suite "tests/e2e/funcionario/funcionario-search-integration.spec.ts" "Integración de Búsqueda"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Resumen de resultados
log "=== RESUMEN DE PRUEBAS ==="
log "Total de suites: $TOTAL_TESTS"
success "Suites exitosas: $PASSED_TESTS"
if [ $FAILED_TESTS -gt 0 ]; then
    error "Suites fallidas: $FAILED_TESTS"
else
    success "Suites fallidas: $FAILED_TESTS"
fi

# Ejecutar todas las pruebas juntas para reporte completo
log "=== GENERANDO REPORTE COMPLETO ==="
npx playwright test tests/e2e/funcionario/ --reporter=html,line

# Mostrar ubicación del reporte
log "=== REPORTES GENERADOS ==="
log "Reporte HTML: playwright-report/index.html"
log "Resultados JSON: test-results/results.json"
log "Resultados JUnit: test-results/results.xml"

# Abrir reporte HTML si está disponible
if command -v xdg-open > /dev/null; then
    log "Abriendo reporte HTML..."
    xdg-open playwright-report/index.html
elif command -v open > /dev/null; then
    log "Abriendo reporte HTML..."
    open playwright-report/index.html
elif command -v start > /dev/null; then
    log "Abriendo reporte HTML..."
    start playwright-report/index.html
else
    log "Para ver el reporte HTML, abre: playwright-report/index.html"
fi

# Código de salida
if [ $FAILED_TESTS -gt 0 ]; then
    error "Algunas pruebas fallaron. Revisa los reportes para más detalles."
    exit 1
else
    success "¡Todas las pruebas pasaron exitosamente!"
    exit 0
fi
