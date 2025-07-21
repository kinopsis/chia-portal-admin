# Portal de Atención Ciudadana de Chía - Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Transformar la atención ciudadana con IA como pilar central.
- Automatizar y personalizar la experiencia del ciudadano mediante un chatbot inteligente integrado.
- Facilitar la gestión administrativa eficiente a través de un dashboard moderno y funcional.
- Garantizar accesibilidad, transparencia y mejora continua.
- Integrar un asistente de IA que reduzca el TMO de consultas ciudadanas en un 70% en el primer año.
- Implementar un sistema de gestión CRUD completo para funcionarios y administradores.

### Background Context

Este proyecto busca revolucionar la atención ciudadana mediante la integración de inteligencia artificial en todos los puntos de contacto. El enfoque AI-first permitirá una atención más eficiente, personalizada y escalable, alineada con las mejores prácticas internacionales y considerando riesgos éticos, técnicos y de gestión del cambio. El MVP contará con un dashboard administrativo completo y un chatbot IA integrado con datos estructurados de trámites, OPAs y FAQs.

### Change Log

| Date       | Version | Description                                                      | Author       |
| :--------- | :------ | :--------------------------------------------------------------- | :----------- |
| 2025-07-16 | 0.1     | PRD inicial para MVP                                             | John (PM)    |
| 2025-01-XX | 0.2     | Especificación técnica del Chatbot IA y Dashboard Administrativo | AI Assistant |

## Requirements

### Functional

- **FR1**: El sistema debe permitir a los ciudadanos consultar y realizar trámites municipales por dependencia y subdependencia.
- **FR2**: El sistema debe integrar un asistente de IA (chatbot) basado en OpenAI GPT-4o-mini con búsqueda vectorial conectado a los datos de Supabase para responder consultas sobre trámites, OPAs y FAQs.
- **FR3**: El sistema debe implementar un dashboard administrativo completo (`/admin`) con gestión CRUD para funcionarios y administradores.
- **FR4**: Los funcionarios autenticados deben poder crear, editar y eliminar trámites, OPAs, FAQs, dependencias y subdependencias desde el dashboard administrativo.
- **FR5**: Los administradores deben tener acceso adicional a gestión de usuarios, estadísticas del sistema y logs de auditoría.
- **FR6**: El sistema debe ofrecer un centro de ayuda inteligente con FAQs contextuales.
- **FR7**: El sistema debe generar menús y rutas de navegación dinámicas a partir de la base de datos en Supabase.
- **FR8**: El sistema debe contar con autenticación de usuarios con roles granulares (ciudadano, funcionario, admin) y permisos por dependencia.
- **FR9**: El chatbot debe utilizar embeddings vectoriales para búsqueda semántica y mantener historial de conversaciones.
- **FR10**: El dashboard debe incluir métricas en tiempo real, filtros avanzados, búsqueda y paginación.

### Non Functional

- **NFR1**: La plataforma debe ser accesible (cumplimiento WCAG mínimo AA).
- **NFR2**: El MVP debe estar desplegado en un entorno seguro y escalable usando Coolify.
- **NFR3**: El sistema debe responder a consultas en menos de 2 segundos para el 95% de los casos.
- **NFR4**: El chatbot debe responder en menos de 3 segundos para el 90% de las consultas.
- **NFR5**: El dashboard administrativo debe ser completamente responsive (desktop, tablet, móvil).
- **NFR6**: El sistema debe soportar hasta 10,000 consultas mensuales al chatbot con un costo estimado de $20-50 USD.
- **NFR7**: Todas las operaciones CRUD deben incluir auditoría y trazabilidad completa.

## Especificación Técnica del Chatbot IA

### Arquitectura del Chatbot

- **Proveedor**: OpenAI
- **Modelo Principal**: GPT-4o-mini (costo-eficiencia optimizada)
- **Embeddings**: text-embedding-3-small (1536 dimensiones)
- **Vector Store**: Supabase Vector (pgvector)
- **Búsqueda**: Híbrida (semántica + texto completo)
- **SDK**: Vercel AI SDK v3.0.0

### Tablas Requeridas para IA

```sql
-- Tabla de conocimiento vectorial
CREATE TABLE chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_type VARCHAR(20) NOT NULL, -- 'tramite', 'opa', 'faq'
  source_id UUID NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de conversaciones
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context_used JSONB,
  feedback INTEGER, -- 1: útil, -1: no útil, 0: sin feedback
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Funcionalidades del Chatbot

- Respuestas contextuales basadas en datos reales de trámites, OPAs y FAQs
- Búsqueda semántica con tolerancia a errores de escritura
- Historial de conversaciones por sesión
- Sistema de feedback para mejora continua
- Actualización automática del conocimiento cuando se modifican datos
- Integración en tiempo real con la base de datos de Supabase

### Estimación de Costos IA

- **Embeddings**: ~$0.02 por 1000 documentos
- **Chat**: ~$0.15 por 1000 mensajes (GPT-4o-mini)
- **Costo mensual estimado**: $20-50 USD para 10,000 consultas

## Dashboard Administrativo

### Funcionalidades por Rol

#### Para Funcionarios:

- Panel de gestión CRUD para trámites, OPAs y FAQs
- Vista de dependencias y subdependencias asignadas
- Métricas básicas de los elementos que gestiona
- Interfaz intuitiva con filtros, búsqueda y paginación
- Formularios de creación/edición con validación

#### Para Administradores (funcionalidades adicionales):

- Gestión completa de usuarios del sistema
- Dashboard de estadísticas y métricas del sistema
- Acceso a logs de auditoría y trazabilidad
- Configuración de permisos y roles
- Vista general de todas las dependencias

### Características Técnicas del Dashboard:

- **Ruta**: `/admin` (protegida por autenticación)
- **Diseño**: Responsive siguiendo colores institucionales (#FFDC00, #009045)
- **Arquitectura**: Atomic Design con componentes reutilizables
- **Navegación**: Diferenciada según el rol del usuario autenticado
- **Componentes**: DataTable, SearchAndFilters, ConfirmDialog, DashboardStats

## User Interface Design Goals

### Overall UX Vision

- Interfaz intuitiva, moderna y responsiva, accesible desde cualquier dispositivo.
- Experiencia guiada por el asistente de IA para consultas y navegación.
- Dashboard administrativo profesional con diseño institucional.

### Key Interaction Paradigms

- Navegación jerárquica por dependencias y subdependencias.
- Búsqueda y filtrado de trámites y OPAs.
- Chatbot visible en todo momento para asistir al usuario.
- Panel administrativo con operaciones CRUD intuitivas.

### Core Screens and Views

- Pantalla de inicio con acceso rápido a servicios y menú de dependencias.
- Vista de trámites por dependencia/subdependencia.
- Dashboard administrativo con estadísticas y gestión.
- Centro de ayuda/FAQs.
- Interfaz de chat con el asistente de IA integrado.

### Accessibility: WCAG AA

### Branding

- Colores institucionales: Amarillo #FFDC00, Verde #009045
- Tipografía: Inter (Google Fonts)

### Target Device and Platforms

- Web responsive (desktop, tablet y móvil).

## Technical Assumptions

- **Frontend:** Next.js 15 (React 18) con TypeScript
- **Backend y base de datos:** Supabase (PostgreSQL + Auth + Storage + Vector)
- **IA:** OpenAI GPT-4o-mini + text-embedding-3-small
- **Estilos:** Tailwind CSS 3.4
- **Despliegue:** Coolify
- **Repositorio:** Monorepo
- **Arquitectura:** Monolítica para el MVP
- **Testing:** Jest + React Testing Library + Playwright
- **Patrones:** Atomic Design, Row Level Security (RLS)

## Epic List

1. **Fundación & Core**: Setup, autenticación y gestión básica de usuarios
2. **Dashboard Administrativo**: Panel completo con CRUD para funcionarios y administradores
3. **Gestión de Dependencias y Trámites**: CRUD completo con validaciones
4. **Integración del Asistente de IA**: Chatbot con OpenAI y búsqueda vectorial
5. **Centro de Ayuda y FAQs**: Gestión y consulta inteligente
6. **Auditoría y Trazabilidad**: Logs completos y sistema de permisos
7. **Despliegue y Accesibilidad**: Producción y cumplimiento WCAG AA

## Historias de Usuario para Backend/Admin

### Epic: Dashboard Administrativo y Gestión CRUD

#### Roles del sistema

- **Ciudadano:** Accede a la consulta de trámites, OPAs y FAQs, y utiliza el chatbot IA.
- **Funcionario:** Gestiona trámites, OPAs, FAQs, dependencias y subdependencias desde el dashboard administrativo.
- **Admin:** Gestiona usuarios, accede a estadísticas del sistema, logs de auditoría y todas las funciones de funcionario.

#### Historia 1: Dashboard principal con métricas

**Como** funcionario o administrador autenticado,  
**quiero** ver un dashboard con métricas y estadísticas relevantes,  
**para** tener una visión general del estado del sistema y mis responsabilidades.

**Criterios de aceptación:**

- El dashboard muestra métricas en tiempo real (trámites, OPAs, FAQs gestionados)
- Las estadísticas se filtran según el rol y permisos del usuario
- Incluye accesos rápidos a las funcionalidades principales
- Es completamente responsive y accesible

#### Historia 2: Gestión CRUD de trámites con interfaz moderna

**Como** funcionario autenticado,  
**quiero** gestionar trámites a través de una interfaz moderna con filtros y búsqueda,  
**para** mantener actualizada la información de manera eficiente.

**Criterios de aceptación:**

- Lista paginada con filtros avanzados (subdependencia, estado, tipo de pago)
- Búsqueda en tiempo real por nombre, código o descripción
- Formularios de creación/edición con validación completa
- Confirmación para operaciones de eliminación
- Auditoría automática de todos los cambios

#### Historia 3: Integración del Chatbot IA

**Como** ciudadano,  
**quiero** interactuar con un chatbot inteligente que responda mis consultas sobre trámites,  
**para** obtener información precisa sin necesidad de contactar funcionarios.

**Criterios de aceptación:**

- El chatbot responde basándose en datos reales de la base de datos
- Utiliza búsqueda semántica para entender consultas con errores de escritura
- Mantiene contexto de la conversación durante la sesión
- Proporciona fuentes y referencias de la información brindada
- Permite feedback para mejorar las respuestas

#### Historia 4: Gestión de usuarios (solo admin)

**Como** administrador,  
**quiero** gestionar usuarios del sistema con roles y permisos granulares,  
**para** asegurar la correcta administración de accesos.

**Criterios de aceptación:**

- CRUD completo de usuarios con interfaz intuitiva
- Asignación de roles (ciudadano, funcionario, admin)
- Configuración de permisos por dependencia
- Activación/desactivación de cuentas
- Auditoría completa de cambios en usuarios

## Funcionalidades Excluidas del MVP

### Autoservicio Inteligente (Fase 2 - Post-MVP)

Las siguientes funcionalidades quedan documentadas para implementación futura:

- Inicio de trámites online por parte de ciudadanos
- Formularios dinámicos y carga de documentos
- Seguimiento de solicitudes con notificaciones
- Sistema de citas y turnos
- Integración con sistemas de pago

## Next Steps

- Implementar la base de datos con las tablas del chatbot
- Desarrollar el dashboard administrativo con componentes reutilizables
- Integrar OpenAI con Supabase Vector para el chatbot
- Configurar el sistema de roles y permisos granulares
- Implementar auditoría completa y trazabilidad

## Design Architect Prompt

Utilizar este PRD actualizado como base para implementar el dashboard administrativo y la integración del chatbot IA, siguiendo los patrones de Atomic Design y las especificaciones técnicas definidas.
