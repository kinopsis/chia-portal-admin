'use client'

/**
 * UX-008: Privacy Consent Component
 * GDPR-compliant privacy consent banner and settings
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/atoms'
import { useAnalytics } from '@/hooks/useAnalytics'
import { PrivacySettings, ConsentLevel } from '@/lib/analytics'

interface PrivacyConsentProps {
  className?: string
  position?: 'bottom' | 'top'
  showDetailedOptions?: boolean
}

export function PrivacyConsent({ 
  className = '',
  position = 'bottom',
  showDetailedOptions = false
}: PrivacyConsentProps) {
  const { updatePrivacyConsent, getPrivacySettings } = useAnalytics({ autoInitialize: false })
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Partial<PrivacySettings>>({
    consentLevel: 'necessary',
    analyticsEnabled: false,
    marketingEnabled: false,
    dataRetentionDays: 30
  })

  useEffect(() => {
    // Check if user has already given consent
    const existingSettings = getPrivacySettings()
    if (!existingSettings) {
      setShowBanner(true)
    } else {
      setSettings(existingSettings)
    }
  }, [getPrivacySettings])

  const handleAcceptAll = async () => {
    const newSettings: Partial<PrivacySettings> = {
      consentLevel: 'all',
      analyticsEnabled: true,
      marketingEnabled: true,
      dataRetentionDays: 365
    }
    
    await updatePrivacyConsent(newSettings)
    setSettings(newSettings)
    setShowBanner(false)
  }

  const handleAcceptNecessary = async () => {
    const newSettings: Partial<PrivacySettings> = {
      consentLevel: 'necessary',
      analyticsEnabled: false,
      marketingEnabled: false,
      dataRetentionDays: 30
    }
    
    await updatePrivacyConsent(newSettings)
    setSettings(newSettings)
    setShowBanner(false)
  }

  const handleCustomSettings = async () => {
    await updatePrivacyConsent(settings)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleSettingsChange = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Privacy Consent Banner */}
      <div 
        className={`fixed left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 ${
          position === 'bottom' ? 'bottom-0' : 'top-0'
        } ${className}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración de Privacidad
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
                analizar el uso del sitio y personalizar el contenido. Puedes elegir qué 
                tipos de cookies aceptar.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptAll}
                >
                  Aceptar Todo
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAcceptNecessary}
                >
                  Solo Necesarias
                </Button>
                {showDetailedOptions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                  >
                    Personalizar
                  </Button>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar banner de privacidad"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowSettings(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Configuración Detallada de Privacidad
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Personaliza qué datos podemos recopilar y cómo los utilizamos.
                </p>
              </div>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Cookies Necesarias</h4>
                    <p className="text-xs text-gray-600">
                      Esenciales para el funcionamiento del sitio web. No se pueden desactivar.
                    </p>
                  </div>
                  <div className="ml-3">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Cookies de Análisis</h4>
                    <p className="text-xs text-gray-600">
                      Nos ayudan a entender cómo los usuarios interactúan con el sitio web.
                    </p>
                  </div>
                  <div className="ml-3">
                    <input
                      type="checkbox"
                      checked={settings.analyticsEnabled || false}
                      onChange={(e) => handleSettingsChange('analyticsEnabled', e.target.checked)}
                      className="w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Cookies de Marketing</h4>
                    <p className="text-xs text-gray-600">
                      Utilizadas para personalizar anuncios y contenido relevante.
                    </p>
                  </div>
                  <div className="ml-3">
                    <input
                      type="checkbox"
                      checked={settings.marketingEnabled || false}
                      onChange={(e) => handleSettingsChange('marketingEnabled', e.target.checked)}
                      className="w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
                    />
                  </div>
                </div>

                {/* Data Retention */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Retención de Datos
                  </label>
                  <select
                    value={settings.dataRetentionDays || 30}
                    onChange={(e) => handleSettingsChange('dataRetentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                  >
                    <option value={30}>30 días</option>
                    <option value={90}>90 días</option>
                    <option value={180}>6 meses</option>
                    <option value={365}>1 año</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    Tiempo que mantenemos tus datos analíticos.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCustomSettings}
                >
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Privacy Settings Link Component
 * For footer or settings page
 */
export function PrivacySettingsLink({ className = '' }: { className?: string }) {
  const [showSettings, setShowSettings] = useState(false)
  const { getPrivacySettings, updatePrivacyConsent } = useAnalytics({ autoInitialize: false })
  const [currentSettings, setCurrentSettings] = useState<PrivacySettings | null>(null)

  useEffect(() => {
    setCurrentSettings(getPrivacySettings())
  }, [getPrivacySettings])

  const handleUpdateSettings = async (newSettings: Partial<PrivacySettings>) => {
    await updatePrivacyConsent(newSettings)
    setCurrentSettings(getPrivacySettings())
    setShowSettings(false)
  }

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className={`text-sm text-gray-600 hover:text-primary-green transition-colors ${className}`}
      >
        Configuración de Privacidad
      </button>

      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowSettings(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tu Configuración de Privacidad
              </h3>
              
              {currentSettings && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Nivel de consentimiento:</span>
                    <span className="font-medium capitalize">{currentSettings.consentLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analytics habilitado:</span>
                    <span className={currentSettings.analyticsEnabled ? 'text-green-600' : 'text-red-600'}>
                      {currentSettings.analyticsEnabled ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing habilitado:</span>
                    <span className={currentSettings.marketingEnabled ? 'text-green-600' : 'text-red-600'}>
                      {currentSettings.marketingEnabled ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retención de datos:</span>
                    <span className="font-medium">{currentSettings.dataRetentionDays} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha de consentimiento:</span>
                    <span className="font-medium">
                      {new Date(currentSettings.consentDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateSettings({ analyticsEnabled: false, marketingEnabled: false })}
                >
                  Revocar Consentimiento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
