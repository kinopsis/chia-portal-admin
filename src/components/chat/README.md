# 🤖 AI Chatbot Components

**Epic 4 - US-012: Interfaz de Usuario del Chatbot Web**

Componentes de interfaz de usuario para el asistente virtual del Portal de Atención Ciudadana de Chía.

## 📋 Componentes Implementados

### 🎯 ChatWidget (Principal)
**Archivo**: `ChatWidget.tsx`

Widget principal del chatbot que se integra en todas las páginas públicas.

**Características**:
- Widget flotante responsive
- Posicionamiento configurable (bottom-right, bottom-left, bottom-center)
- Estados: abierto/cerrado, minimizado/maximizado
- Notificaciones de nuevos mensajes
- Tooltip de ayuda para nuevos usuarios
- Cumplimiento WCAG AA

**Props**:
```typescript
interface ChatWidgetProps {
  className?: string
  defaultOpen?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}
```

**Uso**:
```tsx
<ChatWidget 
  position="bottom-right"
  defaultOpen={false}
/>
```

### 💬 ChatMessage
**Archivo**: `ChatMessage.tsx`

Componente para renderizar mensajes individuales en la conversación.

**Características**:
- Soporte para roles: user, assistant, system
- Indicadores de confianza visual
- Referencias a fuentes de información
- Sistema de feedback integrado
- Alertas de baja confianza
- Detección automática de enlaces

**Props**:
```typescript
interface ChatMessageProps {
  message: ChatMessageType
  onFeedback?: (messageId: string, feedback: 'helpful' | 'not_helpful') => void
  className?: string
}
```

### ⌨️ ChatInput
**Archivo**: `ChatInput.tsx`

Input inteligente para envío de mensajes con validaciones.

**Características**:
- Auto-resize del textarea
- Límite de 1000 caracteres
- Contador de caracteres visual
- Sugerencias rápidas
- Soporte para Enter/Shift+Enter
- Estados de carga

**Props**:
```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}
```

### 📜 ChatHistory
**Archivo**: `ChatHistory.tsx`

Contenedor para el historial de mensajes con funcionalidades avanzadas.

**Características**:
- Auto-scroll inteligente
- Indicadores de conexión
- Mensaje de bienvenida
- Manejo de errores visual
- Información de contacto en footer

**Props**:
```typescript
interface ChatHistoryProps {
  messages: ChatMessageType[]
  isLoading?: boolean
  isTyping?: boolean
  error?: string | null
  isConnected?: boolean
  onFeedback?: (messageId: string, feedback: 'helpful' | 'not_helpful', comment?: string) => void
  onRetry?: () => void
  onReconnect?: () => void
  className?: string
  autoScroll?: boolean
}
```

### ⏳ ChatTypingIndicator
**Archivo**: `ChatTypingIndicator.tsx`

Indicador animado de escritura del asistente.

**Características**:
- Animación de puntos rebotando
- Mensaje personalizable
- Accesibilidad con aria-live
- Transiciones suaves

### 👍 ChatFeedback
**Archivo**: `ChatFeedback.tsx`

Sistema de retroalimentación para respuestas del asistente.

**Características**:
- Botones útil/no útil
- Modal para comentarios detallados
- Prevención de feedback duplicado
- Estados de confirmación

## 🔧 Integración

### Hook useChat
Los componentes se integran con el hook `useChat` que maneja:
- Estado de la conversación
- Conexión con API
- Gestión de sesiones
- Manejo de errores

```tsx
const {
  messages,
  isLoading,
  isTyping,
  error,
  isConnected,
  sendMessage,
  clearMessages,
  retryLastMessage,
  reconnect
} = useChat({
  channel: 'web',
  maxMessages: 50
})
```

### API Endpoints
- **POST /api/chat**: Envío de mensajes
- **GET /api/chat**: Información de sesión
- **POST /api/chat/feedback**: Envío de feedback

## 🎨 Estilos y Temas

### Colores del Sistema
- **Usuario**: Azul (`bg-blue-50`, `bg-blue-600`)
- **Asistente**: Verde (`bg-gray-50`, `bg-green-600`)
- **Sistema**: Amarillo (`bg-yellow-50`, `bg-yellow-600`)

### Indicadores de Confianza
- **Alta (≥80%)**: Verde (`bg-green-500`)
- **Media (≥60%)**: Amarillo (`bg-yellow-500`)
- **Baja (<60%)**: Rojo (`bg-red-500`)

## ♿ Accesibilidad

### Cumplimiento WCAG AA
- **Navegación por teclado**: Todos los elementos son focusables
- **Lectores de pantalla**: Etiquetas aria apropiadas
- **Contraste**: Cumple ratios mínimos
- **Roles semánticos**: article, dialog, status, etc.

### Características Específicas
- `aria-live` para actualizaciones dinámicas
- `aria-label` para elementos interactivos
- `role` para contexto semántico
- `tabindex` para orden de navegación

## 🚀 Performance

### Optimizaciones
- **Lazy loading**: Componentes se cargan bajo demanda
- **Memoización**: React.memo en componentes pesados
- **Debouncing**: En inputs de texto
- **Virtual scrolling**: Para historiales largos

### Métricas Objetivo
- **Tiempo de respuesta**: <3s para respuestas web
- **Escalación automática**: Confianza <70%
- **Disponibilidad**: 99.9% uptime

## 🧪 Testing

### Página de Prueba
Visita `/test-chat` para probar todas las funcionalidades:

```bash
# Iniciar servidor de desarrollo
npm run dev

# Navegar a página de prueba
http://localhost:3000/test-chat
```

### Casos de Prueba
1. **Funcionalidad básica**: Abrir/cerrar widget
2. **Envío de mensajes**: Validar respuestas IA
3. **Sistema de feedback**: Probar útil/no útil
4. **Escalación**: Verificar confianza <70%
5. **Accesibilidad**: Navegación por teclado
6. **Responsive**: Diferentes tamaños de pantalla

## 🔄 Próximos Pasos

### US-013: Sistema de Actualización Automática (34 SP)
- Sincronización automática de embeddings
- Cola de procesamiento para actualizaciones
- Métricas de sincronización en tiempo real

### US-013.1: Integración WhatsApp (34 SP)
- Webhook bidireccional con Evolution API
- Gestión de sesiones por número telefónico
- Dashboard de monitoreo WhatsApp

## 📞 Soporte

Para problemas o mejoras:
- **Email**: info@chia.gov.co
- **Teléfono**: (601) 123-4567
- **Horario**: Lunes a Viernes 8:00 AM - 5:00 PM

---

**Estado**: ✅ **COMPLETADO** - US-012: Interfaz de Usuario del Chatbot Web (55 SP)
**Fecha**: 2025-07-26
**Arquitecto**: AI Assistant - Especialista en IA Conversacional
