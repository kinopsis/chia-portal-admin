# Arquitectura General del Sistema – Portal Ciudadano

## 1. Visión General

El sistema es una plataforma web modular, segura y escalable, compuesta por:

- **Frontend:** Next.js 15 (React 18) – SPA/SSR con rutas públicas y protegidas.
- **Backend & BDD:** Supabase (PostgreSQL + Auth + Storage + Realtime + Vector).
- **IA:** OpenAI GPT-4o-mini con embeddings vectoriales para chatbot inteligente.
- **Despliegue:** Coolify (CI/CD, monitoreo, gestión de entornos).
- **Infraestructura:** Cloud-agnostic, orientada a contenedores y escalabilidad horizontal.

---

## 2. Componentes Principales

### a) Frontend (Next.js 15)

- **Rutas públicas**: Consulta de trámites, OPAs, FAQs, chatbot IA integrado.
- **Rutas privadas**: Dashboard administrativo (`/admin`) con gestión CRUD completa.
- **Gestión de autenticación**: Supabase Auth (JWT), roles granulares y protección de rutas.
- **Consumo de APIs**: Directamente hacia Supabase (REST) y OpenAI (chatbot).
- **Patrones de diseño**: Atomic Design con componentes reutilizables.

### b) Backend (Supabase)

- **Base de datos relacional (PostgreSQL)**: Tablas para usuarios, roles, trámites, OPAs, dependencias, subdependencias, FAQs, logs de auditoría.
- **Vector Store (pgvector)**: Almacenamiento de embeddings para búsqueda semántica del chatbot.
- **Auth**: Gestión de usuarios, roles (ciudadano, funcionario, admin), recuperación y registro seguro.
- **Policies y RLS**: Row Level Security para proteger datos según rol y dependencias asignadas.
- **Funciones (RPC)**: Lógica avanzada (búsqueda híbrida, estadísticas, auditoría).

### c) Integración de IA (OpenAI)

- **Chatbot inteligente**: GPT-4o-mini integrado en frontend, accediendo a datos vectoriales.
- **Embeddings**: text-embedding-3-small (1536 dimensiones) para búsqueda semántica.
- **Búsqueda híbrida**: Combinación de búsqueda vectorial y texto completo.
- **Actualización automática**: Regeneración de embeddings cuando se modifican datos.
- **Costo estimado**: $20-50 USD mensual para 10,000 consultas.

### d) Dashboard Administrativo

- **Ruta protegida**: `/admin` con autenticación obligatoria y verificación de roles.
- **Gestión CRUD**: Interfaz completa para trámites, OPAs, FAQs, dependencias y usuarios.
- **Métricas en tiempo real**: Dashboard con estadísticas filtradas por rol y permisos.
- **Componentes reutilizables**: DataTable, SearchAndFilters, ConfirmDialog, DashboardStats.
- **Diseño responsive**: Adaptado a desktop, tablet y móvil con colores institucionales.

### e) Despliegue e Infraestructura (Coolify)

- **CI/CD**: Despliegue automatizado de frontend y backend.
- **Entornos**: Producción y pruebas, con rollback sencillo.
- **Monitoreo**: Logs, métricas básicas, alertas configurables.

---

## 3. Mejores Prácticas Aplicadas

- **Seguridad**: Autenticación y autorización estricta, RLS en Supabase, validación de datos, HTTPS obligatorio.
- **IA Responsable**: Uso ético de OpenAI, validación de respuestas, feedback de usuarios, transparencia en fuentes.
- **Escalabilidad**: Arquitectura desacoplada, escalable horizontalmente, uso de CDN para assets.
- **Accesibilidad**: Cumplimiento WCAG AA en UI, navegación por teclado, ARIA labels.
- **Auditoría y trazabilidad**: Logs de cambios, historial de usuarios y operaciones críticas.
- **Desarrollo ágil**: Monorepo, CI/CD, integración y despliegue continuo.
- **Developer Experience**: Documentación clara, scripts de setup, entorno de pruebas local.
- **Costos y sostenibilidad**: Uso de tecnologías open source, monitoreo de consumo de IA.

---

## 4. Diagrama de Alto Nivel (Descriptivo)

```
[Usuario Ciudadano]
   │
   ▼
[Next.js Frontend] ──► [Supabase Auth & API] ──► [PostgreSQL DB + Vector Store]
   │                          │                           │
   │                          └─► [Storage (archivos)]    │
   │                                                      │
   └─► [Chatbot IA] ──► [OpenAI API] ──► [Embeddings] ────┘
   │
[Usuario Admin/Funcionario]
   │
   ▼
[Dashboard Admin (/admin)] ──► [CRUD Operations] ──► [Audit Logs]
   │
[Coolify] (gestiona despliegue, CI/CD y monitoreo de todos los componentes)
```

---

## 5. Estructura de Carpetas Actualizada

```
/project-root
│
├── /apps
│   ├── /web                # Next.js frontend y rutas API
│   │   ├── /app
│   │   │   ├── /(public)   # Rutas públicas
│   │   │   ├── /admin      # Dashboard administrativo
│   │   │   ├── /api        # API routes (incluyendo /api/chat)
│   │   │   └── /auth       # Autenticación
│   │   ├── /components     # Atomic Design
│   │   │   ├── /atoms      # Button, Input, Card, Badge
│   │   │   ├── /molecules  # DataTable, SearchAndFilters
│   │   │   ├── /organisms  # Dashboard, Chatbot, AdminSidebar
│   │   │   └── /layout     # Header, Footer, AdminLayout
│   │   ├── /hooks          # useAuth, useSystemMetrics, useChat
│   │   ├── /services       # APIs (tramitesApi, chatApi, dashboardApi)
│   │   └── /lib            # Supabase client, OpenAI config
│   └── /admin-scripts      # Scripts CLI para embeddings, migraciones
├── /supabase
│   ├── /migrations         # SQL de migraciones y seeds
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_chatbot_tables.sql
│   │   └── 003_vector_functions.sql
│   ├── /functions          # Edge Functions
│   └── /policies           # Políticas RLS y seguridad
├── /docs                   # Documentación, PRD, diagramas
│   ├── /chatbot-ia-spec.md # Especificación técnica del chatbot
│   └── /dashboard-spec.md  # Especificación del dashboard
├── /scripts                # Automatización (deploy, backup, embeddings)
├── .env*
├── package.json
├── README.md
└── ...otros archivos
```

---

## 6. Flujo de Autenticación Multi-Rol Actualizado

1. **Registro/Login**: Supabase Auth (email/password, OAuth). Rol por defecto: ciudadano.
2. **Obtención del rol**: Tras login, el frontend consulta el campo `rol` y `dependencias_ids` en la tabla `users`.
3. **AuthContext**: Mantiene el estado de autenticación, rol y permisos granulares.
4. **Protección de rutas**:
   - Públicas: consulta y chatbot IA
   - Privadas: `/admin` (funcionario/admin)
   - Específicas: `/admin/usuarios` (solo admin)
5. **RLS en Supabase**: Policies para que solo admin gestione usuarios, funcionarios gestionen según dependencias asignadas.

---

## 7. Modelo de Datos Actualizado

### Tablas Principales Existentes:

- **users:** id (uuid), email, nombre, apellido, rol (ciudadano/funcionario/admin), dependencias_ids (array), activo
- **dependencias/subdependencias:** Estructura jerárquica para organización municipal
- **tramites, opas, faqs:** Asociados a subdependencias/dependencias, con trazabilidad de autoría y fecha
- **logs_auditoria:** Registro de acciones críticas para trazabilidad y cumplimiento

### Nuevas Tablas para IA:

```sql
-- Conocimiento vectorial para el chatbot
CREATE TABLE chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_type VARCHAR(20) NOT NULL, -- 'tramite', 'opa', 'faq'
  source_id UUID NOT NULL, -- ID del registro original
  embedding VECTOR(1536), -- OpenAI embeddings
  metadata JSONB, -- Información adicional (nombre, código, dependencia)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Historial de conversaciones del chatbot
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context_used JSONB, -- Documentos utilizados para la respuesta
  feedback INTEGER, -- 1: útil, -1: no útil, 0: sin feedback
  response_time_ms INTEGER, -- Tiempo de respuesta para métricas
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX ON chatbot_knowledge USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON chat_conversations (session_id);
CREATE INDEX ON chat_conversations (created_at);
```

### Funciones RPC para IA:

```sql
-- Búsqueda híbrida (semántica + texto completo)
CREATE OR REPLACE FUNCTION search_knowledge(
  query_text TEXT,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
) RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type VARCHAR,
  source_id UUID,
  metadata JSONB,
  similarity FLOAT
);
```

---

## 8. Arquitectura del Dashboard Administrativo

### Componentes Principales:

- **AdminLayout**: Layout base con sidebar y header
- **AdminSidebar**: Navegación diferenciada por rol
- **DashboardStats**: Métricas en tiempo real
- **DataTable**: Tabla reutilizable con filtros y paginación
- **SearchAndFilters**: Componente de búsqueda avanzada
- **CRUD Forms**: Formularios con validación para cada entidad

### Rutas del Dashboard:

```
/admin                    # Dashboard principal
├── /tramites            # Gestión de trámites
├── /opas                # Gestión de OPAs
├── /faqs                # Gestión de FAQs
├── /dependencias        # Gestión de dependencias
├── /usuarios            # Gestión de usuarios (solo admin)
├── /estadisticas        # Dashboard de métricas (solo admin)
└── /auditoria          # Logs de auditoría (solo admin)
```

### Patrones de Diseño Implementados:

- **Atomic Design**: Atoms → Molecules → Organisms → Templates
- **Compound Components**: Para componentes complejos como DataTable
- **Custom Hooks**: useAuth, useDashboardStats, useDataTable
- **Context API**: AuthContext para estado global de autenticación

---

## 9. Integración de IA - Arquitectura Técnica

### Flujo de Procesamiento del Chatbot:

1. **Usuario envía mensaje** → Frontend captura input
2. **Generación de embedding** → OpenAI text-embedding-3-small
3. **Búsqueda híbrida** → Supabase RPC (vectorial + texto completo)
4. **Construcción de contexto** → Documentos relevantes encontrados
5. **Generación de respuesta** → OpenAI GPT-4o-mini con contexto
6. **Almacenamiento** → Conversación guardada en BD
7. **Respuesta al usuario** → Con fuentes y referencias

### Actualización Automática de Conocimiento:

```sql
-- Trigger para actualizar embeddings cuando cambian los datos
CREATE OR REPLACE FUNCTION update_chatbot_knowledge()
RETURNS TRIGGER AS $$
BEGIN
  -- Marcar para regeneración de embedding
  INSERT INTO embedding_update_queue (table_name, record_id, action)
  VALUES (TG_TABLE_NAME, NEW.id, TG_OP);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER tramites_embedding_update
  AFTER INSERT OR UPDATE ON tramites
  FOR EACH ROW EXECUTE FUNCTION update_chatbot_knowledge();
```

### Métricas y Monitoreo de IA:

- Tiempo de respuesta promedio del chatbot
- Satisfacción del usuario (sistema de feedback)
- Consultas más frecuentes y patrones de uso
- Precisión de las respuestas (basado en feedback)
- Costo mensual de OpenAI y proyecciones

---

## 10. Recomendaciones de Seguridad Actualizadas

- **IA y Privacidad**: No almacenar información personal en embeddings, anonimizar conversaciones
- **Validación de Respuestas**: Filtros para evitar respuestas inapropiadas del chatbot
- **Rate Limiting**: Límites en consultas al chatbot para prevenir abuso
- **Activar y auditar Row Level Security (RLS)** en todas las tablas sensibles
- **Validar y sanitizar datos** tanto en frontend como backend
- **Forzar HTTPS** en todos los entornos
- **Uso de variables de entorno seguras** (.env) y rotación periódica de claves OpenAI
- **Limitar permisos de Storage** y funciones RPC según rol
- **Auditoría activa** de accesos y cambios críticos

---

## 11. Monitoreo y Observabilidad Actualizado

- **Logs de aplicación y base de datos** incluyendo métricas de IA
- **Alertas de errores críticos** y caídas (Sentry, Grafana, Prometheus)
- **Monitoreo de consumo** OpenAI y proyecciones de costo
- **Dashboards de métricas clave** accesibles solo para admin:
  - Uso del chatbot y satisfacción
  - Performance del dashboard administrativo
  - Estadísticas de gestión CRUD
  - Métricas de autenticación y seguridad

---

## 12. CI/CD y Entornos Actualizado

- **Automatizar despliegues** con Coolify (build, test, deploy)
- **Pipeline de IA**: Regeneración automática de embeddings en despliegues
- **Múltiples entornos**: desarrollo, pruebas y producción
- **Rollback sencillo** y versionado de migraciones
- **Backups automáticos** incluyendo datos vectoriales
- **Testing de IA**: Pruebas automatizadas de respuestas del chatbot

---

## 13. Developer Experience (DX) Actualizado

- **Monorepo** con scripts de setup y migración
- **Documentación clara** y actualizada en /docs
- **Entorno local reproducible** (docker-compose opcional)
- **Linter, formateo y tests** automatizados en pipeline
- **Scripts de IA**: Generación y actualización de embeddings
- **Uso de convenciones** de ramas y PRs para control de calidad
- **Herramientas de desarrollo**:
  - TypeScript para tipado estático
  - Tailwind CSS para estilos consistentes
  - Jest + React Testing Library para testing
  - Playwright para pruebas E2E

---

## 14. Estimación de Recursos y Costos

### Costos Mensuales Estimados:

- **Supabase**: $25-50 USD (según uso de BD y storage)
- **OpenAI**: $20-50 USD (10,000 consultas mensuales)
- **Coolify/Hosting**: $20-40 USD (según infraestructura)
- **Total estimado**: $65-140 USD mensual

### Recursos de Desarrollo:

- **Frontend Developer**: Especializado en Next.js y React
- **Backend Developer**: Conocimiento de Supabase y PostgreSQL
- **AI Integration Specialist**: Experiencia con OpenAI y embeddings
- **UI/UX Designer**: Para dashboard administrativo y experiencia de usuario

---

## 15. Roadmap de Implementación

### Fase 1 (MVP - 4-6 semanas):

1. **Semana 1-2**: Setup base, autenticación, dashboard básico
2. **Semana 3-4**: CRUD completo, integración de IA básica
3. **Semana 5-6**: Testing, optimización, despliegue

### Fase 2 (Post-MVP - 6-8 semanas):

1. **Autoservicio inteligente** para ciudadanos
2. **Formularios dinámicos** y carga de documentos
3. **Sistema de notificaciones** y seguimiento
4. **Optimizaciones avanzadas** de IA y performance

---

**Esta arquitectura proporciona una base sólida, escalable y moderna para el Portal Ciudadano de Chía, integrando las mejores prácticas de desarrollo web, IA responsable y experiencia de usuario.**
