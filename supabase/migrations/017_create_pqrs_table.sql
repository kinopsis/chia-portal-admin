-- Migration: Create PQRS table for citizen requests system
-- Description: Peticiones, Quejas, Reclamos y Sugerencias management
-- Author: System
-- Date: 2024-01-20

-- Create PQRS table
CREATE TABLE IF NOT EXISTS pqrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('peticion', 'queja', 'reclamo', 'sugerencia')),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  dependencia_id UUID NOT NULL REFERENCES dependencias(id) ON DELETE RESTRICT,
  asunto TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto', 'cerrado')),
  numero_radicado VARCHAR(50) UNIQUE NOT NULL,
  respuesta TEXT,
  fecha_respuesta TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pqrs_numero_radicado ON pqrs(numero_radicado);
CREATE INDEX IF NOT EXISTS idx_pqrs_estado ON pqrs(estado);
CREATE INDEX IF NOT EXISTS idx_pqrs_tipo ON pqrs(tipo);
CREATE INDEX IF NOT EXISTS idx_pqrs_dependencia_id ON pqrs(dependencia_id);
CREATE INDEX IF NOT EXISTS idx_pqrs_created_at ON pqrs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pqrs_email ON pqrs(email);

-- Create full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_pqrs_search ON pqrs USING gin(
  to_tsvector('spanish', coalesce(asunto, '') || ' ' || coalesce(descripcion, '') || ' ' || coalesce(nombre, ''))
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_pqrs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pqrs_updated_at
  BEFORE UPDATE ON pqrs
  FOR EACH ROW
  EXECUTE FUNCTION update_pqrs_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE pqrs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create PQRS (public submission)
CREATE POLICY "Anyone can create PQRS" ON pqrs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own PQRS by email
CREATE POLICY "Users can view own PQRS" ON pqrs
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email' OR
    auth.jwt() ->> 'role' IN ('admin', 'funcionario')
  );

-- Policy: Only admins and funcionarios can update PQRS
CREATE POLICY "Admins and funcionarios can update PQRS" ON pqrs
  FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'funcionario'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'funcionario'));

-- Policy: Only admins can delete PQRS
CREATE POLICY "Only admins can delete PQRS" ON pqrs
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert sample data for testing
INSERT INTO pqrs (
  tipo, nombre, email, telefono, dependencia_id, asunto, descripcion, numero_radicado, estado
) VALUES 
(
  'peticion',
  'Juan Pérez',
  'juan.perez@email.com',
  '3001234567',
  (SELECT id FROM dependencias WHERE codigo = 'SEPLAN' LIMIT 1),
  'Solicitud de información sobre licencia de construcción',
  'Necesito información sobre los requisitos para obtener una licencia de construcción para una vivienda unifamiliar en el sector de Cajicá.',
  'PQRS-' || extract(epoch from now())::bigint || '-001',
  'pendiente'
),
(
  'queja',
  'María González',
  'maria.gonzalez@email.com',
  '3009876543',
  (SELECT id FROM dependencias WHERE codigo = 'SEHAC' LIMIT 1),
  'Demora en respuesta de impuesto predial',
  'He enviado múltiples solicitudes sobre la liquidación de mi impuesto predial y no he recibido respuesta en más de 30 días.',
  'PQRS-' || extract(epoch from now())::bigint || '-002',
  'en_proceso'
),
(
  'sugerencia',
  'Carlos Rodríguez',
  'carlos.rodriguez@email.com',
  NULL,
  (SELECT id FROM dependencias WHERE codigo = 'SEGOB' LIMIT 1),
  'Mejora en atención al ciudadano',
  'Sugiero implementar un sistema de turnos digitales para mejorar la atención en las oficinas municipales.',
  'PQRS-' || extract(epoch from now())::bigint || '-003',
  'pendiente'
);

-- Create function for PQRS statistics
CREATE OR REPLACE FUNCTION get_pqrs_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', (SELECT COUNT(*) FROM pqrs),
    'by_tipo', (
      SELECT json_object_agg(tipo, count)
      FROM (
        SELECT tipo, COUNT(*) as count
        FROM pqrs
        GROUP BY tipo
      ) t
    ),
    'by_estado', (
      SELECT json_object_agg(estado, count)
      FROM (
        SELECT estado, COUNT(*) as count
        FROM pqrs
        GROUP BY estado
      ) t
    ),
    'this_month', (
      SELECT COUNT(*)
      FROM pqrs
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'avg_response_time_days', (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (fecha_respuesta - created_at)) / 86400), 2)
      FROM pqrs
      WHERE fecha_respuesta IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON pqrs TO anon, authenticated;
GRANT UPDATE, DELETE ON pqrs TO authenticated;
GRANT EXECUTE ON FUNCTION get_pqrs_stats() TO anon, authenticated;

-- Add comments for documentation
COMMENT ON TABLE pqrs IS 'Tabla para gestión de PQRS (Peticiones, Quejas, Reclamos y Sugerencias) del sistema municipal';
COMMENT ON COLUMN pqrs.numero_radicado IS 'Número único de radicado para seguimiento del PQRS';
COMMENT ON COLUMN pqrs.tipo IS 'Tipo de PQRS: peticion, queja, reclamo, sugerencia';
COMMENT ON COLUMN pqrs.estado IS 'Estado actual: pendiente, en_proceso, resuelto, cerrado';
COMMENT ON FUNCTION get_pqrs_stats() IS 'Función para obtener estadísticas de PQRS para dashboards';
