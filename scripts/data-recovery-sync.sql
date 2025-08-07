-- Data Recovery Script: Synchronize servicios table data to original tables
-- This script fixes the data consistency issues identified in validation testing
-- 
-- Issues addressed:
-- 1. Missing instructivo field in opas table (now added)
-- 2. OPA services not synchronized with instructions
-- 3. Data discrepancy between servicios (851) and original tables (830)

-- Step 1: Verify current data state
SELECT 
  'servicios' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN tipo_servicio = 'tramite' THEN 1 END) as tramites_count,
  COUNT(CASE WHEN tipo_servicio = 'opa' THEN 1 END) as opas_count,
  COUNT(CASE WHEN tipo_servicio = 'servicio' THEN 1 END) as servicios_count
FROM servicios
WHERE activo = true

UNION ALL

SELECT 
  'tramites' as table_name,
  COUNT(*) as total_count,
  0 as tramites_count,
  0 as opas_count,
  0 as servicios_count
FROM tramites
WHERE activo = true

UNION ALL

SELECT 
  'opas' as table_name,
  COUNT(*) as total_count,
  0 as tramites_count,
  0 as opas_count,
  0 as servicios_count
FROM opas
WHERE activo = true;

-- Step 2: Identify OPA services that need synchronization
SELECT 
  s.id as servicios_id,
  s.codigo,
  s.nombre,
  s.tipo_servicio,
  COALESCE(array_length(s.requisitos, 1), 0) as servicios_requisitos_count,
  COALESCE(array_length(s.instrucciones, 1), 0) as servicios_instrucciones_count,
  o.id as opas_id,
  COALESCE(array_length(o.requisitos, 1), 0) as opas_requisitos_count,
  COALESCE(array_length(o.instructivo, 1), 0) as opas_instructivo_count,
  CASE 
    WHEN o.id IS NULL THEN 'MISSING_OPA'
    WHEN COALESCE(array_length(s.instrucciones, 1), 0) != COALESCE(array_length(o.instructivo, 1), 0) THEN 'INSTRUCTIVO_MISMATCH'
    WHEN COALESCE(array_length(s.requisitos, 1), 0) != COALESCE(array_length(o.requisitos, 1), 0) THEN 'REQUISITOS_MISMATCH'
    ELSE 'OK'
  END as sync_status
FROM servicios s
LEFT JOIN opas o ON s.codigo = o.codigo_opa
WHERE s.tipo_servicio = 'opa' 
  AND s.activo = true
ORDER BY sync_status DESC, s.nombre;

-- Step 3: Synchronize OPA services with missing or incorrect data
-- Update existing OPA records with data from servicios table
UPDATE opas 
SET 
  nombre = s.nombre,
  descripcion = s.descripcion,
  requisitos = COALESCE(s.requisitos, ARRAY[]::text[]),
  instructivo = COALESCE(s.instrucciones, ARRAY[]::text[]), -- This is the critical fix!
  tiempo_respuesta = s.tiempo_respuesta,
  tiene_pago = s.requiere_pago,
  visualizacion_suit = COALESCE(s.url_suit, ''),
  visualizacion_gov = COALESCE(s.url_gov, ''),
  activo = s.activo,
  updated_at = NOW()
FROM servicios s
WHERE opas.codigo_opa = s.codigo
  AND s.tipo_servicio = 'opa'
  AND s.activo = true;

-- Step 4: Create missing OPA records for servicios that don't have corresponding opas
INSERT INTO opas (
  codigo_opa,
  nombre,
  descripcion,
  subdependencia_id,
  requisitos,
  instructivo,
  tiempo_respuesta,
  tiene_pago,
  visualizacion_suit,
  visualizacion_gov,
  activo,
  created_at,
  updated_at
)
SELECT 
  s.codigo,
  s.nombre,
  s.descripcion,
  s.subdependencia_id,
  COALESCE(s.requisitos, ARRAY[]::text[]),
  COALESCE(s.instrucciones, ARRAY[]::text[]), -- Critical: Map instrucciones to instructivo
  s.tiempo_respuesta,
  s.requiere_pago,
  COALESCE(s.url_suit, ''),
  COALESCE(s.url_gov, ''),
  s.activo,
  s.created_at,
  NOW()
FROM servicios s
LEFT JOIN opas o ON s.codigo = o.codigo_opa
WHERE s.tipo_servicio = 'opa'
  AND s.activo = true
  AND o.id IS NULL; -- Only insert if OPA doesn't exist

-- Step 5: Verify synchronization results
SELECT 
  'After Sync - OPA Services' as description,
  COUNT(*) as total_opas,
  COUNT(CASE WHEN instructivo IS NOT NULL AND array_length(instructivo, 1) > 0 THEN 1 END) as opas_with_instructions,
  COUNT(CASE WHEN requisitos IS NOT NULL AND array_length(requisitos, 1) > 0 THEN 1 END) as opas_with_requirements,
  AVG(COALESCE(array_length(instructivo, 1), 0)) as avg_instructions_count,
  AVG(COALESCE(array_length(requisitos, 1), 0)) as avg_requirements_count
FROM opas
WHERE activo = true;

-- Step 6: Specific verification for "Certificado de residencia" OPA
SELECT 
  'Certificado de residencia Verification' as description,
  s.codigo,
  s.nombre,
  s.tipo_servicio,
  COALESCE(array_length(s.requisitos, 1), 0) as servicios_requisitos,
  COALESCE(array_length(s.instrucciones, 1), 0) as servicios_instrucciones,
  o.codigo_opa,
  COALESCE(array_length(o.requisitos, 1), 0) as opas_requisitos,
  COALESCE(array_length(o.instructivo, 1), 0) as opas_instructivo,
  CASE 
    WHEN COALESCE(array_length(s.instrucciones, 1), 0) = COALESCE(array_length(o.instructivo, 1), 0) 
     AND COALESCE(array_length(s.requisitos, 1), 0) = COALESCE(array_length(o.requisitos, 1), 0)
    THEN 'SYNCHRONIZED' 
    ELSE 'MISMATCH' 
  END as sync_status
FROM servicios s
JOIN opas o ON s.codigo = o.codigo_opa
WHERE s.nombre ILIKE '%certificado de residencia%'
  AND s.tipo_servicio = 'opa'
  AND s.activo = true;

-- Step 7: Final data consistency check
SELECT 
  'Final Data Consistency Check' as description,
  (SELECT COUNT(*) FROM servicios WHERE tipo_servicio = 'opa' AND activo = true) as servicios_opas,
  (SELECT COUNT(*) FROM opas WHERE activo = true) as opas_table,
  CASE 
    WHEN (SELECT COUNT(*) FROM servicios WHERE tipo_servicio = 'opa' AND activo = true) = 
         (SELECT COUNT(*) FROM opas WHERE activo = true)
    THEN 'CONSISTENT'
    ELSE 'INCONSISTENT'
  END as consistency_status;
