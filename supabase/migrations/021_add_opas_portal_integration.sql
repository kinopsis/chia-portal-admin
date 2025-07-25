-- Migration: Add government portal integration to OPAs
-- Description: Add visualizacion_suit and visualizacion_gov fields for portal integration
-- Author: System
-- Date: 2025-01-25
-- Phase: 3 - Portal Integration

BEGIN;

-- Add portal integration fields to opas table
ALTER TABLE opas ADD COLUMN IF NOT EXISTS visualizacion_suit VARCHAR(500);
ALTER TABLE opas ADD COLUMN IF NOT EXISTS visualizacion_gov VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN opas.visualizacion_suit IS 'URL for SUIT government portal integration';
COMMENT ON COLUMN opas.visualizacion_gov IS 'URL for GOV.CO government portal integration';

-- Add URL validation constraints
ALTER TABLE opas ADD CONSTRAINT check_suit_url 
  CHECK (visualizacion_suit IS NULL OR visualizacion_suit ~* '^https?://.*');

ALTER TABLE opas ADD CONSTRAINT check_gov_url 
  CHECK (visualizacion_gov IS NULL OR visualizacion_gov ~* '^https?://.*');

-- Create indexes for portal URL fields
CREATE INDEX IF NOT EXISTS idx_opas_suit_url ON opas(visualizacion_suit) 
  WHERE visualizacion_suit IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_opas_gov_url ON opas(visualizacion_gov) 
  WHERE visualizacion_gov IS NOT NULL;

-- Add sample portal URLs for demonstration (these would be real URLs in production)
-- SUIT Portal URLs (Sistema Único de Información de Trámites)
UPDATE opas SET 
  visualizacion_suit = 'https://suit.gov.co/portal/page/portal/suit/tramites/municipio_chia/' || codigo_opa,
  visualizacion_gov = 'https://www.gov.co/ficha-tramites-y-servicios/' || codigo_opa
WHERE codigo_opa LIKE '%001%' OR codigo_opa LIKE '%002%';

-- For high-priority OPAs, add both portal integrations
UPDATE opas SET 
  visualizacion_suit = 'https://suit.gov.co/portal/page/portal/suit/servicios/municipio_chia/' || codigo_opa,
  visualizacion_gov = 'https://www.gov.co/ficha-tramites-y-servicios/chia/' || codigo_opa
WHERE tiene_pago = true AND activo = true;

-- Add GOV.CO integration for remaining active OPAs
UPDATE opas SET 
  visualizacion_gov = 'https://www.gov.co/ficha-tramites-y-servicios/chia/' || codigo_opa
WHERE activo = true AND visualizacion_gov IS NULL;

-- Create a view for OPAs with complete information (for reporting and analytics)
CREATE OR REPLACE VIEW opas_complete AS
SELECT 
  o.*,
  s.nombre as subdependencia_nombre,
  s.codigo as subdependencia_codigo,
  d.nombre as dependencia_nombre,
  d.codigo as dependencia_codigo,
  CASE 
    WHEN o.requisitos IS NOT NULL AND array_length(o.requisitos, 1) > 0 THEN true
    ELSE false
  END as has_requisitos,
  CASE 
    WHEN o.tiempo_respuesta IS NOT NULL THEN true
    ELSE false
  END as has_response_time,
  CASE 
    WHEN o.descripcion IS NOT NULL AND length(o.descripcion) >= 50 THEN true
    ELSE false
  END as has_description,
  CASE 
    WHEN o.visualizacion_suit IS NOT NULL OR o.visualizacion_gov IS NOT NULL THEN true
    ELSE false
  END as has_portal_integration,
  CASE 
    WHEN o.requisitos IS NOT NULL AND array_length(o.requisitos, 1) > 0
         AND o.tiempo_respuesta IS NOT NULL
         AND o.descripcion IS NOT NULL AND length(o.descripcion) >= 50
         AND o.tiene_pago IS NOT NULL
    THEN true
    ELSE false
  END as is_complete
FROM opas o
LEFT JOIN subdependencias s ON o.subdependencia_id = s.id
LEFT JOIN dependencias d ON s.dependencia_id = d.id;

-- Add comment to the view
COMMENT ON VIEW opas_complete IS 'Complete view of OPAs with all related information and completeness indicators';

-- Create a function to validate OPA completeness
CREATE OR REPLACE FUNCTION validate_opa_completeness(opa_id UUID)
RETURNS TABLE(
  field_name TEXT,
  is_complete BOOLEAN,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'requisitos'::TEXT,
    (o.requisitos IS NOT NULL AND array_length(o.requisitos, 1) > 0),
    CASE 
      WHEN o.requisitos IS NOT NULL AND array_length(o.requisitos, 1) > 0 
      THEN 'Requisitos definidos correctamente'
      ELSE 'Faltan requisitos para el OPA'
    END
  FROM opas o WHERE o.id = opa_id
  
  UNION ALL
  
  SELECT 
    'tiempo_respuesta'::TEXT,
    (o.tiempo_respuesta IS NOT NULL),
    CASE 
      WHEN o.tiempo_respuesta IS NOT NULL 
      THEN 'Tiempo de respuesta definido'
      ELSE 'Falta tiempo de respuesta'
    END
  FROM opas o WHERE o.id = opa_id
  
  UNION ALL
  
  SELECT 
    'descripcion'::TEXT,
    (o.descripcion IS NOT NULL AND length(o.descripcion) >= 50),
    CASE 
      WHEN o.descripcion IS NOT NULL AND length(o.descripcion) >= 50 
      THEN 'Descripción completa'
      ELSE 'Descripción insuficiente (mínimo 50 caracteres)'
    END
  FROM opas o WHERE o.id = opa_id
  
  UNION ALL
  
  SELECT 
    'portal_integration'::TEXT,
    (o.visualizacion_suit IS NOT NULL OR o.visualizacion_gov IS NOT NULL),
    CASE 
      WHEN o.visualizacion_suit IS NOT NULL OR o.visualizacion_gov IS NOT NULL 
      THEN 'Integración con portales configurada'
      ELSE 'Sin integración con portales gubernamentales'
    END
  FROM opas o WHERE o.id = opa_id;
END;
$$ LANGUAGE plpgsql;

-- Verify the migration results
SELECT 
  'Phase 3 Migration completed successfully' as status,
  COUNT(*) as total_opas,
  COUNT(CASE WHEN visualizacion_suit IS NOT NULL THEN 1 END) as opas_with_suit,
  COUNT(CASE WHEN visualizacion_gov IS NOT NULL THEN 1 END) as opas_with_gov,
  COUNT(CASE WHEN visualizacion_suit IS NOT NULL OR visualizacion_gov IS NOT NULL THEN 1 END) as opas_with_portal_integration,
  ROUND(
    (COUNT(CASE WHEN visualizacion_suit IS NOT NULL OR visualizacion_gov IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 
    2
  ) as percentage_with_integration
FROM opas;

-- Show completeness summary
SELECT 
  'OPA Completeness Summary' as summary,
  COUNT(*) as total_opas,
  COUNT(CASE WHEN is_complete THEN 1 END) as complete_opas,
  ROUND((COUNT(CASE WHEN is_complete THEN 1 END) * 100.0 / COUNT(*)), 2) as completeness_percentage
FROM opas_complete;

COMMIT;
