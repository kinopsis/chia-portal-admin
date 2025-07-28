-- Migration: Add critical fields to OPAs table
-- Description: Enhance OPAs table with requisitos, tiempo_respuesta, and tiene_pago fields
-- Author: System
-- Date: 2025-01-25
-- Phase: 1 - Critical Fields

BEGIN;

-- Add critical fields to opas table
ALTER TABLE opas ADD COLUMN IF NOT EXISTS requisitos TEXT[];
ALTER TABLE opas ADD COLUMN IF NOT EXISTS tiempo_respuesta VARCHAR(100);
ALTER TABLE opas ADD COLUMN IF NOT EXISTS tiene_pago BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN opas.requisitos IS 'Array of requirements needed to complete the OPA';
COMMENT ON COLUMN opas.tiempo_respuesta IS 'Processing timeframe for the OPA (e.g., "5 días hábiles", "1 semana")';
COMMENT ON COLUMN opas.tiene_pago IS 'Whether payment is required for the OPA';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opas_requisitos ON opas USING gin(requisitos);
CREATE INDEX IF NOT EXISTS idx_opas_tiene_pago ON opas(tiene_pago);
CREATE INDEX IF NOT EXISTS idx_opas_tiempo_respuesta ON opas(tiempo_respuesta);

-- Update existing OPAs with realistic sample data
-- This provides consistent data structure with tramites

-- Sample data for different types of OPAs
UPDATE opas SET 
  requisitos = ARRAY[
    'Documento de identidad vigente',
    'Formulario de solicitud diligenciado',
    'Comprobante de pago (si aplica)'
  ],
  tiempo_respuesta = '5 días hábiles',
  tiene_pago = false
WHERE requisitos IS NULL AND codigo_opa LIKE '%001%';

UPDATE opas SET 
  requisitos = ARRAY[
    'Cédula de ciudadanía original y copia',
    'Certificado de antecedentes disciplinarios',
    'Formulario único de solicitud',
    'Comprobante de pago de tasas municipales'
  ],
  tiempo_respuesta = '3 días hábiles',
  tiene_pago = true
WHERE requisitos IS NULL AND codigo_opa LIKE '%002%';

UPDATE opas SET 
  requisitos = ARRAY[
    'Documento de identidad',
    'Certificado de residencia (no mayor a 30 días)',
    'Formulario de solicitud',
    'Documentos soporte específicos'
  ],
  tiempo_respuesta = '1 semana',
  tiene_pago = false
WHERE requisitos IS NULL AND codigo_opa LIKE '%003%';

UPDATE opas SET 
  requisitos = ARRAY[
    'Cédula de ciudadanía vigente',
    'Poder autenticado (si aplica)',
    'Formulario de solicitud completo',
    'Documentos técnicos requeridos'
  ],
  tiempo_respuesta = '2 semanas',
  tiene_pago = true
WHERE requisitos IS NULL AND codigo_opa LIKE '%004%';

-- For remaining OPAs without specific patterns, add general requirements
UPDATE opas SET 
  requisitos = ARRAY[
    'Documento de identidad vigente',
    'Formulario de solicitud diligenciado',
    'Documentos adicionales según normativa'
  ],
  tiempo_respuesta = '5 días hábiles',
  tiene_pago = false
WHERE requisitos IS NULL;

-- Add business validation constraints
ALTER TABLE opas ADD CONSTRAINT check_active_opas_requirements 
  CHECK (NOT activo OR (requisitos IS NOT NULL AND array_length(requisitos, 1) > 0));

ALTER TABLE opas ADD CONSTRAINT check_active_opas_response_time 
  CHECK (NOT activo OR tiempo_respuesta IS NOT NULL);

-- Verify the migration
SELECT 
  'Phase 1 Migration completed successfully' as status,
  COUNT(*) as total_opas,
  COUNT(CASE WHEN requisitos IS NOT NULL AND array_length(requisitos, 1) > 0 THEN 1 END) as opas_with_requisitos,
  COUNT(CASE WHEN tiempo_respuesta IS NOT NULL THEN 1 END) as opas_with_response_time,
  COUNT(CASE WHEN tiene_pago IS NOT NULL THEN 1 END) as opas_with_payment_info,
  ROUND(
    (COUNT(CASE WHEN requisitos IS NOT NULL AND array_length(requisitos, 1) > 0 THEN 1 END) * 100.0 / COUNT(*)), 
    2
  ) as percentage_with_requisitos
FROM opas;

COMMIT;
