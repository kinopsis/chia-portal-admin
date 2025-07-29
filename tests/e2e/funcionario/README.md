# Pruebas E2E - Dashboard Funcionario - Funcionalidad de Búsqueda

Este directorio contiene las pruebas End-to-End (E2E) para validar la funcionalidad de búsqueda en las páginas del dashboard funcionario del Portal de Atención Ciudadana de Chía.

## 📋 Descripción General

Las pruebas validan que la funcionalidad de búsqueda implementada en el componente `DataTable` funcione correctamente en todas las páginas del dashboard funcionario, incluyendo:

- **Trámites** (`/funcionario/tramites`)
- **OPAs** (`/funcionario/opas`) 
- **FAQs** (`/funcionario/faqs`)

## 🗂️ Estructura de Archivos

```
tests/e2e/funcionario/
├── README.md                                    # Esta documentación
├── auth-setup.ts                               # Utilidades de autenticación
├── search-utils.ts                             # Utilidades de búsqueda
├── funcionario-tramites-search.spec.ts         # Pruebas de búsqueda en trámites
├── funcionario-opas-search.spec.ts             # Pruebas de búsqueda en OPAs
├── funcionario-faqs-search.spec.ts             # Pruebas de búsqueda en FAQs
└── funcionario-search-integration.spec.ts      # Pruebas de integración
```

## 🧪 Casos de Prueba Cubiertos

### Para cada página (Trámites, OPAs, FAQs):

#### ✅ **Funcionalidad Básica**
- Verificar que el campo de búsqueda esté visible y funcional
- Validar placeholder y accesibilidad del input
- Confirmar que el input esté habilitado

#### ✅ **Búsqueda por Campos Específicos**
- **Trámites**: código, nombre, subdependencia, tipo_pago
- **OPAs**: código, nombre, subdependencia, estado
- **FAQs**: pregunta, categoria, subdependencia, estado

#### ✅ **Comportamiento de Búsqueda**
- Filtrado en tiempo real mientras el usuario escribe
- Búsqueda case-insensitive (mayúsculas/minúsculas)
- Limpieza de resultados al borrar el texto de búsqueda
- Manejo de casos sin resultados (estado vacío)

#### ✅ **Validaciones Técnicas**
- Solo buscar en columnas marcadas como `searchable`
- Verificar que no haya errores de JavaScript en consola
- Validar que los datos se filtren por la dependencia del usuario
- Preservar estado de búsqueda durante interacciones con la tabla

#### ✅ **Accesibilidad y Responsividad**
- Verificaciones de accesibilidad básica (ARIA labels, focus)
- Pruebas en diferentes tamaños de pantalla (móvil, tablet, desktop)
- Navegación por teclado

#### ✅ **Casos Edge**
- Manejo de caracteres especiales (ñ, acentos, símbolos)
- Términos de búsqueda muy largos
- Búsquedas consecutivas rápidas
- Actualización de página durante búsqueda

### Pruebas de Integración:
- Consistencia de funcionalidad entre páginas
- Preservación de sesión durante operaciones de búsqueda
- Navegación entre páginas con búsquedas activas
- Operaciones concurrentes en múltiples pestañas
- Rendimiento de búsqueda
- Manejo de interrupciones de red

## 🚀 Ejecución de Pruebas

### Prerrequisitos
1. **Servidor de desarrollo corriendo**:
   ```bash
   npm run dev
   ```
   El servidor debe estar disponible en `http://localhost:3000`

2. **Playwright instalado**:
   ```bash
   npm install @playwright/test
   npx playwright install --with-deps
   ```

### Comandos de Ejecución

#### Ejecutar todas las pruebas de funcionario:
```bash
npm run test:e2e:funcionario
```

#### Ejecutar solo las pruebas de búsqueda con script personalizado:
```bash
npm run test:e2e:funcionario:search
```

#### Ejecutar pruebas específicas:
```bash
# Solo trámites
npx playwright test tests/e2e/funcionario/funcionario-tramites-search.spec.ts

# Solo OPAs
npx playwright test tests/e2e/funcionario/funcionario-opas-search.spec.ts

# Solo FAQs
npx playwright test tests/e2e/funcionario/funcionario-faqs-search.spec.ts

# Solo integración
npx playwright test tests/e2e/funcionario/funcionario-search-integration.spec.ts
```

#### Ejecutar con interfaz visual:
```bash
npm run test:e2e:ui
```

#### Ejecutar en modo debug:
```bash
npm run test:e2e:debug
```

#### Ejecutar con navegador visible:
```bash
npm run test:e2e:headed
```

## 👤 Configuración de Usuario de Prueba

Las pruebas utilizan un usuario funcionario de prueba configurado en `auth-setup.ts`:

```typescript
const TEST_FUNCIONARIO = {
  email: 'funcionario.test@chia.gov.co',
  password: 'TestPassword123!',
  nombre: 'Funcionario Test',
  dependencia: 'Secretaría de Gobierno'
}
```

**Nota**: Este usuario debe existir en la base de datos de desarrollo con:
- Rol: `funcionario`
- Estado: `activo`
- Dependencia asignada: `Secretaría de Gobierno`

## 📊 Reportes

Después de ejecutar las pruebas, se generan varios tipos de reportes:

- **HTML Report**: `playwright-report/index.html` (se abre automáticamente)
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`

## 🔧 Configuración de Navegadores

Las pruebas se ejecutan en múltiples navegadores configurados en `playwright.config.ts`:

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)
- **Tablet**: iPad Pro

## 🐛 Solución de Problemas

### Error: "Development server not running"
```bash
# Asegúrate de que el servidor esté corriendo
npm run dev
```

### Error: "Playwright browsers not installed"
```bash
# Instala los navegadores
npx playwright install --with-deps
```

### Error: "Test user not found"
- Verifica que el usuario de prueba exista en la base de datos
- Confirma que tenga el rol `funcionario` y esté activo
- Asegúrate de que tenga una dependencia asignada

### Pruebas lentas o timeout
- Aumenta los timeouts en `playwright.config.ts`
- Verifica la conexión a la base de datos
- Revisa que no haya procesos que consuman muchos recursos

## 📝 Mantenimiento

### Actualizar datos de prueba:
- Modifica `TEST_FUNCIONARIO` en `auth-setup.ts`
- Actualiza los términos de búsqueda esperados en cada spec file

### Agregar nuevos casos de prueba:
1. Identifica el archivo spec correspondiente
2. Agrega el nuevo test siguiendo el patrón existente
3. Utiliza las utilidades de `search-utils.ts`
4. Actualiza esta documentación

### Modificar configuración:
- Timeouts: `playwright.config.ts`
- Navegadores: `playwright.config.ts` → `projects`
- Base URL: `playwright.config.ts` → `use.baseURL`

## 🎯 Objetivos de Calidad

Estas pruebas aseguran que:

1. ✅ La funcionalidad de búsqueda funcione consistentemente
2. ✅ No haya regresiones en la experiencia de usuario
3. ✅ La aplicación sea accesible y responsive
4. ✅ Los datos estén correctamente filtrados por dependencia
5. ✅ No existan errores de JavaScript durante el uso
6. ✅ La aplicación maneje casos edge apropiadamente
