-- Migration: Add descripcion field to tramites table
-- Description: Add descripcion field to provide specific descriptive content for each tramite
-- Author: System
-- Date: 2025-08-05
-- Migration: 024_add_descripcion_to_tramites.sql

BEGIN;

-- Add descripcion field to tramites table
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Add comment for documentation
COMMENT ON COLUMN tramites.descripcion IS 'Specific descriptive content for the tramite, different from formulario field';

-- Create index for better search performance on descripcion
CREATE INDEX IF NOT EXISTS idx_tramites_descripcion ON tramites USING gin(to_tsvector('spanish', coalesce(descripcion, '')));

-- Populate descripcion field with relevant and specific content for each tramite
-- This content should be different and more specific than the formulario field

-- Update tramites with specific descriptions based on their codigo_unico patterns
UPDATE tramites SET descripcion = 
  'Documento oficial que certifica la residencia actual del ciudadano en el municipio. Requerido para múltiples trámites administrativos y como soporte para acceder a servicios públicos locales.'
WHERE codigo_unico LIKE '%001%' AND descripcion IS NULL;

UPDATE tramites SET descripcion = 
  'Certificación que acredita la ausencia de antecedentes disciplinarios del solicitante. Documento esencial para procesos de contratación pública, vinculación laboral y trámites legales.'
WHERE codigo_unico LIKE '%002%' AND descripcion IS NULL;

UPDATE tramites SET descripcion = 
  'Proceso de registro y actualización de información personal en el sistema municipal. Permite mantener actualizados los datos del ciudadano para una mejor prestación de servicios.'
WHERE codigo_unico LIKE '%003%' AND descripcion IS NULL;

UPDATE tramites SET descripcion = 
  'Trámite para la obtención de permisos especiales requeridos para actividades específicas. Incluye evaluación de requisitos y emisión de autorización correspondiente.'
WHERE codigo_unico LIKE '%004%' AND descripcion IS NULL;

UPDATE tramites SET descripcion = 
  'Proceso de solicitud y gestión de licencias municipales para diferentes actividades comerciales, industriales o de servicios. Incluye evaluación técnica y jurídica.'
WHERE codigo_unico LIKE '%005%' AND descripcion IS NULL;

-- Update tramites related to construction and urban planning
UPDATE tramites SET descripcion = 
  'Trámite urbanístico para la modificación de cotas y delimitación de áreas en predios urbanos. Requiere evaluación técnica y cumplimiento de normativa de planeación municipal.'
WHERE nombre ILIKE '%cota%' OR nombre ILIKE '%área%' AND descripcion IS NULL;

-- Update tramites related to certificates
UPDATE tramites SET descripcion = 
  'Emisión de certificación oficial que valida información específica del ciudadano o entidad. Documento con validez legal para trámites administrativos y procesos oficiales.'
WHERE nombre ILIKE '%certificad%' AND descripcion IS NULL;

-- Update tramites related to licenses
UPDATE tramites SET descripcion = 
  'Autorización municipal para el desarrollo de actividades específicas. Incluye evaluación de requisitos técnicos, jurídicos y de cumplimiento normativo según la actividad solicitada.'
WHERE nombre ILIKE '%licencia%' AND descripcion IS NULL;

-- Update tramites related to permits
UPDATE tramites SET descripcion = 
  'Permiso especial otorgado por la administración municipal para actividades que requieren autorización previa. Incluye evaluación de impacto y cumplimiento de requisitos específicos.'
WHERE nombre ILIKE '%permiso%' AND descripcion IS NULL;

-- Update tramites related to registration
UPDATE tramites SET descripcion = 
  'Proceso de inscripción oficial en registros municipales. Permite el reconocimiento formal de derechos, obligaciones o situaciones específicas ante la administración local.'
WHERE nombre ILIKE '%registro%' OR nombre ILIKE '%inscripción%' AND descripcion IS NULL;

-- For remaining tramites without specific patterns, add contextual descriptions
UPDATE tramites SET descripcion = 
  CASE 
    WHEN modalidad = 'virtual' THEN 
      'Trámite completamente digital que permite al ciudadano realizar su solicitud de manera remota. Optimiza tiempos y facilita el acceso a los servicios municipales desde cualquier ubicación.'
    WHEN modalidad = 'presencial' THEN 
      'Trámite que requiere presencia física del solicitante en las oficinas municipales. Incluye atención personalizada y verificación directa de documentos y requisitos.'
    WHEN modalidad = 'mixto' THEN 
      'Trámite que combina gestión digital y presencial según las necesidades del proceso. Ofrece flexibilidad al ciudadano manteniendo la calidad en la prestación del servicio.'
    ELSE 
      'Servicio administrativo municipal orientado a satisfacer necesidades específicas de los ciudadanos. Incluye evaluación de requisitos y emisión de respuesta oficial según normativa vigente.'
  END
WHERE descripcion IS NULL;

-- Add validation constraint for data quality
ALTER TABLE tramites ADD CONSTRAINT check_descripcion_length 
  CHECK (descripcion IS NULL OR length(descripcion) >= 50);

-- Verify the migration results
SELECT 
  'Migration 024 completed successfully' as status,
  COUNT(*) as total_tramites,
  COUNT(CASE WHEN descripcion IS NOT NULL AND length(descripcion) >= 50 THEN 1 END) as tramites_with_description,
  ROUND(
    (COUNT(CASE WHEN descripcion IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 
    2
  ) as percentage_with_description,
  AVG(length(descripcion)) as avg_description_length,
  COUNT(DISTINCT modalidad) as unique_modalidades
FROM tramites;

COMMIT;
