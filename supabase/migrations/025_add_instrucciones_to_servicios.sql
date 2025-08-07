-- Migration: Add instrucciones column to servicios table
-- Description: Add array field to store instructions for each service
-- Author: System
-- Date: 2025-08-06
-- Fixes: Database schema error when updating services with instrucciones

BEGIN;

-- Add instrucciones column to servicios table
ALTER TABLE servicios 
ADD COLUMN IF NOT EXISTS instrucciones TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN servicios.instrucciones IS 'Array of instructions for completing the service';

-- Create index for better search performance on instrucciones
CREATE INDEX IF NOT EXISTS idx_servicios_instrucciones ON servicios USING gin(instrucciones);

-- Update existing services with sample instrucciones data based on tipo_servicio
-- This provides realistic sample data for testing and initial deployment

-- Sample instrucciones for tramites
UPDATE servicios SET instrucciones = ARRAY[
  'Diríjase a la oficina de atención al ciudadano',
  'Presente los documentos requeridos en ventanilla',
  'Realice el pago correspondiente si aplica',
  'Espere la verificación de documentos',
  'Reciba su certificado o comprobante de trámite'
] WHERE instrucciones IS NULL AND tipo_servicio = 'tramite' AND codigo LIKE '%001%';

UPDATE servicios SET instrucciones = ARRAY[
  'Ingrese al portal web municipal',
  'Complete el formulario en línea con sus datos',
  'Adjunte los documentos digitalizados requeridos',
  'Realice el pago en línea si es necesario',
  'Descargue el comprobante de radicación',
  'Espere notificación por correo electrónico'
] WHERE instrucciones IS NULL AND tipo_servicio = 'tramite' AND codigo LIKE '%002%';

-- Sample instrucciones for OPAs
UPDATE servicios SET instrucciones = ARRAY[
  'Acérquese al punto de atención ciudadana',
  'Solicite información sobre el servicio requerido',
  'Presente su documento de identidad',
  'Reciba orientación personalizada',
  'Complete el proceso según las indicaciones'
] WHERE instrucciones IS NULL AND tipo_servicio = 'opa';

-- Default instrucciones for remaining services
UPDATE servicios SET instrucciones = ARRAY[
  'Consulte los requisitos específicos del servicio',
  'Prepare la documentación necesaria',
  'Acérquese a la dependencia correspondiente',
  'Siga las instrucciones del funcionario',
  'Complete el proceso según indicaciones'
] WHERE instrucciones IS NULL;

-- Add validation constraint for data quality
ALTER TABLE servicios ADD CONSTRAINT check_instrucciones_not_empty 
  CHECK (instrucciones IS NULL OR array_length(instrucciones, 1) > 0);

COMMIT;
