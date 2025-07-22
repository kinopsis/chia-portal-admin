-- Migration: Add requisitos column to tramites table
-- Description: Add array field to store requirements for each trámite
-- Author: System
-- Date: 2025-01-22

-- Add requisitos column to tramites table
ALTER TABLE tramites 
ADD COLUMN IF NOT EXISTS requisitos TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN tramites.requisitos IS 'Array of requirements needed to complete the trámite';

-- Create index for better search performance on requisitos
CREATE INDEX IF NOT EXISTS idx_tramites_requisitos ON tramites USING gin(requisitos);

-- Update existing tramites with sample requisitos data
-- This provides realistic sample data for testing and initial deployment

UPDATE tramites SET requisitos = ARRAY[
  'Cédula de ciudadanía original y copia',
  'Formulario de solicitud debidamente diligenciado',
  'Comprobante de pago de derechos (si aplica)'
] WHERE requisitos IS NULL AND codigo_unico LIKE '%001%';

UPDATE tramites SET requisitos = ARRAY[
  'Documento de identidad vigente',
  'Certificado de antecedentes disciplinarios',
  'Formulario único de solicitud',
  'Comprobante de pago de tasas municipales',
  'Fotografías recientes tamaño cédula'
] WHERE requisitos IS NULL AND codigo_unico LIKE '%002%';

UPDATE tramites SET requisitos = ARRAY[
  'Cédula de ciudadanía o tarjeta de identidad',
  'Certificado de residencia (no mayor a 30 días)',
  'Formulario de solicitud diligenciado',
  'Comprobante de pago'
] WHERE requisitos IS NULL AND codigo_unico LIKE '%003%';

UPDATE tramites SET requisitos = ARRAY[
  'Documento de identidad original',
  'Poder autenticado (si aplica)',
  'Formulario de solicitud',
  'Documentos soporte según el tipo de trámite'
] WHERE requisitos IS NULL AND codigo_unico LIKE '%004%';

UPDATE tramites SET requisitos = ARRAY[
  'Cédula de ciudadanía vigente',
  'Certificado de libertad y tradición',
  'Formulario único diligenciado',
  'Comprobante de pago de derechos',
  'Planos y documentos técnicos (si aplica)'
] WHERE requisitos IS NULL AND codigo_unico LIKE '%005%';

-- For remaining tramites without specific patterns, add general requirements
UPDATE tramites SET requisitos = ARRAY[
  'Documento de identidad vigente',
  'Formulario de solicitud diligenciado',
  'Comprobante de pago (si aplica)',
  'Documentos adicionales según normativa'
] WHERE requisitos IS NULL;

-- Verify the update
-- This will show a count of tramites with requisitos
SELECT 
  COUNT(*) as total_tramites,
  COUNT(CASE WHEN requisitos IS NOT NULL AND array_length(requisitos, 1) > 0 THEN 1 END) as tramites_with_requisitos,
  ROUND(
    (COUNT(CASE WHEN requisitos IS NOT NULL AND array_length(requisitos, 1) > 0 THEN 1 END) * 100.0 / COUNT(*)), 
    2
  ) as percentage_with_requisitos
FROM tramites;

-- Add some sample government portal URLs for testing
-- Update a few tramites with sample SUIT and GOV.CO URLs

UPDATE tramites SET 
  visualizacion_suit = 'https://www.suit.gov.co/tramite/' || codigo_unico,
  visualizacion_gov = 'https://www.gov.co/tramites-y-servicios/' || codigo_unico
WHERE codigo_unico IN (
  SELECT codigo_unico FROM tramites 
  WHERE activo = true 
  LIMIT 5
);

-- Update some tramites with only SUIT URLs
UPDATE tramites SET 
  visualizacion_suit = 'https://www.suit.gov.co/tramite/' || codigo_unico
WHERE codigo_unico IN (
  SELECT codigo_unico FROM tramites 
  WHERE activo = true 
  AND visualizacion_suit IS NULL
  LIMIT 3
);

-- Update some tramites with only GOV.CO URLs  
UPDATE tramites SET 
  visualizacion_gov = 'https://www.gov.co/tramites-y-servicios/' || codigo_unico
WHERE codigo_unico IN (
  SELECT codigo_unico FROM tramites 
  WHERE activo = true 
  AND visualizacion_gov IS NULL
  LIMIT 3
);

-- Final verification query
SELECT 
  'Migration completed successfully' as status,
  COUNT(*) as total_tramites,
  COUNT(CASE WHEN requisitos IS NOT NULL THEN 1 END) as with_requisitos,
  COUNT(CASE WHEN visualizacion_suit IS NOT NULL AND visualizacion_suit != '' THEN 1 END) as with_suit_url,
  COUNT(CASE WHEN visualizacion_gov IS NOT NULL AND visualizacion_gov != '' THEN 1 END) as with_gov_url
FROM tramites;
