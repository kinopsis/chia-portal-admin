'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Badge, Spinner } from '@/components'

interface ConnectionTestResult {
  success: boolean
  message?: string
  error?: string
  timestamp?: string
  results?: Record<string, any>
  summary?: {
    totalTables: number
    successfulQueries: number
    failedQueries: number
  }
}

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runConnectionTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test-connection')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to run connection test',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Run test automatically on page load
    runConnectionTest()
  }, [])

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba de Conexión Supabase
          </h1>
          <p className="text-gray-600">
            Verifica la conexión con la base de datos y las tablas principales del sistema.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={runConnectionTest}
            isLoading={isLoading}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Probando Conexión...' : 'Probar Conexión'}
          </Button>
        </div>

        {testResult && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Resultado de la Prueba</h2>
              <Badge variant={testResult.success ? 'success' : 'error'}>
                {testResult.success ? 'Exitoso' : 'Error'}
              </Badge>
            </div>

            {testResult.message && (
              <p className="text-gray-700 mb-4">{testResult.message}</p>
            )}

            {testResult.error && (
              <p className="text-red-600 mb-4">{testResult.error}</p>
            )}

            {testResult.timestamp && (
              <p className="text-sm text-gray-500 mb-4">
                Ejecutado: {new Date(testResult.timestamp).toLocaleString('es-CO')}
              </p>
            )}

            {testResult.summary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {testResult.summary.totalTables}
                  </div>
                  <div className="text-sm text-gray-600">Total Tablas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {testResult.summary.successfulQueries}
                  </div>
                  <div className="text-sm text-gray-600">Consultas Exitosas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {testResult.summary.failedQueries}
                  </div>
                  <div className="text-sm text-gray-600">Consultas Fallidas</div>
                </div>
              </div>
            )}

            {testResult.results && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Detalles por Tabla</h3>
                <div className="space-y-4">
                  {Object.entries(testResult.results).map(([tableName, result]) => (
                    <div key={tableName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{tableName}</h4>
                        <Badge
                          variant={
                            result.error ? 'error' : result.data ? 'success' : 'warning'
                          }
                        >
                          {result.error ? 'Error' : result.data ? 'OK' : 'Sin datos'}
                        </Badge>
                      </div>
                      
                      {result.error ? (
                        <p className="text-sm text-red-600">
                          Error: {result.error.message || 'Error desconocido'}
                        </p>
                      ) : result.data ? (
                        <p className="text-sm text-gray-600">
                          {result.data.length} registro(s) encontrado(s)
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Sin datos disponibles</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Spinner size="md" />
              <span className="text-gray-600">Probando conexión...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
