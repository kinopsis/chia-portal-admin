# Dockerfile para Portal de Atención Ciudadana de Chía
# Optimizado para producción con Next.js 15

# Usar imagen oficial de Node.js con Alpine para menor tamaño
FROM node:18-alpine AS base

# Instalar dependencias necesarias para Sharp (optimización de imágenes)
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias (skip scripts to avoid husky in production)
# Use legacy-peer-deps to handle peer dependency conflicts gracefully
RUN npm ci --only=production --ignore-scripts --legacy-peer-deps && npm cache clean --force

# Etapa de construcción
FROM base AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./

# Instalar todas las dependencias (incluyendo devDependencies, skip scripts)
# Use legacy-peer-deps to handle peer dependency conflicts gracefully
RUN npm ci --ignore-scripts --legacy-peer-deps

# Copiar código fuente
COPY src ./src
COPY public ./public

# Variables de entorno para build
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
ARG SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
ARG OPENAI_API_KEY=placeholder-openai-key
ARG NEXT_PUBLIC_ENABLE_AI_CHATBOT=false
ARG APP_ENV=production

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV NEXT_PUBLIC_ENABLE_AI_CHATBOT=$NEXT_PUBLIC_ENABLE_AI_CHATBOT
ENV APP_ENV=$APP_ENV
ENV NODE_ENV=production

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cambiar propietario de archivos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno de runtime
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Comando de inicio
CMD ["node", "server.js"]
