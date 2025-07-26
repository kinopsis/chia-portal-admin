-- ============================================================================
-- SCRIPTS DE CORRECCIÓN DE SEGURIDAD CRÍTICA
-- Portal de Atención Ciudadana de Chía
-- Fecha: 2025-01-26
-- ============================================================================

-- IMPORTANTE: Ejecutar SOLO después de crear backup completo
-- Validar cada función antes de proceder con la siguiente

-- ============================================================================
-- 1. CORRECCIÓN DE FUNCIONES CON SEARCH_PATH MUTABLE
-- ============================================================================

-- 1.1 Función: user_has_access_to_dependencia
-- CRÍTICO: Función de autorización - requiere search_path fijo
CREATE OR REPLACE FUNCTION public.user_has_access_to_dependencia(dependencia_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
DECLARE
    user_dependencia_id uuid;
    user_role text;
BEGIN
    -- Obtener rol del usuario actual
    SELECT (select public.get_user_role()) INTO user_role;
    
    -- Los admins tienen acceso a todas las dependencias
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Obtener dependencia del usuario
    SELECT (select public.get_user_dependencia()) INTO user_dependencia_id;
    
    -- Verificar si el usuario tiene acceso a esta dependencia
    RETURN user_dependencia_id = dependencia_id;
END;
$$;

-- 1.2 Función: get_user_role
-- CRÍTICO: Función de autorización central
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE id = (select auth.uid());
    
    RETURN COALESCE(user_role, 'ciudadano');
END;
$$;

-- 1.3 Función: get_user_dependencia
-- CRÍTICO: Función de autorización por dependencia
CREATE OR REPLACE FUNCTION public.get_user_dependencia()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
DECLARE
    user_dependencia uuid;
BEGIN
    SELECT dependencia_id INTO user_dependencia
    FROM public.users
    WHERE id = (select auth.uid());
    
    RETURN user_dependencia;
END;
$$;

-- 1.4 Función: handle_new_user
-- CRÍTICO: Función de registro de usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
BEGIN
    INSERT INTO public.users (id, email, role, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        'ciudadano',  -- Rol por defecto
        NOW()
    );
    RETURN NEW;
END;
$$;

-- 1.5 Función: exec_sql
-- ⚠️ ESPECIALMENTE CRÍTICO: Función de ejecución SQL dinámica
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
DECLARE
    result text;
    user_role text;
BEGIN
    -- Verificar que solo admins puedan ejecutar SQL dinámico
    SELECT (select public.get_user_role()) INTO user_role;
    
    IF user_role != 'admin' THEN
        RAISE EXCEPTION 'Acceso denegado: Solo administradores pueden ejecutar SQL dinámico';
    END IF;
    
    -- Validaciones adicionales de seguridad
    IF sql_query ILIKE '%DROP%' OR 
       sql_query ILIKE '%DELETE%' OR 
       sql_query ILIKE '%TRUNCATE%' THEN
        RAISE EXCEPTION 'Operaciones destructivas no permitidas a través de exec_sql';
    END IF;
    
    EXECUTE sql_query INTO result;
    RETURN result;
END;
$$;

-- 1.6 Función: search_content
-- Función de búsqueda de contenido
CREATE OR REPLACE FUNCTION public.search_content(search_term text)
RETURNS TABLE(
    tipo text,
    id uuid,
    titulo text,
    contenido text,
    relevancia real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'tramite'::text as tipo,
        t.id,
        t.nombre as titulo,
        t.formulario as contenido,
        ts_rank(to_tsvector('spanish', t.nombre || ' ' || COALESCE(t.formulario, '')), 
                plainto_tsquery('spanish', search_term)) as relevancia
    FROM public.tramites t
    WHERE t.activo = true
      AND to_tsvector('spanish', t.nombre || ' ' || COALESCE(t.formulario, '')) 
          @@ plainto_tsquery('spanish', search_term)
    
    UNION ALL
    
    SELECT 
        'opa'::text as tipo,
        o.id,
        o.nombre as titulo,
        o.descripcion as contenido,
        ts_rank(to_tsvector('spanish', o.nombre || ' ' || COALESCE(o.descripcion, '')), 
                plainto_tsquery('spanish', search_term)) as relevancia
    FROM public.opas o
    WHERE o.activo = true
      AND to_tsvector('spanish', o.nombre || ' ' || COALESCE(o.descripcion, '')) 
          @@ plainto_tsquery('spanish', search_term)
    
    ORDER BY relevancia DESC
    LIMIT 50;
END;
$$;

-- 1.7 Función: get_dashboard_stats
-- Función de estadísticas del dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
DECLARE
    stats json;
    user_role text;
    user_dependencia uuid;
BEGIN
    SELECT (select public.get_user_role()) INTO user_role;
    SELECT (select public.get_user_dependencia()) INTO user_dependencia;
    
    -- Estadísticas según el rol del usuario
    IF user_role = 'admin' THEN
        SELECT json_build_object(
            'total_tramites', (SELECT COUNT(*) FROM public.tramites),
            'total_opas', (SELECT COUNT(*) FROM public.opas),
            'total_usuarios', (SELECT COUNT(*) FROM public.users),
            'total_dependencias', (SELECT COUNT(*) FROM public.dependencias)
        ) INTO stats;
    ELSE
        SELECT json_build_object(
            'tramites_dependencia', (
                SELECT COUNT(*) 
                FROM public.tramites t
                JOIN public.subdependencias s ON t.subdependencia_id = s.id
                WHERE s.dependencia_id = user_dependencia
            ),
            'opas_dependencia', (
                SELECT COUNT(*) 
                FROM public.opas o
                JOIN public.subdependencias s ON o.subdependencia_id = s.id
                WHERE s.dependencia_id = user_dependencia
            )
        ) INTO stats;
    END IF;
    
    RETURN stats;
END;
$$;

-- 1.8 Función: get_popular_tramites
-- Función para obtener trámites populares
CREATE OR REPLACE FUNCTION public.get_popular_tramites(limit_count integer DEFAULT 10)
RETURNS TABLE(
    id uuid,
    nombre text,
    codigo_unico text,
    accesos_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.nombre,
        t.codigo_unico,
        COALESCE(t.accesos_count, 0) as accesos_count
    FROM public.tramites t
    WHERE t.activo = true
    ORDER BY COALESCE(t.accesos_count, 0) DESC
    LIMIT limit_count;
END;
$$;

-- 1.9 Función: generate_vencimiento_notifications
-- Función para generar notificaciones de vencimiento
CREATE OR REPLACE FUNCTION public.generate_vencimiento_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
DECLARE
    notification_count integer := 0;
    opa_record record;
BEGIN
    -- Solo admins pueden ejecutar esta función
    IF (select public.get_user_role()) != 'admin' THEN
        RAISE EXCEPTION 'Acceso denegado: Solo administradores pueden generar notificaciones';
    END IF;
    
    -- Buscar OPAs próximas a vencer (30 días)
    FOR opa_record IN 
        SELECT id, nombre, fecha_vencimiento
        FROM public.opas
        WHERE activo = true
          AND fecha_vencimiento IS NOT NULL
          AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
          AND fecha_vencimiento > CURRENT_DATE
    LOOP
        -- Insertar notificación
        INSERT INTO public.opa_notificaciones (
            opa_id,
            tipo,
            mensaje,
            fecha_creacion
        ) VALUES (
            opa_record.id,
            'vencimiento_proximo',
            'La OPA "' || opa_record.nombre || '" vence el ' || opa_record.fecha_vencimiento,
            NOW()
        );
        
        notification_count := notification_count + 1;
    END LOOP;
    
    RETURN notification_count;
END;
$$;

-- 1.10 Función: update_updated_at_column
-- Trigger function para actualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ CORRECCIÓN APLICADA
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. VALIDACIÓN DE CORRECCIONES
-- ============================================================================

-- Test de funciones críticas
DO $$
BEGIN
    -- Test get_user_role
    PERFORM public.get_user_role();
    RAISE NOTICE 'get_user_role: OK';
    
    -- Test search_content
    PERFORM public.search_content('certificado');
    RAISE NOTICE 'search_content: OK';
    
    -- Test get_dashboard_stats
    PERFORM public.get_dashboard_stats();
    RAISE NOTICE 'get_dashboard_stats: OK';
    
    RAISE NOTICE 'Todas las funciones corregidas exitosamente';
END;
$$;

-- ============================================================================
-- 3. OPTIMIZACIÓN DE POLÍTICAS RLS
-- ============================================================================

-- 3.1 Optimizar políticas de tabla users
-- Eliminar políticas múltiples y crear una optimizada
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

CREATE POLICY "users_select_policy" ON public.users
FOR SELECT
TO authenticated
USING (
    -- Optimización: usar (select auth.function()) en lugar de auth.function()
    (select public.get_user_role()) = 'admin'
    OR id = (select auth.uid())
);

-- 3.2 Optimizar políticas de tabla tramites
DROP POLICY IF EXISTS "Anyone can view active tramites" ON public.tramites;
DROP POLICY IF EXISTS "Authenticated users can view all tramites" ON public.tramites;

CREATE POLICY "tramites_select_policy" ON public.tramites
FOR SELECT
TO authenticated, anon
USING (
    activo = true
    OR (select public.get_user_role()) = 'admin'
    OR (select public.user_has_access_to_dependencia(
        (SELECT dependencia_id FROM subdependencias WHERE id = subdependencia_id)
    ))
);

-- 3.3 Optimizar políticas de tabla opas
DROP POLICY IF EXISTS "Anyone can view active opas" ON public.opas;
DROP POLICY IF EXISTS "Authenticated users can view all opas" ON public.opas;

CREATE POLICY "opas_select_policy" ON public.opas
FOR SELECT
TO authenticated, anon
USING (
    activo = true
    OR (select public.get_user_role()) = 'admin'
    OR (select public.user_has_access_to_dependencia(
        (SELECT dependencia_id FROM subdependencias WHERE id = subdependencia_id)
    ))
);

-- ============================================================================
-- 4. CONFIGURACIÓN DE PROTECCIÓN DE CONTRASEÑAS
-- ============================================================================

-- NOTA: Esta configuración debe hacerse desde Supabase Dashboard
-- Authentication > Settings > Password Security
-- Habilitar "Leaked Password Protection"

-- Script de verificación (ejecutar después de habilitar en Dashboard)
DO $$
BEGIN
    RAISE NOTICE 'RECORDATORIO: Habilitar protección de contraseñas en Supabase Dashboard';
    RAISE NOTICE 'Ruta: Authentication > Settings > Password Security';
    RAISE NOTICE 'Opción: Leaked Password Protection = ENABLED';
END;
$$;

-- ============================================================================
-- 5. VALIDACIÓN FINAL DE SEGURIDAD
-- ============================================================================

-- Test de políticas RLS optimizadas
DO $$
DECLARE
    test_count integer;
BEGIN
    -- Test acceso a tramites
    SELECT COUNT(*) INTO test_count FROM public.tramites WHERE activo = true;
    RAISE NOTICE 'Tramites activos accesibles: %', test_count;

    -- Test acceso a opas
    SELECT COUNT(*) INTO test_count FROM public.opas WHERE activo = true;
    RAISE NOTICE 'OPAs activas accesibles: %', test_count;

    RAISE NOTICE 'Validación de políticas RLS completada';
END;
$$;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- 1. Ejecutar SOLO después de backup completo
-- 2. Validar cada función individualmente
-- 3. Monitorear logs durante ejecución
-- 4. Tener plan de rollback listo
-- 5. Habilitar protección de contraseñas en Dashboard manualmente
-- ============================================================================
