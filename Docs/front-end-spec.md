# Portal de Atención Ciudadana de Chía – Documentación Técnica Frontend

## 📋 Introducción

Esta documentación técnica proporciona una guía completa del sistema frontend del Portal de Atención Ciudadana de Chía, incluyendo arquitectura, componentes, funcionalidades y guías de replicación. El sistema está construido con tecnologías modernas y sigue las mejores prácticas de desarrollo frontend.

**Versión del Sistema**: 1.0.0
**Última Actualización**: Enero 2025
**Stack Principal**: Next.js 15 + React 18 + TypeScript + Tailwind CSS + Supabase

---

## 🏗️ 1. Arquitectura General del Frontend

### 1.1 Stack Tecnológico

#### **Framework y Librerías Principales**

- **Next.js 15**: Framework React con App Router para SSR/SSG
- **React 18**: Librería de UI con hooks y componentes funcionales
- **TypeScript 5.3**: Tipado estático para mayor robustez
- **Tailwind CSS 3.4**: Framework de utilidades CSS para diseño responsive
- **Supabase**: Backend-as-a-Service (PostgreSQL + Auth + Storage + Realtime)

#### **Herramientas de Desarrollo**

- **ESLint + Prettier**: Linting y formateo de código
- **Jest + React Testing Library**: Testing unitario y de integración
- **Playwright**: Testing end-to-end
- **TypeScript**: Compilación y verificación de tipos

#### **Dependencias Clave**

```json
{
  "@supabase/supabase-js": "^2.52.0",
  "@supabase/ssr": "^0.1.0",
  "@heroicons/react": "^2.2.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

### 1.2 Estructura de Carpetas

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

### 1.3 Patrones de Diseño Implementados

#### **Atomic Design**

- **Atoms**: Componentes básicos (Button, Input, Card, Badge)
- **Molecules**: Combinaciones simples (SearchBar, Breadcrumb)
- **Organisms**: Componentes complejos (Header, Footer, TramitesList)

#### **Gestión de Estado**

- **React Context API**: Para estado global (AuthContext)
- **Custom Hooks**: Para lógica reutilizable
- **Local State**: useState para estado de componentes

#### **Patrones de Composición**

- **Compound Components**: Para componentes complejos
- **Render Props**: Para lógica compartida
- **Higher-Order Components**: Para funcionalidades transversales

---

## 🎨 2. Sistema de Diseño y Estilos

### 2.1 Identidad Visual Institucional

#### **Colores Primarios**

```css
:root {
  --color-primary-yellow: #ffdc00; /* Amarillo institucional */
  --color-primary-yellow-alt: #f8e000; /* Amarillo alternativo */
  --color-primary-green: #009045; /* Verde institucional */
  --color-primary-green-alt: #009540; /* Verde alternativo */
}
```

#### **Configuración Tailwind CSS**

```typescript
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#FFDC00',
          'yellow-alt': '#F8E000',
          green: '#009045',
          'green-alt': '#009540',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
}
```

### 2.2 Tipografía

- **Fuente Principal**: Inter (Google Fonts)
- **Fallbacks**: Arial, sans-serif
- **Escalas**: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl

### 2.3 Espaciado y Layout

- **Sistema de Grid**: CSS Grid y Flexbox
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Contenedor**: max-width con padding responsive
- **Espaciado**: Escala de 4px (1, 2, 3, 4, 6, 8, 12, 16, 24, 32)

---

## � 2.5. Wireframes y Diagramas Visuales

### 2.5.1 Layout Principal y Estructura Base

#### **Wireframe del Layout Principal**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   HEADER                                        │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ ┌─────────────────┐ │
│ │ [🏛️] Portal     │ │ [Inicio] [Dependencias] [Trámites y │ │ [👤] [🔍] [⚙️] │ │
│ │ Ciudadano Chía  │ │ Servicios] [FAQ] [PQRS]             │ │ Usuario/Login   │ │
│ └─────────────────┘ └─────────────────────────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              BREADCRUMB                                         │
│ [🏠 Inicio] > [📂 Dependencias] > [🏛️ Secretaría de Planeación]                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            CONTENIDO PRINCIPAL                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                             │ │
│ │                        [CONTENIDO DINÁMICO]                                 │ │
│ │                                                                             │ │
│ │  - Páginas específicas (Home, Dependencias, Trámites, etc.)                │ │
│ │  - Componentes organisms y molecules                                        │ │
│ │  - Estados de carga, error y éxito                                         │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                 FOOTER                                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Enlaces Rápidos │ │ Contacto        │ │ Redes Sociales  │ │ Legal           │ │
│ │ • Trámites      │ │ ☎️ 123-456-789  │ │ 📘 Facebook     │ │ • Privacidad    │ │
│ │ • OPAs          │ │ ✉️ info@chia.gov│ │ 🐦 Twitter      │ │ • Términos      │ │
│ │ • FAQs          │ │ 📍 Dirección    │ │ 📸 Instagram    │ │ • Cookies       │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                        © 2025 Alcaldía de Chía                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
│                          WIDGET FLOTANTE AI                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [💬] ¿Necesitas ayuda? Pregunta al asistente virtual                       │ │
│ │ [Posición: fixed bottom-4 right-4, z-index: 50]                            │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
```

#### **Especificaciones del Header**

```
HEADER DESKTOP (h-16 = 64px)
┌─────────────────────────────────────────────────────────────────────────────────┐
│ LOGO SECTION (w-64)     │ NAVIGATION (flex-1)        │ USER SECTION (w-48)      │
│ ┌─────────────────────┐ │ ┌─────────────────────────┐ │ ┌─────────────────────┐ │
│ │ [🏛️] (40x40px)      │ │ │ [Inicio] [Dependencias] │ │ │ [🔍] [👤] [⚙️]      │ │
│ │ Portal Ciudadano    │ │ │ [Trámites y Servicios]  │ │ │ SearchBtn UserMenu  │ │
│ │ Alcaldía de Chía    │ │ │ [FAQ] [PQRS]            │ │ │ (gap-3)             │ │
│ └─────────────────────┘ │ └─────────────────────────┘ │ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

HEADER MOBILE (h-16 = 64px)
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [☰] LOGO SECTION (flex-1)                              │ [🔍] [👤] (w-20)      │
│ ┌─────────────────────────────────────────────────────┐ │ ┌─────────────────┐ │
│ │ [🏛️] Portal Ciudadano - Alcaldía de Chía           │ │ │ [🔍] [👤]       │ │
│ │ (text-sm, truncate)                                 │ │ │ (gap-2)         │ │
│ └─────────────────────────────────────────────────────┘ │ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
│                        MOBILE MENU (cuando está abierto)                       │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Inicio] [Dependencias] [Trámites y Servicios] [FAQ] [PQRS]                 │ │
│ │ (vertical stack, py-2, border-t)                                            │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
```

#### **Responsive Breakpoints Detallados**

```
MOBILE (320px - 767px)
┌─────────────────────────────────┐
│ Header: Stack vertical, menú    │
│ hamburguesa, logo compacto      │
│ ┌─────────────────────────────┐ │
│ │ Contenido: Single column,   │ │
│ │ padding reducido, botones   │ │
│ │ más grandes (min 44px)      │ │
│ └─────────────────────────────┘ │
│ Footer: Stack vertical,         │
│ información esencial            │
└─────────────────────────────────┘

TABLET (768px - 1023px)
┌─────────────────────────────────────────────┐
│ Header: Navegación horizontal,              │
│ algunos elementos colapsados                │
│ ┌─────────────────────────────────────────┐ │
│ │ Contenido: 2 columnas, grid             │ │
│ │ adaptativo, espaciado medio             │ │
│ └─────────────────────────────────────────┘ │
│ Footer: 2-3 columnas, información          │
│ completa                                    │
└─────────────────────────────────────────────┘

DESKTOP (1024px+)
┌─────────────────────────────────────────────────────────────────┐
│ Header: Navegación completa, todos los elementos visibles      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Contenido: Multi-columna, grid completo, espaciado         │ │
│ │ generoso, hover states, tooltips                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Footer: 4 columnas, información completa, enlaces adicionales  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5.2 Wireframes de Páginas Específicas

#### **Página Principal (Home) - Wireframe Detallado**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   HEADER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              HERO SECTION                                       │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                    Portal de Atención Ciudadana                             │ │
│ │                        Alcaldía de Chía                                     │ │
│ │                                                                             │ │
│ │  "Servicios municipales al alcance de todos. El asistente virtual          │ │
│ │   te guía paso a paso en tus trámites y consultas."                        │ │
│ │                                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ [🔍] Buscar trámite, OPA, ayuda...                    [Buscar]          │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ Búsquedas populares: [Certificados] [Licencias] [Pagos] [Permisos]         │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            MÉTRICAS DEL SISTEMA                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ 🏛️ 12       │ │ 📂 45       │ │ 📄 156      │ │ ⚡ 89       │ │ ❓ 234      │ │
│ │ Dependencias│ │ Subdepend.  │ │ Trámites    │ │ OPAs        │ │ FAQs        │ │
│ │ activas     │ │ organizac.  │ │ disponibles │ │ gestionadas │ │ publicadas  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           SERVICIOS MÁS UTILIZADOS                              │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 📋 Certificados │ │ 💰 Pagos        │ │ 🏗️ Permisos     │ │ 📞 Consultas    │ │
│ │ Solicitar       │ │ Impuestos y     │ │ Construcción    │ │ Estado de       │ │
│ │ certificados    │ │ tasas           │ │ y obras         │ │ trámites        │ │
│ │ [Ver más →]     │ │ [Ver más →]     │ │ [Ver más →]     │ │ [Ver más →]     │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 🤖 Asistente AI │ │ 📋 Nueva OPA    │ │ 📚 Centro Ayuda │ │ 🔍 Ver Todos    │ │
│ │ Pregunta al     │ │ Crear nueva     │ │ Preguntas       │ │ los servicios   │ │
│ │ asistente       │ │ OPA             │ │ frecuentes      │ │ disponibles     │ │
│ │ [Preguntar →]   │ │ [Crear →]       │ │ [Explorar →]    │ │ [Explorar →]    │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                        ACCESOS RÁPIDOS POR DEPENDENCIA                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 🏛️ Planeación   │ │ 💼 Hacienda     │ │ 🏥 Salud        │ │ 🌱 Ambiente     │ │
│ │ 3 subdep.       │ │ 4 subdep.       │ │ 2 subdep.       │ │ 2 subdep.       │ │
│ │ 15 trámites     │ │ 23 trámites     │ │ 8 trámites      │ │ 12 trámites     │ │
│ │ [Explorar →]    │ │ [Explorar →]    │ │ [Explorar →]    │ │ [Explorar →]    │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                              [Ver todas las dependencias →]                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           PREGUNTAS FRECUENTES                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ ▼ ¿Cómo puedo solicitar un certificado de residencia?                      │ │
│ │   Para solicitar un certificado de residencia, debes...                    │ │
│ │   [Ver trámite completo →]                                                  │ │
│ │                                                                             │ │
│ │ ▶ ¿Qué documentos necesito para una licencia de construcción?              │ │
│ │ ▶ ¿Cómo puedo pagar mis impuestos en línea?                                │ │
│ │ ▶ ¿Dónde puedo consultar el estado de mi trámite?                          │ │
│ │                                                                             │ │
│ │                              [Ver todas las FAQs →]                        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                 FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Página de Dependencias - Wireframe de Cinta Horizontal**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   HEADER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] > [📂 Dependencias]                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            TÍTULO Y MÉTRICAS                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                        Dependencias Municipales                             │ │
│ │              Explora las áreas y servicios de la alcaldía                   │ │
│ │                                                                             │ │
│ │ 🏛️ 12 Dependencias  📂 45 Subdependencias  📄 156 Trámites  ⚡ 89 OPAs     │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              BARRA DE BÚSQUEDA                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [🔍] Buscar dependencia, subdependencia, trámite...        [Buscar]        │ │
│ │                                                                             │ │
│ │ Sugerencias: [Planeación] [Hacienda] [Salud] [Ambiente] [Obras]            │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                        LISTA DE DEPENDENCIAS (CINTA)                            │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ NIVEL 1: DEPENDENCIA (Estado Colapsado - 80px altura)                      │ │
│ │ ┌─────┐ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🏛️  │ │ [SEPLAN] Secretaría de Planeación │ 📂3 │ 📄15 │ ⚡8 │ [⌄]   │ │ │
│ │ └─────┘ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ NIVEL 2: SUBDEPENDENCIAS (Estado Expandido - max 250px con scroll)         │ │
│ │ ┌─────┐ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🏛️  │ │ [SEPLAN] Secretaría de Planeación │ 📂3 │ 📄15 │ ⚡8 │ [⌃]   │ │ │
│ │ └─────┘ └─────────────────────────────────────────────────────────────────┘ │ │
│ │         ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │         │ 📂 [SUB-001] Planeación Urbana        │ 📄8  │ ⚡3  │ [⌄]    │ │ │
│ │         │ 📂 [SUB-002] Desarrollo Territorial   │ 📄5  │ ⚡3  │ [⌄]    │ │ │
│ │         │ 📂 [SUB-003] Licencias y Permisos     │ 📄2  │ ⚡2  │ [⌄]    │ │ │
│ │         └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ NIVEL 3: TRÁMITES Y OPAS (Estado Expandido - max 200px con scroll)         │ │
│ │ ┌─────┐ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🏛️  │ │ [SEPLAN] Secretaría de Planeación │ 📂3 │ 📄15 │ ⚡8 │ [⌃]   │ │ │
│ │ └─────┘ └─────────────────────────────────────────────────────────────────┘ │ │
│ │         ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │         │ 📂 [SUB-001] Planeación Urbana        │ 📄8  │ ⚡3  │ [⌃]    │ │ │
│ │         │   TRÁMITES:                                                     │ │ │
│ │         │   📄 [TRAM-001] Licencia de Construcción      [Ver detalles →] │ │ │
│ │         │   📄 [TRAM-002] Certificado de Uso del Suelo  [Ver detalles →] │ │ │
│ │         │   📄 [TRAM-003] Permiso de Demolición         [Ver detalles →] │ │ │
│ │         │   OPAS:                                                         │ │ │
│ │         │   ⚡ [OPA-001] Autorización de Pago           [Ver detalles →] │ │ │
│ │         │   ⚡ [OPA-002] Orden de Servicio              [Ver detalles →] │ │ │
│ │         └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ [Más dependencias con el mismo patrón...]                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                 FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Página de Trámites y Servicios - Wireframe ACTUALIZADO con Filtros Mejorados**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   HEADER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] > [📄 Trámites y Servicios]                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            TÍTULO Y ESTADÍSTICAS REALES                         │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                           Trámites y Servicios                              │ │
│ │                  Encuentra y gestiona servicios municipales                 │ │
│ │                                                                             │ │
│ │ 📄 108 Trámites  ⚡ 722 OPAs  ❓ 330 FAQs  🏛️ 14 Dependencias              │ │
│ │ (Estadísticas en tiempo real desde base de datos)                          │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                    BÚSQUEDA Y FILTROS MEJORADOS (DOS FILAS)                     │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILA 1: BÚSQUEDA PRINCIPAL                                                  │ │
│ │ [🔍] Buscar por nombre, código, descripción...         [Buscar]            │ │
│ │                                                                             │ │
│ │ FILA 2: FILTROS AVANZADOS (Responsive - 2 filas en móvil)                  │ │
│ │ [📂 Dependencia ⌄] [� Subdependencia ⌄] [📊 Tipo ⌄] [�💰 Tipo Pago ⌄]     │ │
│ │ • Dependencia: Dinámico desde BD (14 opciones)                             │ │
│ │ • Subdependencia: Poblado según dependencia seleccionada                   │ │
│ │ • Tipo: Todos/Solo Trámites/Solo OPAs/Solo FAQs                            │ │
│ │ • Tipo Pago: Todos/Gratuito/Con pago (reemplaza Estado)                    │ │
│ │                                                                             │ │
│ │ Mostrando 24 de 1,160 resultados totales                                   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                    RESULTADOS UNIFICADOS CON DISEÑO MEJORADO                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Se encontraron 15 resultados para "licencia construcción"                  │ │
│ │                                                                             │ │
│ │ 📄 TRÁMITES (8 resultados) - DISEÑO MEJORADO CON REQUISITOS                │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 📄 [080-082-001] Concepto sanitario                                     │ │ │
│ │ │ 🏛️ Secretaría de Salud > Salud Pública                                  │ │ │
│ │ │ Concepto técnico sanitario para establecimientos                       │ │ │
│ │ │                                                                         │ │ │
│ │ │ 📋 REQUISITOS:                                                          │ │ │
│ │ │ • Cédula de ciudadanía original y copia                                │ │ │
│ │ │ • Formulario de solicitud debidamente diligenciado                     │ │ │
│ │ │ • Comprobante de pago de derechos (si aplica)                          │ │ │
│ │ │                                                                         │ │ │
│ │ │ 💰 Gratuito | ⏱️ 15 días                                                │ │ │
│ │ │                                                                         │ │ │
│ │ │ 🏛️ [SUIT] 🌐 [GOV.CO] [Ver detalles →]                                 │ │ │
│ │ │ (Azul #1e40af) (Verde #059669)                                         │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 📄 [080-082-002] Esterilización canina y felina                        │ │ │
│ │ │ 🏛️ Secretaría de Salud > Salud Pública                                  │ │ │
│ │ │ Servicio de esterilización para mascotas                               │ │ │
│ │ │                                                                         │ │ │
│ │ │ 📋 REQUISITOS:                                                          │ │ │
│ │ │ • Documento de identidad vigente                                       │ │ │
│ │ │ • Certificado de antecedentes disciplinarios                          │ │ │
│ │ │ • Formulario único de solicitud                                        │ │ │
│ │ │ • Comprobante de pago de tasas municipales                             │ │ │
│ │ │ • Fotografías recientes tamaño cédula                                  │ │ │
│ │ │                                                                         │ │ │
│ │ │ 💰 Con pago | ⏱️ 8 días                                                 │ │ │
│ │ │                                                                         │ │ │
│ │ │ 🏛️ [SUIT] 🌐 [GOV.CO] [Ver detalles →]                                 │ │ │
│ │ │ (target="_blank" rel="noopener noreferrer")                            │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ ⚡ OPAS (4 resultados)                                                      │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ⚡ [OPA-001] Autorización de Pago - Licencia Construcción              │ │ │
│ │ │ 🏛️ Secretaría de Planeación > Planeación Urbana                        │ │ │
│ │ │ Autorización de pago para licencias de construcción                    │ │ │
│ │ │ 💰 $35.000 | ⏱️ 3 días | [Ver detalles →]                              │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ ❓ FAQS (3 resultados)                                                      │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ❓ ¿Qué documentos necesito para una licencia de construcción?          │ │ │
│ │ │ 🏷️ Construcción, Licencias, Documentos                                  │ │ │
│ │ │ Para solicitar una licencia de construcción necesitas...                │ │ │
│ │ │ [Ver respuesta completa →]                                              │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              PAGINACIÓN                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [◀ Anterior] [1] [2] [3] [Siguiente ▶]                                     │ │
│ │                        Página 1 de 3                                        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                 FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **ESPECIFICACIONES TÉCNICAS DETALLADAS - PÁGINA TRÁMITES MEJORADA**

##### **Implementación de Filtros Avanzados**

```
FILTROS RESPONSIVOS - ESPECIFICACIONES TÉCNICAS
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DESKTOP (1024px+)                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILA 1: [🔍 Búsqueda principal - w-full max-w-2xl]                          │ │
│ │ FILA 2: [Dependencia] [Subdependencia] [Tipo] [Tipo Pago] [Limpiar]        │ │
│ │         (grid-cols-5 gap-4)                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           TABLET (768px-1023px)                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILA 1: [🔍 Búsqueda principal - w-full]                                    │ │
│ │ FILA 2: [Dependencia] [Subdependencia] [Tipo]                              │ │
│ │ FILA 3: [Tipo Pago] [Limpiar]                                              │ │
│ │         (grid-cols-3 gap-3 + grid-cols-2 gap-3)                            │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           MOBILE (375px-767px)                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILA 1: [🔍 Búsqueda principal - w-full]                                    │ │
│ │ FILA 2: [Dependencia - w-full]                                             │ │
│ │ FILA 3: [Subdependencia - w-full]                                          │ │
│ │ FILA 4: [Tipo] [Tipo Pago]                                                 │ │
│ │ FILA 5: [Limpiar - w-full]                                                 │ │
│ │         (stack vertical + grid-cols-2 para Tipo/TipoPago)                  │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

LÓGICA DE FILTROS DINÁMICOS
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. DEPENDENCIA SELECCIONADA                                                    │
│    ↓ Trigger: onChange event                                                   │
│    ↓ Action: Fetch subdependencias de esa dependencia                          │
│    ↓ Update: Poblar dropdown de subdependencias                                │
│                                                                                 │
│ 2. FILTROS APLICADOS                                                           │
│    ↓ Trigger: Cualquier cambio en filtros                                      │
│    ↓ Action: Llamada a unifiedSearchService.search()                           │
│    ↓ Update: Actualizar resultados y estadísticas                              │
│                                                                                 │
│ 3. ESTADÍSTICAS EN TIEMPO REAL                                                 │
│    ↓ Source: statisticsService.getPortalStatistics()                           │
│    ↓ Display: 108 Trámites, 722 OPAs, 330 FAQs, 14 Dependencias              │
│    ↓ Update: Cada vez que se cargan los filtros                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

##### **Diseño de Cards con Requisitos y Enlaces Gubernamentales**

```
CARD MEJORADA - ESPECIFICACIONES VISUALES
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRAMITE CARD                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ HEADER SECTION (p-6 border-b)                                              │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 📄 [080-082-001] Concepto sanitario                    [💰 Gratuito]    │ │ │
│ │ │ 🏛️ Secretaría de Salud > Salud Pública                                  │ │ │
│ │ │ Concepto técnico sanitario para establecimientos                       │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ REQUISITOS SECTION (p-6 bg-gray-50) - NUEVA FUNCIONALIDAD                  │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 📋 REQUISITOS:                                                          │ │ │
│ │ │ • Cédula de ciudadanía original y copia                                │ │ │
│ │ │ • Formulario de solicitud debidamente diligenciado                     │ │ │
│ │ │ • Comprobante de pago de derechos (si aplica)                          │ │ │
│ │ │                                                                         │ │ │
│ │ │ Fuente: Campo requisitos (TEXT[]) con índice GIN                       │ │ │
│ │ │ Formato: Lista con bullets (•) y espaciado vertical                    │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ FOOTER SECTION (p-6 border-t)                                              │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ⏱️ 15 días hábiles                                                      │ │ │
│ │ │                                                                         │ │ │
│ │ │ ENLACES GUBERNAMENTALES - NUEVA FUNCIONALIDAD:                         │ │ │
│ │ │ [🏛️ SUIT] [🌐 GOV.CO] [Ver detalles →]                                 │ │ │
│ │ │  Azul      Verde      Gris                                              │ │ │
│ │ │ #1e40af   #059669    #6b7280                                            │ │ │
│ │ │                                                                         │ │ │
│ │ │ Atributos de seguridad: target="_blank" rel="noopener noreferrer"      │ │ │
│ │ │ URLs dinámicas desde BD: visualizacion_suit, visualizacion_gov         │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ DIMENSIONES:                                                                    │
│ • Desktop: w-80 (320px) min-h-64 (256px)                                       │
│ • Tablet: w-full max-w-sm (384px)                                              │
│ • Mobile: w-full                                                               │
│ • Padding: p-6 (24px) en cada sección                                          │
│ • Border radius: rounded-xl (12px)                                             │
│ • Shadow: shadow-lg hover:shadow-xl transition-shadow                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

##### **Integración con Base de Datos Real**

```
DATABASE INTEGRATION - ESPECIFICACIONES TÉCNICAS
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TABLA: tramites                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ CAMPOS NUEVOS AGREGADOS:                                                    │ │
│ │ • requisitos: TEXT[] - Array de strings con requisitos específicos         │ │
│ │ • Índice GIN para búsquedas eficientes: CREATE INDEX idx_tramites_requisitos│ │
│ │                                                                             │ │
│ │ CAMPOS EXISTENTES UTILIZADOS:                                               │ │
│ │ • visualizacion_suit: TEXT - URL del portal SUIT                           │ │
│ │ • visualizacion_gov: TEXT - URL del portal GOV.CO                          │ │
│ │ • tiene_pago: BOOLEAN - Para filtro de tipo de pago                        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                        SERVICIOS IMPLEMENTADOS                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ unifiedSearchService.search():                                              │ │
│ │ • Búsqueda unificada en tramites, opas, faqs                               │ │
│ │ • Filtros: dependencia, subdependencia, tipo, tipoPago                     │ │
│ │ • Paginación: page, limit                                                  │ │
│ │ • Retorna: datos + metadatos de paginación                                 │ │
│ │                                                                             │ │
│ │ statisticsService.getPortalStatistics():                                   │ │
│ │ • Estadísticas en tiempo real desde BD                                     │ │
│ │ • Conteos: tramites, opas, faqs, dependencias                              │ │
│ │ • Cache: Optimizado para performance                                       │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                     DATOS REALES POBLADOS                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ • 108 trámites con requisitos específicos y realistas                      │ │
│ │ • URLs gubernamentales auténticas de SUIT y GOV.CO                         │ │
│ │ • Ejemplos reales:                                                          │ │
│ │   - SUIT: https://visorsuit.funcionpublica.gov.co/auth/visor?fi=76498      │ │
│ │   - GOV.CO: https://www.gov.co/ficha-tramites-y-servicios/T76498           │ │
│ │ • Requisitos específicos por tipo de trámite                               │ │
│ │ • Integración completa con sistema de dependencias                         │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

##### **Implementación Técnica y Compatibilidad**

```
TECHNICAL IMPLEMENTATION - NEXT.JS 15 COMPATIBILITY
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SUSPENSE BOUNDARY IMPLEMENTATION                        │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ // PROBLEMA RESUELTO: useSearchParams() requiere Suspense en Next.js 13+   │ │
│ │                                                                             │ │
│ │ function TramitesContent() {                                                │ │
│ │   const searchParams = useSearchParams()                                   │ │
│ │   // ... lógica del componente                                             │ │
│ │ }                                                                           │ │
│ │                                                                             │ │
│ │ export default function TramitesPage() {                                   │ │
│ │   return (                                                                 │ │
│ │     <Suspense fallback={<TramitesLoading />}>                              │ │
│ │       <TramitesContent />                                                  │ │
│ │     </Suspense>                                                            │ │
│ │   )                                                                        │ │
│ │ }                                                                           │ │
│ │                                                                             │ │
│ │ // CONFIGURACIÓN ADICIONAL:                                                │ │
│ │ export const dynamic = 'force-dynamic' // Evita static generation          │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         BUILD-TIME DATA FETCHING GUARDS                        │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ // En servicios (unifiedSearch.ts, statistics.ts):                         │ │
│ │                                                                             │ │
│ │ if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {│ │
│ │   return {                                                                  │ │
│ │     success: true,                                                          │ │
│ │     data: [],                                                               │ │
│ │     pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }            │ │
│ │   }                                                                         │ │
│ │ }                                                                           │ │
│ │                                                                             │ │
│ │ // PROPÓSITO: Evitar llamadas a BD durante Docker build                    │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           NEXT.JS 15 CONFIGURATION                             │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ // next.config.js - Actualizado para Next.js 15:                           │ │
│ │                                                                             │ │
│ │ const nextConfig = {                                                        │ │
│ │   output: 'standalone',                                                     │ │
│ │   serverExternalPackages: ['@supabase/supabase-js'], // Movido de experimental│ │
│ │   typescript: { ignoreBuildErrors: true },                                 │ │
│ │   eslint: { ignoreDuringBuilds: true },                                    │ │
│ │   env: {                                                                    │ │
│ │     NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,        │ │
│ │     NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY│ │
│ │   }                                                                         │ │
│ │ }                                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

##### **Responsive Design Specifications**

```
RESPONSIVE BREAKPOINTS - DETAILED SPECIFICATIONS
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MOBILE (375px - 767px)                               │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILTROS:                                                                    │ │
│ │ • Stack vertical completo                                                   │ │
│ │ • Búsqueda: w-full mb-4                                                     │ │
│ │ • Dependencia: w-full mb-3                                                  │ │
│ │ • Subdependencia: w-full mb-3                                               │ │
│ │ • Tipo y TipoPago: grid-cols-2 gap-2 mb-3                                  │ │
│ │ • Limpiar: w-full                                                           │ │
│ │                                                                             │ │
│ │ CARDS:                                                                      │ │
│ │ • w-full (100% ancho)                                                       │ │
│ │ • p-4 (padding reducido)                                                    │ │
│ │ • Requisitos: text-sm (texto más pequeño)                                  │ │
│ │ • Enlaces: stack vertical, botones w-full                                  │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           TABLET (768px - 1023px)                              │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILTROS:                                                                    │ │
│ │ • Búsqueda: w-full mb-4                                                     │ │
│ │ • Fila 1: Dependencia, Subdependencia, Tipo (grid-cols-3)                  │ │
│ │ • Fila 2: TipoPago, Limpiar (grid-cols-2)                                  │ │
│ │                                                                             │ │
│ │ CARDS:                                                                      │ │
│ │ • grid-cols-2 gap-4 (2 columnas)                                           │ │
│ │ • max-w-sm (384px máximo por card)                                          │ │
│ │ • p-5 (padding medio)                                                       │ │
│ │ • Enlaces: horizontal con gap-2                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           DESKTOP (1024px+)                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILTROS:                                                                    │ │
│ │ • Búsqueda: max-w-2xl (672px máximo)                                        │ │
│ │ • Filtros: grid-cols-5 gap-4 (una sola fila)                               │ │
│ │ • Hover effects en todos los elementos                                     │ │
│ │                                                                             │ │
│ │ CARDS:                                                                      │ │
│ │ • grid-cols-3 gap-6 (3 columnas)                                           │ │
│ │ • w-80 (320px fijo por card)                                                │ │
│ │ • p-6 (padding completo)                                                    │ │
│ │ • Hover: shadow-xl transform scale-105                                      │ │
│ │ • Enlaces: horizontal con iconos y texto                                    │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

##### **Performance y Optimización**

```
PERFORMANCE OPTIMIZATIONS
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE OPTIMIZATIONS                               │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ • Índice GIN en campo requisitos para búsquedas rápidas                    │ │
│ │ • Paginación eficiente con LIMIT/OFFSET                                    │ │
│ │ • Cache de estadísticas con invalidación inteligente                       │ │
│ │ • Consultas optimizadas con JOIN selectivos                                │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           FRONTEND OPTIMIZATIONS                               │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ • Debounce en búsqueda (500ms delay)                                       │ │
│ │ • Lazy loading de componentes pesados                                      │ │
│ │ • Memoización de resultados de filtros                                     │ │
│ │ • Skeleton loading states                                                  │ │
│ │ • Optimistic updates en filtros                                            │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           DEPLOYMENT OPTIMIZATIONS                             │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ • Docker multi-stage build                                                 │ │
│ │ • Static assets optimization                                               │ │
│ │ • Environment variable fallbacks                                           │ │
│ │ • Build-time error handling                                                │ │
│ │ • Production-ready error boundaries                                        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Centro de Ayuda (FAQs) - Wireframe**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   HEADER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] > [❓ Centro de Ayuda]                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            TÍTULO Y ESTADÍSTICAS                                │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                           Centro de Ayuda                                   │ │
│ │                  Encuentra respuestas a tus preguntas                       │ │
│ │                                                                             │ │
│ │ ❓ 234 Preguntas frecuentes  🏷️ 15 Temas  🏛️ 12 Dependencias              │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         BÚSQUEDA DE FAQS                                        │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [🔍] Buscar en preguntas frecuentes...                 [Buscar]            │ │
│ │                                                                             │ │
│ │ Filtros: [🏷️ Tema ⌄] [🏛️ Dependencia ⌄] [📊 Más populares] [🔄 Limpiar]   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           CATEGORÍAS PRINCIPALES                                │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 🏗️ Construcción │ │ 💰 Pagos        │ │ 📋 Certificados │ │ 🏛️ Trámites     │ │
│ │ 45 preguntas    │ │ 38 preguntas    │ │ 32 preguntas    │ │ 28 preguntas    │ │
│ │ [Explorar →]    │ │ [Explorar →]    │ │ [Explorar →]    │ │ [Explorar →]    │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 🏥 Salud        │ │ 🌱 Ambiente     │ │ 🚗 Movilidad    │ │ 📞 Contacto     │ │
│ │ 25 preguntas    │ │ 22 preguntas    │ │ 18 preguntas    │ │ 15 preguntas    │ │
│ │ [Explorar →]    │ │ [Explorar →]    │ │ [Explorar →]    │ │ [Explorar →]    │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                        PREGUNTAS MÁS POPULARES                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ ▼ ¿Cómo puedo solicitar un certificado de residencia?                      │ │
│ │   🏷️ Certificados, Residencia | 👁️ 1,245 vistas                            │ │
│ │   Para solicitar un certificado de residencia debes dirigirte a la         │ │
│ │   Secretaría de Gobierno con los siguientes documentos:                    │ │
│ │   • Cédula de ciudadanía original y copia                                  │ │
│ │   • Recibo de servicios públicos (no mayor a 3 meses)                      │ │
│ │   • Formulario diligenciado                                                │ │
│ │   [Ver trámite completo →] [¿Te ayudó esta respuesta? 👍 👎]               │ │
│ │                                                                             │ │
│ │ ▶ ¿Qué documentos necesito para una licencia de construcción?              │ │
│ │   🏷️ Construcción, Licencias | 👁️ 987 vistas                               │ │
│ │                                                                             │ │
│ │ ▶ ¿Cómo puedo pagar mis impuestos en línea?                                │ │
│ │   🏷️ Pagos, Impuestos | 👁️ 856 vistas                                      │ │
│ │                                                                             │ │
│ │ ▶ ¿Dónde puedo consultar el estado de mi trámite?                          │ │
│ │   🏷️ Trámites, Consulta | 👁️ 743 vistas                                    │ │
│ │                                                                             │ │
│ │ ▶ ¿Cuáles son los horarios de atención al público?                         │ │
│ │   🏷️ Contacto, Horarios | 👁️ 692 vistas                                    │ │
│ │                                                                             │ │
│ │                              [Ver todas las FAQs →]                        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           ¿NO ENCONTRASTE TU RESPUESTA?                         │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🤖 Pregunta al Asistente Virtual                                            │ │
│ │ Nuestro asistente con IA puede ayudarte con consultas específicas          │ │
│ │ [Hacer una pregunta →]                                                      │ │
│ │                                                                             │ │
│ │ 📞 Contacta con un funcionario                                              │ │
│ │ Habla directamente con nuestro equipo de atención                          │ │
│ │ [Ver opciones de contacto →]                                               │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                 FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Página PQRS - Wireframe**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   HEADER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] > [📝 PQRS]                                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            TÍTULO Y ESTADÍSTICAS                                │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                    PQRS - Peticiones, Quejas, Reclamos y Sugerencias       │ │
│ │                  Sistema de atención ciudadana de Chía                      │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         CONSULTA DE ESTADO                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [🔍] Buscar por número de radicado, asunto...          [Buscar]            │ │
│ │ Ingrese el número de radicado para consultar el estado de su PQRS          │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           INFORMACIÓN Y TIEMPOS                                 │
│ ┌─────────────────┐ ┌─────────────────────────────────────────────────────────┐ │
│ │ ¿Qué es PQRS?   │ │ Tiempos de Respuesta                                    │ │
│ │ • Petición      │ │ • Peticiones: 15 días hábiles                           │ │
│ │ • Queja         │ │ • Quejas y Reclamos: 15 días hábiles                    │ │
│ │ • Reclamo       │ │ • Sugerencias: 30 días hábiles                          │ │
│ │ • Sugerencia    │ │ Nota: Recibirá confirmación por correo electrónico     │ │
│ └─────────────────┘ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           FORMULARIO PQRS                                       │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Enviar Nueva PQRS                                                           │ │
│ │                                                                             │ │
│ │ Tipo de PQRS: [Petición ⌄]                                                 │ │
│ │                                                                             │ │
│ │ Nombre Completo: [_________________________]                               │ │
│ │ Email: [_________________________] Teléfono: [_____________]               │ │
│ │                                                                             │ │
│ │ Dependencia: [Seleccione dependencia ⌄]                                    │ │
│ │                                                                             │ │
│ │ Asunto: [_________________________________________________]                │ │
│ │                                                                             │ │
│ │ Descripción:                                                                │ │
│ │ [_________________________________________________________________]        │ │
│ │ [_________________________________________________________________]        │ │
│ │ [_________________________________________________________________]        │ │
│ │                                                                             │ │
│ │                                           [Limpiar] [Enviar PQRS]          │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                 FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.5.3 Diagramas de Componentes y Arquitectura

#### **Jerarquía Visual de Atomic Design**

```
ATOMIC DESIGN HIERARCHY
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 ORGANISMS                                       │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Header          │ │ DependenciasGrid│ │ TramitesList    │ │ Footer          │ │
│ │ - Navigation    │ │ - SearchBar     │ │ - FilterBar     │ │ - Links         │ │
│ │ - UserMenu      │ │ - CintaItems    │ │ - TramiteCards  │ │ - Contact       │ │
│ │ - MobileMenu    │ │ - Pagination    │ │ - Pagination    │ │ - Legal         │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                    ↑                                            │
│                              Composed of                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                MOLECULES                                        │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ SearchBar       │ │ Breadcrumb      │ │ TramiteCard     │ │ Pagination      │ │
│ │ - Input + Button│ │ - NavLinks      │ │ - Card + Badge  │ │ - Buttons       │ │
│ │ - Suggestions   │ │ - Separators    │ │ - Content       │ │ - Numbers       │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ FilterBar       │ │ MetricCard      │ │ FAQAccordion    │ │ UserDropdown    │ │
│ │ - Selects       │ │ - Icon + Stats  │ │ - Button + Text │ │ - Avatar + Menu │ │
│ │ - Clear Button  │ │ - Description   │ │ - Collapsible   │ │ - Links         │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                    ↑                                            │
│                              Composed of                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                  ATOMS                                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Button          │ │ Input           │ │ Card            │ │ Badge           │ │
│ │ - Primary       │ │ - Text          │ │ - Container     │ │ - Status        │ │
│ │ - Secondary     │ │ - Search        │ │ - Shadow        │ │ - Category      │ │
│ │ - Outline       │ │ - Password      │ │ - Hover         │ │ - Count         │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Icon            │ │ Avatar          │ │ Spinner         │ │ Link            │ │
│ │ - Heroicons     │ │ - User Photo    │ │ - Loading       │ │ - Internal      │ │
│ │ - Custom SVG    │ │ - Initials      │ │ - Sizes         │ │ - External      │ │
│ │ - Sizes         │ │ - Placeholder   │ │ - Colors        │ │ - Styled        │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Flujo de Datos entre Componentes**

```
DATA FLOW DIAGRAM
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE DATABASE                                  │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ dependencias    │ │ tramites        │ │ opas            │ │ faqs            │ │
│ │ subdependencias │ │ usuarios        │ │ auth.users      │ │ audit_logs      │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↕ API Calls
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               SERVICES LAYER                                    │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ dependenciasApi │ │ tramitesApi     │ │ opasApi         │ │ faqsApi         │ │
│ │ - getDependenc. │ │ - getTramites   │ │ - getOpas       │ │ - getFaqs       │ │
│ │ - searchDep.    │ │ - searchTram.   │ │ - searchOpas    │ │ - searchFaqs    │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↕ Hook Calls
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               CUSTOM HOOKS                                      │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ useSystemMetrics│ │ useDependencias │ │ useAuth         │ │ useDebounce     │ │
│ │ - loading       │ │ Cache           │ │ - user          │ │ - debouncedVal  │ │
│ │ - metrics       │ │ - cached data   │ │ - permissions   │ │ - delay         │ │
│ │ - error         │ │ - invalidate    │ │ - logout        │ │ - cleanup       │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↕ Props & State
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT COMPONENTS                                   │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ HomePage        │ │ DependenciasPage│ │ TramitesPage    │ │ FAQsPage        │ │
│ │ - metrics       │ │ - dependencias  │ │ - tramites      │ │ - faqs          │ │
│ │ - searchQuery   │ │ - searchQuery   │ │ - filters       │ │ - categories    │ │
│ │ - popularTerms  │ │ - expandedItems │ │ - pagination    │ │ - searchQuery   │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↕ User Interactions
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                USER INTERFACE                                   │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Search Input    │ │ Filter Dropdowns│ │ Pagination      │ │ Expand/Collapse │ │
│ │ - onChange      │ │ - onSelect      │ │ - onPageChange  │ │ - onClick       │ │
│ │ - onSubmit      │ │ - onClear       │ │ - onSizeChange  │ │ - onToggle      │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Estados de Componentes y Transiciones**

```
COMPONENT STATES DIAGRAM
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            LOADING STATES                                       │
│ ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│ │ INITIAL         │ -> │ LOADING         │ -> │ SUCCESS         │              │
│ │ - No data       │    │ - Spinner       │    │ - Data loaded   │              │
│ │ - Placeholder   │    │ - Skeleton UI   │    │ - Interactive   │              │
│ └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│                                 │                                               │
│                                 ↓                                               │
│                        ┌─────────────────┐                                     │
│                        │ ERROR           │                                     │
│                        │ - Error message │                                     │
│                        │ - Retry button  │                                     │
│                        └─────────────────┘                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           INTERACTION STATES                                    │
│ ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│ │ DEFAULT         │ -> │ HOVER           │ -> │ ACTIVE          │              │
│ │ - Base styles   │    │ - Hover effects │    │ - Pressed state │              │
│ │ - Idle state    │    │ - Cursor change │    │ - Visual feedback│              │
│ └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│                                 │                                               │
│                                 ↓                                               │
│                        ┌─────────────────┐                                     │
│                        │ FOCUS           │                                     │
│                        │ - Focus ring    │                                     │
│                        │ - Accessibility │                                     │
│                        └─────────────────┘                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           EXPANSION STATES                                      │
│ ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│ │ COLLAPSED       │ <->│ EXPANDING       │ -> │ EXPANDED        │              │
│ │ - Minimal view  │    │ - Animation     │    │ - Full content  │              │
│ │ - Summary only  │    │ - Transition    │    │ - All details   │              │
│ └─────────────────┘    └─────────────────┘    └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.5.4 Especificaciones Visuales Detalladas

#### **Dimensiones y Espaciado Exactos**

```
COMPONENT DIMENSIONS (px)
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Height: 64px (h-16)                                                         │ │
│ │ Logo Section: 256px (w-64)                                                  │ │
│ │ Navigation: flex-1 (remaining space)                                        │ │
│ │ User Section: 192px (w-48)                                                  │ │
│ │ Padding: 16px horizontal (px-4)                                             │ │
│ │ Z-index: 50                                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CARDS                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ TramiteCard:                                                                │ │
│ │ - Width: 280px (w-70) on desktop                                            │ │
│ │ - Height: auto (min-h-48 = 192px)                                           │ │
│ │ - Padding: 24px (p-6)                                                       │ │
│ │ - Border radius: 12px (rounded-xl)                                          │ │
│ │ - Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)                                │ │
│ │                                                                             │ │
│ │ MetricCard:                                                                 │ │
│ │ - Width: 240px (w-60) on desktop                                            │ │
│ │ - Height: 120px (h-30)                                                      │ │
│ │ - Padding: 20px (p-5)                                                       │ │
│ │ - Border radius: 8px (rounded-lg)                                           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ BUTTONS                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Primary Button:                                                             │ │
│ │ - Height: 44px (h-11) - Touch friendly                                      │ │
│ │ - Padding: 12px 24px (px-6 py-3)                                            │ │
│ │ - Border radius: 8px (rounded-lg)                                           │ │
│ │ - Font size: 16px (text-base)                                               │ │
│ │ - Font weight: 600 (font-semibold)                                          │ │
│ │                                                                             │ │
│ │ Secondary Button:                                                           │ │
│ │ - Height: 40px (h-10)                                                       │ │
│ │ - Padding: 10px 20px (px-5 py-2.5)                                          │ │
│ │ - Border radius: 6px (rounded-md)                                           │ │
│ │ - Font size: 14px (text-sm)                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ INPUTS                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Search Input:                                                               │ │
│ │ - Height: 48px (h-12)                                                       │ │
│ │ - Padding: 12px 16px (px-4 py-3)                                            │ │
│ │ - Border radius: 8px (rounded-lg)                                           │ │
│ │ - Border: 2px solid #E5E7EB (border-gray-200)                               │ │
│ │ - Focus border: 2px solid #009045 (primary-green)                           │ │
│ │ - Font size: 16px (text-base)                                               │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Estados Hover, Focus y Active**

```
INTERACTION STATES SPECIFICATIONS
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BUTTONS                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Primary Button (bg-primary-yellow):                                        │ │
│ │ - Default: #FFDC00, text-black                                             │ │
│ │ - Hover: #F8E000 (primary-yellow-alt), scale(1.02)                        │ │
│ │ - Active: #E6C700, scale(0.98)                                             │ │
│ │ - Focus: ring-2 ring-primary-green ring-offset-2                           │ │
│ │ - Disabled: opacity-50, cursor-not-allowed                                 │ │
│ │                                                                             │ │
│ │ Secondary Button (bg-primary-green):                                       │ │
│ │ - Default: #009045, text-white                                             │ │
│ │ - Hover: #009540 (primary-green-alt), shadow-lg                           │ │
│ │ - Active: #007A3A, shadow-sm                                               │ │
│ │ - Focus: ring-2 ring-primary-yellow ring-offset-2                          │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CARDS                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ TramiteCard:                                                                │ │
│ │ - Default: shadow-md, border-gray-200                                       │ │
│ │ - Hover: shadow-lg, scale(1.02), border-primary-green                      │ │
│ │ - Active: shadow-sm, scale(0.98)                                            │ │
│ │ - Focus: ring-2 ring-primary-green ring-offset-2                            │ │
│ │                                                                             │ │
│ │ DependenciaCinta:                                                           │ │
│ │ - Collapsed: height-20 (80px), overflow-hidden                             │ │
│ │ - Expanding: transition-all duration-300 ease-in-out                       │ │
│ │ - Expanded: height-auto, max-height-64 (256px)                             │ │
│ │ - Hover: bg-gray-50, border-l-4 border-primary-yellow                      │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ INPUTS                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Search Input:                                                               │ │
│ │ - Default: border-gray-200, bg-white                                        │ │
│ │ - Focus: border-primary-green, ring-1 ring-primary-green                    │ │
│ │ - Error: border-red-500, ring-1 ring-red-500                               │ │
│ │ - Success: border-green-500, ring-1 ring-green-500                         │ │
│ │                                                                             │ │
│ │ Select Dropdown:                                                            │ │
│ │ - Default: border-gray-200, cursor-pointer                                  │ │
│ │ - Hover: border-gray-300, bg-gray-50                                        │ │
│ │ - Open: border-primary-green, shadow-lg                                     │ │
│ │ - Focus: ring-2 ring-primary-green ring-offset-1                            │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Animaciones y Transiciones**

```
ANIMATION SPECIFICATIONS
┌─────────────────────────────────────────────────────────────────────────────────┐
│ LOADING ANIMATIONS                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Spinner:                                                                    │ │
│ │ - Animation: spin 1s linear infinite                                       │ │
│ │ - Size: 24px (w-6 h-6) for buttons, 32px (w-8 h-8) for pages              │ │
│ │ - Color: currentColor or primary-green                                      │ │
│ │                                                                             │ │
│ │ Skeleton Loading:                                                           │ │
│ │ - Animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite               │ │
│ │ - Background: bg-gray-200 to bg-gray-300                                    │ │
│ │ - Border radius: matches target component                                   │ │
│ │                                                                             │ │
│ │ Progress Bar:                                                               │ │
│ │ - Animation: progress-fill 2s ease-in-out                                  │ │
│ │ - Background: bg-primary-yellow                                             │ │
│ │ - Height: 4px (h-1)                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ EXPANSION ANIMATIONS                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Accordion/Cinta Expansion:                                                  │ │
│ │ - Duration: 300ms                                                           │ │
│ │ - Easing: cubic-bezier(0.4, 0, 0.2, 1) (ease-out)                         │ │
│ │ - Properties: height, opacity, transform                                    │ │
│ │ - Max height: 256px with scroll if needed                                   │ │
│ │                                                                             │ │
│ │ Modal/Dropdown Appearance:                                                  │ │
│ │ - Duration: 200ms                                                           │ │
│ │ - Easing: cubic-bezier(0, 0, 0.2, 1) (ease-out)                           │ │
│ │ - Transform: scale(0.95) to scale(1)                                        │ │
│ │ - Opacity: 0 to 1                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ HOVER ANIMATIONS                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Card Hover:                                                                 │ │
│ │ - Duration: 150ms                                                           │ │
│ │ - Easing: ease-in-out                                                       │ │
│ │ - Transform: translateY(-2px) scale(1.02)                                   │ │
│ │ - Shadow: shadow-md to shadow-lg                                            │ │
│ │                                                                             │ │
│ │ Button Hover:                                                               │ │
│ │ - Duration: 100ms                                                           │ │
│ │ - Easing: ease-in-out                                                       │ │
│ │ - Transform: scale(1.02)                                                    │ │
│ │ - Background color transition                                               │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.5.5 Wireframes de Funcionalidades Clave

#### **Sistema de Búsqueda Fuzzy con Sugerencias**

```
SEARCH FUNCTIONALITY WIREFRAME
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BÚSQUEDA CON SUGERENCIAS                              │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [🔍] licencia const...                                 [Buscar]            │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ SUGERENCIAS INTELIGENTES                                                │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ 🏛️ DEPENDENCIAS (2 coincidencias)                                  │ │ │ │
│ │ │ │ • Secretaría de Planeación > Licencias y Permisos                  │ │ │ │
│ │ │ │ • Secretaría de Obras > Construcción                               │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ 📄 TRÁMITES (5 coincidencias)                                       │ │ │ │
│ │ │ │ • [TRAM-001] Licencia de Construcción                              │ │ │ │
│ │ │ │ • [TRAM-015] Licencia de Construcción Menor                        │ │ │ │
│ │ │ │ • [TRAM-023] Licencia de Construcción Comercial                    │ │ │ │
│ │ │ │ • [TRAM-045] Constancia de Licencia                                │ │ │ │
│ │ │ │ • [TRAM-067] Modificación de Licencia                              │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ ⚡ OPAS (2 coincidencias)                                            │ │ │ │
│ │ │ │ • [OPA-001] Autorización de Pago - Licencia Construcción           │ │ │ │
│ │ │ │ • [OPA-015] Constancia de Pago - Licencia                          │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────────────┘ │ │ │
│ │ │                                                                         │ │ │
│ │ │ [Ver todos los resultados →]                                            │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ALGORITMO FUZZY:                                                                │
│ • Búsqueda exacta: "licencia construcción" → matches directos                  │
│ • Búsqueda parcial: "lic const" → matches con caracteres faltantes             │
│ • Búsqueda con errores: "lisencia" → tolerancia a 1-2 caracteres               │
│ • Priorización: Exactos > Parciales > Con errores                              │
│ • Límite: 8 sugerencias máximo por categoría                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### **Navegación Progresiva de Dependencias (3 Niveles)**

```
PROGRESSIVE NAVIGATION WIREFRAME
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NAVEGACIÓN DE 3 NIVELES                                  │
│                                                                                 │
│ NIVEL 1: DEPENDENCIA (Siempre visible - 80px altura)                           │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌─────┐ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🏛️  │ │ [SEPLAN] Secretaría de Planeación │ 📂3 │ 📄15 │ ⚡8 │ [⌄]   │ │ │
│ │ └─────┘ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                    ↓ Click para expandir                       │
│ NIVEL 2: SUBDEPENDENCIAS (Expandible - max 250px con scroll)                   │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌─────┐ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🏛️  │ │ [SEPLAN] Secretaría de Planeación │ 📂3 │ 📄15 │ ⚡8 │ [⌃]   │ │ │
│ │ └─────┘ └─────────────────────────────────────────────────────────────────┘ │ │
│ │         ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │         │ 📂 [SUB-001] Planeación Urbana        │ 📄8  │ ⚡3  │ [⌄]    │ │ │
│ │         │ 📂 [SUB-002] Desarrollo Territorial   │ 📄5  │ ⚡3  │ [⌄]    │ │ │
│ │         │ 📂 [SUB-003] Licencias y Permisos     │ 📄2  │ ⚡2  │ [⌄]    │ │ │
│ │         └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                    ↓ Click en subdependencia                   │
│ NIVEL 3: TRÁMITES Y OPAS (Expandible - max 200px con scroll)                   │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌─────┐ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🏛️  │ │ [SEPLAN] Secretaría de Planeación │ 📂3 │ 📄15 │ ⚡8 │ [⌃]   │ │ │
│ │ └─────┘ └─────────────────────────────────────────────────────────────────┘ │ │
│ │         ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │         │ 📂 [SUB-001] Planeación Urbana        │ 📄8  │ ⚡3  │ [⌃]    │ │ │
│ │         │   TRÁMITES:                                                     │ │ │
│ │         │   📄 [TRAM-001] Licencia de Construcción      [Ver detalles →] │ │ │
│ │         │   📄 [TRAM-002] Certificado de Uso del Suelo  [Ver detalles →] │ │ │
│ │         │   📄 [TRAM-003] Permiso de Demolición         [Ver detalles →] │ │ │
│ │         │   OPAS:                                                         │ │ │
│ │         │   ⚡ [OPA-001] Autorización de Pago           [Ver detalles →] │ │ │
│ │         │   ⚡ [OPA-002] Orden de Servicio              [Ver detalles →] │ │ │
│ │         └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ COMPORTAMIENTO:                                                                 │
│ • Solo una dependencia expandida a la vez                                      │
│ • Solo una subdependencia expandida por dependencia                            │
│ • Animación suave de 300ms para expansión/colapso                              │
│ • Scroll interno si el contenido excede la altura máxima                       │
│ • Indicadores visuales claros del estado (⌄ colapsado, ⌃ expandido)            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 3. Páginas Principales Documentadas

### 3.1 Página Principal (Home) - `/`

#### **Componentes Principales**

- **Hero Section**: Título, descripción y búsqueda principal
- **Búsquedas Populares**: Badges con términos frecuentes
- **Sistema de Métricas**: Contadores de dependencias, trámites, OPAs, FAQs
- **Servicios Más Utilizados**: Grid de 8 servicios principales
- **Accesos Rápidos**: Enlaces directos a secciones principales

#### **Funcionalidades**

- Búsqueda global integrada con redirección a `/tramites?q=query`
- Navegación rápida a las 5 secciones principales
- Responsive design mobile-first
- Métricas del sistema en tiempo real

#### **Código de Ejemplo**

```typescript
// src/app/page.tsx
export default function HomePage() {
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="bg-gray-50">
      <div className="container-custom py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-green mb-4">
            Portal de Atención Ciudadana
          </h1>
          <h2 className="text-2xl text-primary-yellow font-semibold mb-2">
            Alcaldía de Chía
          </h2>
        </header>
        {/* Resto del componente */}
      </div>
    </div>
  )
}
```

### 3.2 Página de Dependencias - `/dependencias`

#### **Características Principales**

- **Diseño de Cinta Horizontal**: Visualización compacta y eficiente
- **Métricas del Sistema**: Datos reales del negocio (dependencias, trámites, OPAs)
- **Búsqueda Integral**: Fuzzy search en dependencias, subdependencias, trámites y OPAs
- **Navegación Progresiva**: 3 niveles de profundidad

#### **Componentes Clave**

- `useSystemMetrics`: Hook para métricas reales del sistema
- `DependenciasCintaGrid`: Grid principal con búsqueda
- `DependenciaCintaHorizontal`: Componente individual de dependencia

#### **Métricas Implementadas**

```typescript
// src/hooks/useSystemMetrics.ts
export function useFormattedSystemMetrics() {
  return {
    formattedMetrics: [
      {
        id: 'dependencias',
        label: 'Dependencias',
        value: metrics.totalDependencias,
        icon: '🏛️',
        description: 'Dependencias municipales activas',
        color: 'text-primary-green',
      },
      {
        id: 'subdependencias',
        label: 'Subdependencias',
        value: metrics.totalSubdependencias,
        icon: '📂',
        description: 'Subdependencias organizacionales',
        color: 'text-blue-600',
      },
      // ... más métricas
    ],
  }
}
```

#### **Funcionalidad de Búsqueda**

- **Búsqueda Fuzzy**: Tolerancia a errores de escritura
- **Búsqueda Multi-nivel**: Dependencias → Subdependencias → Trámites/OPAs
- **Sugerencias Inteligentes**: Autocompletado contextual
- **Filtrado en Tiempo Real**: Resultados instantáneos

### 3.3 Página de Trámites - `/tramites`

#### **Funcionalidades**

- **Lista Paginada**: Trámites con filtros avanzados
- **Búsqueda por Texto**: Nombre, código único, descripción
- **Filtros**: Por dependencia, tipo de pago, estado
- **Vista Detallada**: Información completa del trámite

#### **Componentes**

- `TramitesList`: Lista principal con filtros
- `TramiteCard`: Tarjeta individual de trámite
- `TramiteDetail`: Vista detallada del trámite

### 3.4 Página de Búsqueda Unificada - `/buscar`

#### **Características**

- **Búsqueda Global**: Trámites, OPAs, FAQs
- **Filtros Avanzados**: Por tipo, dependencia, estado
- **Resultados Unificados**: Vista consolidada de todos los tipos
- **Paginación**: Manejo eficiente de grandes volúmenes

### 3.5 Centro de Ayuda - `/faqs`

#### **Funcionalidades**

- **FAQs Categorizadas**: Por tema y dependencia
- **Búsqueda de FAQs**: Texto completo
- **Estadísticas**: Contadores de preguntas y temas
- **Navegación por Categorías**: Filtrado inteligente

### 3.6 PQRS - `/pqrs`

#### **Funcionalidades**

- **Formulario de PQRS**: Peticiones, Quejas, Reclamos y Sugerencias
- **Consulta de Estado**: Búsqueda por número de radicado
- **Clasificación por Tipo**: Petición, Queja, Reclamo, Sugerencia
- **Seguimiento**: Sistema de notificaciones por email
- **Tiempos de Respuesta**: Información clara sobre plazos

### 3.7 Búsqueda Global Unificada - `/tramites`

#### **Funcionalidades**

- **Búsqueda Global**: Trámites, OPAs y FAQs en una sola interfaz
- **Punto de Entrada Principal**: Todas las búsquedas del portal redirigen aquí
- **Filtros Avanzados**: Por dependencia, tipo (Trámites/OPAs/FAQs), estado, costo
- **Resultados Consolidados**: Vista unificada con badges de tipo diferenciados
- **Paginación**: Manejo eficiente de grandes volúmenes
- **Información Detallada**: Costos, tiempos estimados, vistas (FAQs), requisitos
- **URL Parameters**: Soporte para `?q=search_term` desde homepage y otras páginas

---

---

## 📋 4. Estado de Implementación Actual

### 4.1 Navegación Principal Actualizada

La navegación principal ha sido reestructurada para incluir 5 páginas principales:

1. **Inicio** (`/`) - ✅ Implementado con métricas y servicios
2. **Dependencias** (`/dependencias`) - ✅ Implementado con diseño de cinta
3. **Trámites y Servicios** (`/tramites`) - ✅ Implementado con búsqueda unificada
4. **FAQ** (`/faqs`) - ✅ Implementado con categorías y búsqueda
5. **PQRS** (`/pqrs`) - ✅ Implementado con formulario completo

### 4.2 Cambios Principales Realizados

#### **Navegación Unificada**
- Eliminación del menú separado "OPAs"
- Integración de OPAs en "Trámites y Servicios"
- Adición de página PQRS para atención ciudadana

#### **Páginas Implementadas**
- **Homepage**: Métricas del sistema, servicios populares, búsquedas sugeridas
- **Dependencias**: Diseño de cinta expandible con 3 niveles de navegación
- **Trámites y Servicios**: Búsqueda unificada con filtros avanzados
- **FAQ**: Centro de ayuda con categorías y búsqueda
- **PQRS**: Sistema completo de peticiones ciudadanas

#### **Componentes Nuevos**
- `PQRSForm`: Formulario completo para PQRS
- `UnifiedSearch`: Búsqueda que combina trámites y OPAs
- `DependenciasCinta`: Componente de cinta expandible
- `FAQAccordion`: Acordeón para preguntas frecuentes

### 4.3 Próximos Pasos

#### **Funcionalidades Pendientes**
1. Integración con base de datos real para métricas y contenido
2. ✅ ~~Implementación de búsqueda global~~ **COMPLETADO** - Integrado en `/tramites`
3. Conexión de formularios con Supabase
4. Sistema de notificaciones para PQRS
5. Chatbot de IA integrado
6. Optimización de búsqueda con indexación full-text

#### **Mejoras de UX/UI**
1. Animaciones y transiciones suaves
2. Estados de carga optimizados
3. Mejoras de accesibilidad
4. Optimización para dispositivos móviles

---

## 🧩 5. Componentes y Arquitectura

### 4.1 Jerarquía de Componentes (Atomic Design)

#### **Atoms (Componentes Básicos)**

##### **Button Component**

```typescript
// src/components/atoms/Button.tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

// Variantes con colores institucionales
const variantClasses = {
  primary: 'bg-primary-yellow text-black hover:bg-primary-yellow-alt',
  secondary: 'bg-primary-green text-white hover:bg-primary-green-alt',
  outline:
    'border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white',
}
```

##### **Input Component**

```typescript
// src/components/atoms/Input.tsx
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'search'
  icon?: React.ReactNode
}
```

##### **Card Component**

```typescript
// src/components/atoms/Card.tsx
interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}
```

##### **Badge Component**

```typescript
// src/components/atoms/Badge.tsx
interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

#### **Molecules (Componentes Compuestos)**

##### **SearchBar Component**

```typescript
// src/components/molecules/SearchBar.tsx
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  showSuggestions?: boolean
  loading?: boolean
  className?: string
}
```

##### **Breadcrumb Component**

```typescript
// src/components/molecules/Breadcrumb.tsx
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}
```

##### **SearchWithSuggestions Component**

```typescript
// src/components/molecules/SearchWithSuggestions.tsx
interface SearchWithSuggestionsProps {
  dependencias: DependenciaConStats[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
}
```

#### **Organisms (Componentes Complejos)**

##### **Header Component**

```typescript
// src/components/organisms/Header.tsx
const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Dependencias', href: '/dependencias' },
  { name: 'Trámites y OPAs', href: '/buscar' },
  { name: 'Centro de Ayuda', href: '/faqs' },
]

export default function Header() {
  const { user, logout, loading } = useAuth()
  // Implementación del header con navegación y autenticación
}
```

##### **DependenciasCintaGrid Component**

```typescript
// src/components/organisms/DependenciasCintaGrid.tsx
interface DependenciasCintaGridProps {
  initialDependencias?: DependenciaConStats[]
  showSearch?: boolean
  searchPlaceholder?: string
  className?: string
}

// Funcionalidades:
// - Búsqueda fuzzy multi-nivel
// - Cache optimizado con useDependenciasCache
// - Filtrado en tiempo real
// - Estados de carga y error
```

##### **TramitesList Component**

```typescript
// src/components/organisms/TramitesList.tsx
interface TramitesListProps {
  initialTramites?: TramiteWithRelations[]
  dependencias?: Dependencia[]
  initialSearchQuery?: string
  initialDependenciaFilter?: string
  initialPagoFilter?: string
  className?: string
  showSearch?: boolean
  showFilters?: boolean
  searchPlaceholder?: string
  pageSize?: number
}
```

### 4.2 Props Interfaces y Tipos TypeScript

#### **Tipos de Datos Principales**

```typescript
// src/types/index.ts
export interface Dependencia {
  id: string
  codigo: string
  nombre: string
  sigla?: string
  descripcion?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface DependenciaConStats extends Dependencia {
  subdependencias_count: number
  tramites_count: number
  opas_count: number
  faqs_count: number
  subdependencias?: Subdependencia[]
}

export interface TramiteWithRelations extends Tramite {
  subdependencia?: SubdependenciaWithRelations
}

export interface SearchFilters {
  query?: string
  subdependencia_id?: string
  tiene_pago?: boolean
  activo?: boolean
}
```

#### **Tipos de Autenticación**

```typescript
// src/types/auth.ts
export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: 'admin' | 'funcionario'
  dependencias_ids: string[]
  activo: boolean
}

export interface AuthState {
  user: User | null
  session: Session | null
  dependencias: Dependencia[]
  loading: boolean
  error: string | null
}
```

---

## 🔧 5. Hooks Personalizados y Funcionalidades

### 5.1 Hooks de Autenticación

#### **useAuth Hook**

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  return {
    user: User | null,
    dependencias: Dependencia[],
    loading: boolean,
    error: string | null,
    hasPermission: (permission: string, dependencia_id?: string) => boolean,
    hasAccessToDependencia: (dependencia_id: string) => boolean,
    login: (credentials: LoginCredentials) => Promise<void>,
    logout: () => Promise<void>,
    refreshUser: () => Promise<void>
  }
}
```

### 5.2 Hooks de Datos y Cache

#### **useSystemMetrics Hook**

```typescript
// src/hooks/useSystemMetrics.ts
export function useSystemMetrics(): SystemMetrics {
  // Calcula métricas reales del sistema desde la API
  const calculateMetrics = async () => {
    const dependencias = await getDependenciasResumen()

    const totalDependencias = dependencias.length
    const totalSubdependencias = dependencias.reduce(
      (sum, dep) => sum + (dep.subdependencias_count || 0),
      0
    )
    const totalTramites = dependencias.reduce((sum, dep) => sum + (dep.tramites_count || 0), 0)
    const totalOpas = dependencias.reduce((sum, dep) => sum + (dep.opas_count || 0), 0)

    return {
      totalDependencias,
      totalSubdependencias,
      totalTramites,
      totalOpas,
      loading: false,
      error: null,
    }
  }
}
```

#### **useDependenciasCache Hook**

```typescript
// src/hooks/useDependenciasCache.ts
export function useDependenciasCache() {
  return {
    getDependenciasResumenCached: () => Promise<DependenciaConStats[]>,
    getDependenciaDetalladaCached: (id: string) => Promise<DependenciaDetallada>,
    invalidateCache: () => void,
    loading: boolean,
    error: string | null
  }
}

// Cache TTL: 5 minutos para resumen, 10 minutos para detalles
const CACHE_TTL = {
  RESUMEN: 5 * 60 * 1000,
  DETALLES: 10 * 60 * 1000,
}
```

### 5.3 Hooks de Utilidades

#### **useDebounce Hook**

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

#### **useSearchSuggestions Hook**

```typescript
// src/hooks/useSearchSuggestions.ts
export function useSearchSuggestions({
  dependencias,
  query,
  maxSuggestions = 8
}: UseSearchSuggestionsProps) {
  return {
    suggestions: SearchSuggestion[],
    hasSuggestions: boolean
  }
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'dependencia' | 'tramite' | 'opa'
  category: string
  dependenciaId?: string
  subdependenciaId?: string
}
```

---

## 🌐 6. Servicios de API y Integración con Supabase

### 6.1 Configuración de Supabase

#### **Cliente de Supabase**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### 6.2 Servicios de API Principales

#### **dependenciasApi Service**

```typescript
// src/services/dependenciasApi.ts
export async function getDependencias(): Promise<Dependencia[]>
export async function getDependenciaByCodigo(
  codigo: string
): Promise<DependenciaWithRelations | null>
export async function getDependenciasResumen(): Promise<DependenciaConStats[]>
export async function getDependenciaConSubdependenciasDetalladas(dependenciaId: string)

// Función optimizada para métricas del sistema
export async function getDependenciasResumen() {
  const { data, error } = await supabase
    .from('dependencias')
    .select(
      `
      *,
      subdependencias!inner (
        id, nombre, codigo, sigla,
        tramites (count),
        opas (count)
      ),
      faqs (count)
    `
    )
    .eq('activo', true)
    .eq('subdependencias.activo', true)
    .order('nombre')
}
```

#### **tramitesApi Service**

```typescript
// src/services/tramitesApi.ts
export async function getTramites(): Promise<TramiteWithRelations[]>
export async function getTramiteByCodigo(codigo: string): Promise<TramiteWithRelations | null>
export async function searchTramites(query: string): Promise<TramiteWithRelations[]>
export async function searchTramitesWithFilters(
  filters: SearchFilters
): Promise<TramiteWithRelations[]>
export async function getTramitesStats(): Promise<TramitesStats>

// Búsqueda con filtros avanzados
export async function searchTramitesWithFilters(filters: SearchFilters) {
  let query = supabase.from('tramites').select(`
      *,
      subdependencia:subdependencias (
        *,
        dependencia:dependencias (*)
      )
    `)

  if (filters.query) {
    query = query.or(`nombre.ilike.%${filters.query}%,codigo_unico.ilike.%${filters.query}%`)
  }

  if (filters.subdependencia_id) {
    query = query.eq('subdependencia_id', filters.subdependencia_id)
  }

  return query.order('nombre')
}
```

#### **faqsApi Service**

```typescript
// src/services/faqsApi.ts
export async function getFaqs(): Promise<FaqWithRelations[]>
export async function getFaqsByTema(tema: string): Promise<FaqWithRelations[]>
export async function getFaqsByDependencia(dependenciaId: string): Promise<FaqWithRelations[]>
export async function searchFaqs(query: string): Promise<FaqWithRelations[]>
export async function getFaqsStats(): Promise<FaqsStats>
export async function getFaqsTemas(): Promise<string[]>
```

#### **opasApi Service**

```typescript
// src/services/opasApi.ts
export async function getOpas(): Promise<OpaWithRelations[]>
export async function getOpaByCodigo(codigo: string): Promise<OpaWithRelations | null>
export async function searchOpas(query: string): Promise<OpaWithRelations[]>
export async function getOpasBySubdependencia(subdependenciaId: string): Promise<OpaWithRelations[]>
```

---

## 🔍 7. Funcionalidades Específicas

### 7.1 Sistema de Búsqueda Fuzzy

#### **Algoritmo de Búsqueda**

```typescript
// src/components/organisms/DependenciasCintaGrid.tsx
const fuzzySearch = useCallback((text: string, query: string): boolean => {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // Búsqueda exacta
  if (textLower.includes(queryLower)) return true

  // Búsqueda fuzzy - permite caracteres faltantes
  let queryIndex = 0
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++
    }
  }

  return queryIndex === queryLower.length
}, [])
```

#### **Búsqueda Multi-nivel**

```typescript
const searchInTramitesAndOpas = useCallback(
  (dep: DependenciaConStats, query: string): boolean => {
    if (dep.subdependencias) {
      for (const subdep of dep.subdependencias) {
        // Buscar en trámites
        if (subdep.tramites) {
          for (const tramite of subdep.tramites) {
            if (fuzzySearch(tramite.nombre, query) || fuzzySearch(tramite.codigo_unico, query)) {
              return true
            }
          }
        }
        // Buscar en OPAs
        if (subdep.opas) {
          for (const opa of subdep.opas) {
            if (fuzzySearch(opa.nombre, query) || fuzzySearch(opa.codigo_opa, query)) {
              return true
            }
          }
        }
      }
    }
    return false
  },
  [fuzzySearch]
)
```

### 7.2 Gestión de Cache y Optimización

#### **Cache Inteligente**

```typescript
// src/hooks/useDependenciasCache.ts
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const isValidCacheEntry = <T>(entry: CacheEntry<T> | null): boolean => {
  return entry !== null && Date.now() < entry.expiresAt
}

const createCacheEntry = <T>(data: T, ttl: number): CacheEntry<T> => ({
  data,
  timestamp: Date.now(),
  expiresAt: Date.now() + ttl,
})
```

### 7.3 Responsive Design y Accesibilidad

#### **Breakpoints y Diseño Responsive**

```typescript
// Configuración de breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px'   // Large desktop
}

// Ejemplo de uso en componentes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Contenido responsive */}
</div>
```

#### **Accesibilidad (WCAG AA)**

- **Contraste de Colores**: Todos los colores cumplen WCAG AA (4.5:1 mínimo)
- **Navegación por Teclado**: Todos los elementos interactivos son accesibles
- **ARIA Labels**: Etiquetas descriptivas para lectores de pantalla
- **Semántica HTML**: Uso correcto de elementos semánticos

```typescript
// Ejemplo de accesibilidad en componentes
<button
  aria-label="Expandir información de la dependencia"
  className="focus:outline-none focus:ring-2 focus:ring-primary-green"
  onClick={handleExpand}
>
  {/* Contenido del botón */}
</button>
```

---

## 🚀 8. Guías de Replicación

### 8.1 Requisitos del Sistema

#### **Herramientas Necesarias**

- **Node.js**: v18.17.0 o superior
- **npm**: v9.0.0 o superior (o yarn/pnpm)
- **Git**: Para control de versiones
- **Editor**: VS Code recomendado con extensiones TypeScript y Tailwind CSS

#### **Dependencias del Sistema**

```bash
# Verificar versiones
node --version  # >= 18.17.0
npm --version   # >= 9.0.0
```

### 8.2 Instalación y Configuración

#### **Paso 1: Clonar y Configurar el Proyecto**

```bash
# Clonar el repositorio
git clone <repository-url>
cd portal-ciudadano-chia

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
```

#### **Paso 2: Configurar Variables de Entorno**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### **Paso 3: Configurar Supabase**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar Supabase localmente (opcional)
supabase init
supabase start

# Ejecutar migraciones
supabase db reset

# Poblar datos iniciales
npm run db:seed
```

#### **Paso 4: Ejecutar el Proyecto**

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build
npm run start

# Ejecutar tests
npm run test
npm run test:coverage
```

---

## 🎯 **RESUMEN DE MEJORAS IMPLEMENTADAS - PÁGINA TRÁMITES**

### **✅ Mejoras Completadas y Desplegadas en Producción**

#### **1. Sistema de Filtros Avanzados**
- **✅ Implementado**: Layout responsivo de dos filas con 4 filtros dinámicos
- **✅ Funcionalidad**: Dependencia → Subdependencia (poblado dinámicamente)
- **✅ Nuevos Filtros**: Tipo (Todos/Trámites/OPAs/FAQs) y Tipo de Pago (Todos/Gratuito/Con pago)
- **✅ Estadísticas**: Tiempo real desde base de datos (108 trámites, 722 OPAs, 330 FAQs, 14 dependencias)
- **✅ Responsive**: Adaptación completa para móvil (375px), tablet (768px), desktop (1920px+)

#### **2. Diseño de Cards Mejorado**
- **✅ Sección Requisitos**: Nueva sección con formato de lista con bullets
- **✅ Datos Reales**: 108 trámites con requisitos específicos desde base de datos
- **✅ Enlaces Gubernamentales**: Botones oficiales SUIT (azul #1e40af) y GOV.CO (verde #059669)
- **✅ URLs Auténticas**: Enlaces reales a portales gubernamentales oficiales
- **✅ Seguridad**: Atributos `target="_blank"` y `rel="noopener noreferrer"`

#### **3. Integración con Base de Datos Real**
- **✅ Migración Ejecutada**: Campo `requisitos` como TEXT[] con índice GIN
- **✅ Datos Poblados**: 108 trámites con requisitos realistas y específicos
- **✅ URLs Gubernamentales**: Utilizando campos existentes `visualizacion_suit` y `visualizacion_gov`
- **✅ Servicio Unificado**: `unifiedSearchService` para búsqueda across all content types
- **✅ Estadísticas Reales**: `statisticsService` con datos en tiempo real

#### **4. Implementación Técnica Robusta**
- **✅ Next.js 15 Compatible**: Suspense boundary para `useSearchParams()`
- **✅ Build Optimizado**: Guards para evitar data fetching durante Docker build
- **✅ Dynamic Rendering**: `export const dynamic = 'force-dynamic'` para páginas dinámicas
- **✅ Error Handling**: Manejo robusto de errores y estados de carga
- **✅ Performance**: Debounce, memoización, lazy loading implementados

#### **5. Responsive Design Completo**
- **✅ Mobile-First**: Diseño optimizado para 375px con stack vertical
- **✅ Tablet Optimized**: Layout de 2-3 columnas para 768px-1023px
- **✅ Desktop Excellence**: Experiencia completa para 1024px+ con hover effects
- **✅ Touch Friendly**: Botones mínimo 44px, espaciado adecuado
- **✅ Accessibility**: ARIA labels, semantic HTML, keyboard navigation

### **📊 Métricas de Éxito**

#### **Datos Reales Implementados**
- **108 Trámites** con requisitos completos y enlaces gubernamentales
- **722 OPAs** integradas en búsqueda unificada
- **330 FAQs** disponibles para búsqueda comprehensiva
- **14 Dependencias** con servicios activos
- **1,160 Items** totales searchables across all categories

#### **Performance Achievements**
- **Sub-segundo**: Tiempos de respuesta para filtrado
- **100% Responsive**: Diseño across all device sizes
- **Real-time**: Estadísticas y filtros dinámicos
- **Production Ready**: Deployment exitoso en Coolify/Docker

#### **Government Integration**
- **SUIT Portal**: `https://visorsuit.funcionpublica.gov.co/`
- **GOV.CO Portal**: `https://www.gov.co/ficha-tramites-y-servicios/`
- **Authentic URLs**: Enlaces reales a trámites gubernamentales
- **Security Compliant**: Manejo seguro de enlaces externos

### **🔧 Archivos Técnicos Actualizados**

#### **Frontend Components**
- `src/app/tramites/page.tsx` - Página principal con Suspense boundary
- `src/services/unifiedSearch.ts` - Servicio de búsqueda unificada
- `src/services/statistics.ts` - Servicio de estadísticas en tiempo real
- `src/types/index.ts` - Definiciones TypeScript actualizadas

#### **Database & Infrastructure**
- `supabase/migrations/018_add_requisitos_to_tramites.sql` - Migración de requisitos
- `next.config.js` - Configuración Next.js 15 compatible
- `tests/integration/tramites-enhancements.test.ts` - Tests comprehensivos

#### **Documentation**
- `Docs/front-end-spec.md` - Especificaciones actualizadas (este documento)
- Wireframes actualizados con diseño real implementado
- Especificaciones técnicas detalladas para replicación

### **🎉 Estado Final**

**✅ COMPLETAMENTE IMPLEMENTADO Y DESPLEGADO**

La página `/tramites` ha sido transformada exitosamente en un portal gubernamental profesional con:
- Funcionalidad completa de filtros avanzados
- Integración real con base de datos y portales gubernamentales
- Diseño responsive y accesible
- Performance optimizado y deployment exitoso
- Documentación técnica completa para mantenimiento futuro

---

**📋 Fin de la Documentación Técnica Frontend**

_Esta documentación se actualiza regularmente para reflejar el estado actual del sistema. Para contribuciones o correcciones, por favor crear un issue o pull request en el repositorio del proyecto._
