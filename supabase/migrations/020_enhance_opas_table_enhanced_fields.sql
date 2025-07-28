-- Migration: Add enhanced fields to OPAs table
-- Description: Add descripcion and formulario fields to complete OPA information
-- Author: System
-- Date: 2025-01-25
-- Phase: 2 - Enhanced Fields

BEGIN;

-- Add enhanced fields to opas table
ALTER TABLE opas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE opas ADD COLUMN IF NOT EXISTS formulario TEXT;

-- Add comments for documentation
COMMENT ON COLUMN opas.descripcion IS 'Detailed description of the OPA service and its purpose';
COMMENT ON COLUMN opas.formulario IS 'Form description, instructions, or URL for the OPA';

-- Create full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_opas_search ON opas USING gin(
  to_tsvector('spanish', coalesce(nombre, '') || ' ' || coalesce(descripcion, ''))
);

-- Add sample descriptions for existing OPAs based on their codes
-- This provides realistic content for testing and demonstration

-- Update OPAs with sample descriptions based on common municipal services
UPDATE opas SET 
  descripcion = 'Servicio de atención ciudadana para la gestión de solicitudes y trámites municipales. Este servicio permite a los ciudadanos realizar consultas, presentar peticiones y obtener información sobre los diferentes servicios que ofrece la administración municipal.',
  formulario = 'Formulario único de solicitud disponible en ventanilla de atención al ciudadano. Debe ser diligenciado completamente y presentado con los documentos requeridos.'
WHERE descripcion IS NULL AND codigo_opa LIKE '%001%';

UPDATE opas SET 
  descripcion = 'Procedimiento administrativo para la obtención de certificaciones y documentos oficiales expedidos por la alcaldía municipal. Incluye certificados de residencia, paz y salvo, y otros documentos requeridos por los ciudadanos.',
  formulario = 'Formulario de solicitud de certificaciones disponible en línea y en formato físico. Requiere autenticación de identidad y pago de tasas correspondientes.'
WHERE descripcion IS NULL AND codigo_opa LIKE '%002%';

UPDATE opas SET 
  descripcion = 'Servicio de orientación y asesoría para ciudadanos que requieren información sobre trámites, procedimientos y servicios municipales. Incluye atención presencial, telefónica y virtual.',
  formulario = 'No requiere formulario específico. La atención se brinda directamente en los puntos de atención ciudadana habilitados por la administración municipal.'
WHERE descripcion IS NULL AND codigo_opa LIKE '%003%';

UPDATE opas SET 
  descripcion = 'Gestión de solicitudes especiales y casos particulares que requieren evaluación individual por parte de las dependencias competentes. Incluye permisos especiales, autorizaciones y conceptos técnicos.',
  formulario = 'Formulario especializado según el tipo de solicitud. Debe incluir documentación técnica y soporte legal correspondiente al caso específico.'
WHERE descripcion IS NULL AND codigo_opa LIKE '%004%';

-- For remaining OPAs without specific patterns, add general descriptions
UPDATE opas SET 
  descripcion = 'Servicio de atención ciudadana que forma parte de la oferta institucional de la alcaldía municipal. Orientado a brindar soluciones eficientes y oportunas a las necesidades de la comunidad.',
  formulario = 'Formulario de solicitud estándar disponible en los canales de atención ciudadana. Debe ser diligenciado según las instrucciones específicas del servicio.'
WHERE descripcion IS NULL;

-- Add validation constraints for data quality
ALTER TABLE opas ADD CONSTRAINT check_description_length 
  CHECK (descripcion IS NULL OR length(descripcion) >= 50);

ALTER TABLE opas ADD CONSTRAINT check_formulario_not_empty 
  CHECK (formulario IS NULL OR length(trim(formulario)) > 0);

-- Verify the migration results
SELECT 
  'Phase 2 Migration completed successfully' as status,
  COUNT(*) as total_opas,
  COUNT(CASE WHEN descripcion IS NOT NULL AND length(descripcion) >= 50 THEN 1 END) as opas_with_description,
  COUNT(CASE WHEN formulario IS NOT NULL THEN 1 END) as opas_with_form_info,
  ROUND(
    (COUNT(CASE WHEN descripcion IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 
    2
  ) as percentage_with_description,
  AVG(length(descripcion)) as avg_description_length
FROM opas;

COMMIT;
