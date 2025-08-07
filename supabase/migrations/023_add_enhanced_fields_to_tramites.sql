-- Migration: Add enhanced fields to tramites table
-- Description: Add instructivo, modalidad, categoria, and observaciones fields
-- Author: System
-- Date: 2025-08-05
-- Migration: 023_add_enhanced_fields_to_tramites.sql

BEGIN;

-- Add the four new fields to tramites table
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS instructivo TEXT[];
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS modalidad VARCHAR(20) NOT NULL DEFAULT 'presencial';
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Add CHECK constraint for modalidad
ALTER TABLE tramites ADD CONSTRAINT check_tramites_modalidad 
  CHECK (modalidad IN ('virtual', 'presencial', 'mixto'));

-- Add comments for documentation
COMMENT ON COLUMN tramites.instructivo IS 'Array of step-by-step instructions for citizens on how to complete the trámite process';
COMMENT ON COLUMN tramites.modalidad IS 'Processing mode: virtual, presencial, or mixto';
COMMENT ON COLUMN tramites.categoria IS 'Thematic category grouping (e.g., impuestos, licencias, informativo, salud, movilidad, ambiental)';
COMMENT ON COLUMN tramites.observaciones IS 'Additional observations or information about actions/requirements not covered by standard process';

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_tramites_instructivo ON tramites USING gin(instructivo);
CREATE INDEX IF NOT EXISTS idx_tramites_modalidad ON tramites(modalidad);
CREATE INDEX IF NOT EXISTS idx_tramites_categoria ON tramites(categoria);
CREATE INDEX IF NOT EXISTS idx_tramites_observaciones ON tramites USING gin(to_tsvector('spanish', coalesce(observaciones, '')));

-- Update existing tramites with sample data based on patterns

-- Sample instructivo data for different types of tramites
UPDATE tramites SET instructivo = ARRAY[
  'Diríjase a la oficina de atención al ciudadano',
  'Presente los documentos requeridos en ventanilla',
  'Realice el pago correspondiente si aplica',
  'Espere la verificación de documentos',
  'Reciba su certificado o comprobante de trámite'
] WHERE instructivo IS NULL AND codigo_unico LIKE '%001%';

UPDATE tramites SET instructivo = ARRAY[
  'Ingrese al portal web municipal',
  'Complete el formulario en línea con sus datos',
  'Adjunte los documentos digitalizados requeridos',
  'Realice el pago en línea si es necesario',
  'Descargue el comprobante de radicación',
  'Espere notificación por correo electrónico'
] WHERE instructivo IS NULL AND codigo_unico LIKE '%002%';

UPDATE tramites SET instructivo = ARRAY[
  'Solicite cita previa a través del portal web',
  'Prepare todos los documentos requeridos',
  'Asista puntualmente a su cita programada',
  'Presente documentos y complete formularios',
  'Realice el pago en caja si es requerido',
  'Reciba información sobre tiempos de respuesta'
] WHERE instructivo IS NULL AND codigo_unico LIKE '%003%';

-- Default instructivo for remaining tramites
UPDATE tramites SET instructivo = ARRAY[
  'Consulte los requisitos específicos del trámite',
  'Prepare la documentación necesaria',
  'Acérquese a la dependencia correspondiente',
  'Siga las instrucciones del funcionario',
  'Complete el proceso según indicaciones'
] WHERE instructivo IS NULL;

-- Set modalidad based on existing patterns
UPDATE tramites SET modalidad = 'virtual' 
WHERE codigo_unico LIKE '%002%' OR nombre ILIKE '%virtual%' OR nombre ILIKE '%línea%';

UPDATE tramites SET modalidad = 'mixto' 
WHERE codigo_unico LIKE '%003%' OR nombre ILIKE '%cita%' OR formulario ILIKE '%portal%';

-- Default modalidad is already set to 'presencial'

-- Set categoria based on tramite names and patterns
UPDATE tramites SET categoria = 'impuestos' 
WHERE nombre ILIKE '%impuesto%' OR nombre ILIKE '%predial%' OR nombre ILIKE '%tasa%';

UPDATE tramites SET categoria = 'licencias' 
WHERE nombre ILIKE '%licencia%' OR nombre ILIKE '%permiso%' OR nombre ILIKE '%construcción%';

UPDATE tramites SET categoria = 'informativo' 
WHERE nombre ILIKE '%certificado%' OR nombre ILIKE '%constancia%' OR nombre ILIKE '%información%';

UPDATE tramites SET categoria = 'salud' 
WHERE nombre ILIKE '%salud%' OR nombre ILIKE '%sanitario%' OR nombre ILIKE '%médico%';

UPDATE tramites SET categoria = 'movilidad' 
WHERE nombre ILIKE '%tránsito%' OR nombre ILIKE '%transporte%' OR nombre ILIKE '%vehículo%';

UPDATE tramites SET categoria = 'ambiental' 
WHERE nombre ILIKE '%ambiental%' OR nombre ILIKE '%residuos%' OR nombre ILIKE '%agua%';

-- Default categoria for uncategorized tramites
UPDATE tramites SET categoria = 'general' WHERE categoria IS NULL;

-- Add sample observaciones for specific cases
UPDATE tramites SET observaciones = 'Este trámite requiere verificación adicional por parte del área técnica. Los tiempos pueden extenderse en casos complejos.'
WHERE codigo_unico LIKE '%001%' AND observaciones IS NULL;

UPDATE tramites SET observaciones = 'Disponible 24/7 a través del portal web. Para soporte técnico contactar la mesa de ayuda.'
WHERE modalidad = 'virtual' AND observaciones IS NULL;

UPDATE tramites SET observaciones = 'Se recomienda agendar cita previa para evitar tiempos de espera. Documentos deben estar vigentes.'
WHERE modalidad = 'presencial' AND observaciones IS NULL;

-- Add business validation constraints
ALTER TABLE tramites ADD CONSTRAINT check_active_tramites_instructivo 
  CHECK (NOT activo OR (instructivo IS NOT NULL AND array_length(instructivo, 1) > 0));

-- Verify the migration
SELECT 
  'Migration 023 completed successfully' as status,
  COUNT(*) as total_tramites,
  COUNT(CASE WHEN instructivo IS NOT NULL AND array_length(instructivo, 1) > 0 THEN 1 END) as with_instructivo,
  COUNT(CASE WHEN modalidad IS NOT NULL THEN 1 END) as with_modalidad,
  COUNT(CASE WHEN categoria IS NOT NULL THEN 1 END) as with_categoria,
  COUNT(CASE WHEN observaciones IS NOT NULL THEN 1 END) as with_observaciones,
  COUNT(DISTINCT modalidad) as unique_modalidades,
  COUNT(DISTINCT categoria) as unique_categorias
FROM tramites;

-- Show distribution by modalidad
SELECT modalidad, COUNT(*) as count 
FROM tramites 
GROUP BY modalidad 
ORDER BY count DESC;

-- Show distribution by categoria
SELECT categoria, COUNT(*) as count 
FROM tramites 
GROUP BY categoria 
ORDER BY count DESC;

COMMIT;
