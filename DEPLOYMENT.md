# 🚀 Guía de Despliegue - Portal de Atención Ciudadana de Chía

Esta guía detalla el proceso de despliegue del Portal de Atención Ciudadana de Chía en diferentes entornos, con enfoque especial en Coolify.

## 📋 Prerrequisitos

### Servicios Externos Requeridos
- **Supabase**: Base de datos PostgreSQL con autenticación
- **OpenAI** (opcional): Para funcionalidades de IA/Chatbot
- **SMTP Server** (opcional): Para notificaciones por email

### Credenciales Necesarias
- URL y claves de Supabase
- API Key de OpenAI (si se habilita IA)
- Credenciales SMTP (si se habilitan notificaciones)

## 🐳 Despliegue con Docker

### Construcción Local
```bash
# Construir imagen
docker build -t chia-portal .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  chia-portal
```

### Docker Compose
```bash
# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
nano .env

# Ejecutar con Docker Compose
docker-compose up -d
```

## ☁️ Despliegue en Coolify

### 1. Preparación del Repositorio
1. Subir código a GitHub/GitLab
2. Asegurar que todos los archivos de configuración estén presentes:
   - `Dockerfile`
   - `docker-compose.yml`
   - `coolify.yml`
   - `.env.example`

### 2. Configuración en Coolify

#### Crear Nuevo Proyecto
1. Acceder a Coolify Dashboard
2. Crear nuevo proyecto: "chia-portal-admin"
3. Conectar repositorio Git
4. Seleccionar rama: `main` o `master`

#### Configurar Variables de Entorno

**Variables Obligatorias:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
APP_ENV=production
```

**Variables Opcionales:**
```env
# IA/Chatbot
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
ENABLE_AI_CHATBOT=true

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@chia.gov.co

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
ENABLE_ANALYTICS=true
```

#### Configurar Build
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Port**: `3000`
- **Health Check**: `/api/health`

### 3. Configuración de Dominio
1. Configurar dominio personalizado (ej: `portal.chia.gov.co`)
2. Habilitar SSL automático
3. Configurar redirección HTTPS

### 4. Monitoreo
- Health check automático en `/api/health`
- Logs disponibles en Coolify Dashboard
- Métricas de CPU y memoria

## 🔧 Configuración de Supabase

### Base de Datos
1. Crear proyecto en Supabase
2. Ejecutar migraciones SQL (si las hay)
3. Configurar Row Level Security (RLS)
4. Crear usuarios de prueba

### Autenticación
1. Configurar proveedores de auth (email/password)
2. Configurar URLs de redirección
3. Personalizar templates de email

### Storage (si se usa)
1. Crear buckets para archivos
2. Configurar políticas de acceso
3. Configurar CORS si es necesario

## 🧪 Verificación del Despliegue

### Health Check
```bash
curl https://your-domain.com/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "used": 150,
    "total": 512
  },
  "features": {
    "ai_chatbot": true,
    "notifications": true,
    "analytics": true
  }
}
```

### Funcionalidades Críticas
- [ ] Página principal carga correctamente
- [ ] Autenticación funciona
- [ ] Dashboard administrativo accesible
- [ ] API endpoints responden
- [ ] Base de datos conectada
- [ ] Chatbot IA funciona (si está habilitado)

## 🔒 Seguridad

### Variables de Entorno
- Nunca commitear archivos `.env` reales
- Usar secretos seguros en producción
- Rotar claves regularmente

### HTTPS
- Forzar HTTPS en producción
- Configurar headers de seguridad
- Usar certificados SSL válidos

### Base de Datos
- Habilitar RLS en todas las tablas
- Usar conexiones encriptadas
- Auditar permisos regularmente

## 📊 Monitoreo y Logs

### Logs de Aplicación
```bash
# Ver logs en Coolify
# O usar docker logs si es despliegue manual
docker logs chia-portal
```

### Métricas
- CPU y memoria del contenedor
- Tiempo de respuesta de endpoints
- Errores de aplicación
- Uso de base de datos

## 🔄 Actualizaciones

### Proceso de Actualización
1. Hacer push de cambios a repositorio
2. Coolify detecta cambios automáticamente
3. Inicia build y despliegue automático
4. Verificar health check post-despliegue

### Rollback
1. Acceder a Coolify Dashboard
2. Seleccionar versión anterior
3. Ejecutar rollback
4. Verificar funcionalidad

## 🆘 Troubleshooting

### Problemas Comunes

**Build Falla:**
- Verificar variables de entorno de build
- Revisar logs de construcción
- Verificar dependencias en package.json

**Aplicación no Inicia:**
- Verificar puerto 3000 disponible
- Revisar variables de entorno obligatorias
- Verificar conexión a Supabase

**Health Check Falla:**
- Verificar endpoint `/api/health`
- Revisar logs de aplicación
- Verificar recursos del contenedor

### Contacto de Soporte
- Email: soporte@chia.gov.co
- Documentación: Este archivo
- Issues: GitHub Issues del proyecto
