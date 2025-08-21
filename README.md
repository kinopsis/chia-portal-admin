# Portal de Atención Ciudadana de Chía

Sistema municipal moderno con IA integrada para la gestión de trámites, OPAs, FAQs y atención ciudadana de la Alcaldía de Chía.

## 🚀 Características Principales

- **Portal Ciudadano**: Acceso completo a trámites y servicios municipales con datos en tiempo real
- **Sistema PQRS**: Gestión integral de peticiones, quejas, reclamos y sugerencias con seguimiento por radicado
- **Búsqueda Unificada**: Búsqueda inteligente en tiempo real across trámites, OPAs y FAQs con filtros avanzados
- **Dashboard Administrativo**: Gestión CRUD completa para funcionarios y administradores con métricas en vivo
- **Chatbot IA**: Asistente virtual con OpenAI GPT-4o-mini y búsqueda vectorial
- **Sistema de Autenticación**: Roles granulares (ciudadano, funcionario, admin)
- **Backend Integration**: Conexión completa a Supabase con datos reales y caching optimizado
- **Performance Optimized**: React Query, debouncing, y error boundaries para experiencia fluida
- **Accesibilidad WCAG AA**: Cumplimiento completo de estándares de accesibilidad
- **Arquitectura Escalable**: Next.js 15 + Supabase + TypeScript

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 15**: Framework React con App Router
- **React 18**: Librería de UI con hooks
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de utilidades CSS
- **Atomic Design**: Patrón de componentes

### Backend

- **Supabase**: PostgreSQL + Auth + Storage + Realtime + Vector
- **Row Level Security (RLS)**: Seguridad a nivel de datos
- **pgvector**: Búsqueda vectorial para IA
- **React Query**: Caching inteligente y gestión de estado del servidor
- **Real-time Data**: Conexión en vivo con base de datos para métricas y búsquedas
- **Error Boundaries**: Manejo robusto de errores en toda la aplicación

### IA y Chatbot

- **OpenAI GPT-4o-mini**: Generación de respuestas
- **text-embedding-3-small**: Embeddings vectoriales
- **Búsqueda híbrida**: Vectorial + texto completo

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Rutas públicas
│   ├── admin/             # Panel administrativo
│   ├── api/               # API Routes
│   ├── auth/              # Autenticación
│   ├── globals.css        # Estilos globales
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React (Atomic Design)
│   ├── atoms/             # Componentes básicos
│   ├── molecules/         # Componentes compuestos
│   ├── organisms/         # Componentes complejos
│   ├── layout/            # Componentes de layout
│   ├── admin/             # Componentes administrativos
│   └── ui/                # Componentes de UI reutilizables
├── contexts/              # React Contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuraciones
│   └── supabase/          # Configuración de Supabase
├── services/              # Servicios de API
├── types/                 # Definiciones de TypeScript
├── utils/                 # Funciones utilitarias
└── middleware.ts          # Middleware de Next.js
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm 8+
- Cuenta de Supabase
- Cuenta de OpenAI (opcional, para IA)

### 1. Clonar el repositorio

```bash
git clone [repository-url]
cd chia-portal
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📝 Scripts Disponibles

### Desarrollo
- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción

### Calidad de Código
- `npm run lint` - Ejecutar linting
- `npm run lint:fix` - Corregir errores de linting
- `npm run type-check` - Verificar tipos TypeScript
- `npm run format` - Formatear código con Prettier
- `npm run format:check` - Verificar formato de código

### Testing y Verificación
- `npm run test` - Ejecutar tests unitarios
- `npm run test:watch` - Ejecutar tests en modo watch
- `npm run test:coverage` - Ejecutar tests con cobertura
- `npm run test:integration` - Ejecutar tests de integración backend
- `npm run verify-database` - Verificar conexión y estructura de base de datos
- `npm run verify-production` - Verificar deployment en producción

### Deployment
- `npm run deploy:check` - Verificar antes de deployment
- `npm run deploy:vercel` - Deploy a Vercel

## 🎨 Colores Institucionales

```css
--color-primary-yellow: #ffdc00 /* Amarillo institucional */ --color-primary-yellow-alt: #f8e000
  /* Amarillo alternativo */ --color-primary-green: #009045 /* Verde institucional */
  --color-primary-green-alt: #009540 /* Verde alternativo */;
```

## 🏗️ Arquitectura de Componentes

### Atomic Design

- **Atoms**: Button, Input, Card, Badge
- **Molecules**: SearchBar, Breadcrumb, TramiteCard
- **Organisms**: Header, Footer, TramitesList, DashboardStats

### Gestión de Estado

- **React Context**: AuthContext para autenticación global
- **Custom Hooks**: useAuth, useSystemMetrics, useDataTable
- **Local State**: useState para estado de componentes

## 🔐 Autenticación y Roles

### Roles del Sistema

- **Ciudadano**: Consulta pública de información
- **Funcionario**: Gestión de contenido de su dependencia
- **Administrador**: Gestión completa del sistema

### Protección de Rutas

- Rutas públicas: `/`, `/dependencias`, `/tramites`, `/faqs`
- Rutas privadas: `/admin/*` (requiere autenticación)
- Rutas específicas: `/admin/usuarios` (solo admin)

## 📊 Base de Datos

### Tablas Principales

- `users` - Usuarios del sistema con roles
- `dependencias` - Dependencias municipales
- `subdependencias` - Subdependencias organizacionales
- `tramites` - Trámites municipales
- `opas` - Órdenes de Pago y Autorización
- `faqs` - Preguntas frecuentes
- `chatbot_knowledge` - Conocimiento vectorial para IA

### Políticas RLS

- Control de acceso por rol y dependencia
- Funcionarios solo gestionan su dependencia
- Administradores acceso completo

## 🤖 Integración de IA

### Chatbot Inteligente

- Respuestas basadas en contenido municipal
- Búsqueda vectorial en documentos
- Actualización automática de conocimiento
- Sistema de feedback de usuarios

### Configuración OpenAI

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

## 🧪 Testing

### Herramientas

- **Jest**: Testing unitario
- **React Testing Library**: Testing de componentes
- **Playwright**: Testing end-to-end (futuro)

### Ejecutar Tests

```bash
npm run test          # Ejecutar tests
npm run test:watch    # Ejecutar en modo watch
npm run test:coverage # Generar reporte de cobertura
```

## 🚀 Despliegue

### Producción con Coolify

1. Configurar variables de entorno en Coolify
2. Conectar repositorio Git
3. Configurar build commands:
   ```bash
   npm install && npm run build
   ```
4. Configurar start command:
   ```bash
   npm start
   ```

### Variables de Entorno Producción

- Configurar todas las variables de `.env.example`
- Usar URLs de producción para Supabase
- Configurar dominio personalizado
- Habilitar HTTPS

## 📈 Monitoreo y Métricas

### Métricas del Sistema

- Tiempo de respuesta del chatbot
- Satisfacción del usuario
- Uso de trámites y servicios
- Performance del dashboard

### Herramientas

- Google Analytics (opcional)
- Sentry para errores (opcional)
- Supabase Analytics

## 🤝 Contribución

### Flujo de Desarrollo

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- Seguir configuración ESLint y Prettier
- Escribir tests para nuevas funcionalidades
- Documentar componentes complejos
- Seguir convenciones de Atomic Design

## 🛡️ Manejo de Valores Null

El proyecto implementa un patrón de protección defensiva para manejar valores `null` y `undefined` en funciones de búsqueda:

### Patrón Recomendado
```typescript
// ✅ CORRECTO - Protegido con coalescencia nula
const normalizedValue = normalizeSpanishText((field || '').toLowerCase())
```

### Documentación Completa
- **Guía detallada**: [`docs/DEBUGGING-NULL-VALUES-GUIDE.md`](docs/DEBUGGING-NULL-VALUES-GUIDE.md)
- **Tests**: `src/tests/debug-tramites-null-fix.test.ts`
- **Archivos aplicados**: Todas las páginas de búsqueda y servicios

Este patrón previene errores `TypeError: Cannot read properties of null` y garantiza búsquedas robustas con datos incompletos.

## 📄 Licencia

Este proyecto es propiedad de la Alcaldía de Chía. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o consultas:

- Email: soporte@chia.gov.co
- Documentación: `/docs`
- Issues: GitHub Issues

---

**Versión**: 1.0.0  
**Última Actualización**: Julio 2025  
**Desarrollado para**: Alcaldía de Chía
