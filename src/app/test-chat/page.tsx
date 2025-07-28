// Test page for ChatWidget
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React from 'react'
import { ChatWidget } from '@/components/chat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestChatPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prueba del Asistente Virtual IA
          </h1>
          <p className="text-lg text-gray-600">
            Portal de Atención Ciudadana de Chía - Epic 4: US-012
          </p>
        </div>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  🤖 Funcionalidades a Probar:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Widget flotante en esquina inferior derecha</li>
                  <li>• Abrir/cerrar chatbot con botón flotante</li>
                  <li>• Minimizar/maximizar ventana de chat</li>
                  <li>• Envío de mensajes con Enter</li>
                  <li>• Indicadores de escritura y carga</li>
                  <li>• Respuestas del asistente IA</li>
                  <li>• Sistema de feedback (útil/no útil)</li>
                  <li>• Escalación automática (confianza &lt; 70%)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  💬 Preguntas de Prueba:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• "¿Cómo saco mi cédula?"</li>
                  <li>• "¿Dónde pago impuestos?"</li>
                  <li>• "Horarios de atención"</li>
                  <li>• "¿Cómo registro mi empresa?"</li>
                  <li>• "Información de contacto"</li>
                  <li>• "¿Qué trámites puedo hacer?"</li>
                  <li>• "Preguntas sobre dependencias"</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                📋 Checklist de Validación:
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-800 mb-1">Interfaz:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>□ Widget responsive y accesible</li>
                    <li>□ Animaciones suaves</li>
                    <li>□ Estados de carga visibles</li>
                    <li>□ Manejo de errores</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-blue-800 mb-1">Funcionalidad:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>□ Conexión con API /api/chat</li>
                    <li>□ Persistencia de sesión</li>
                    <li>□ Feedback funcional</li>
                    <li>□ Escalación automática</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Content */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Contenido de Prueba</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Esta página simula contenido público donde el chatbot debe aparecer.
                El widget flotante debe estar visible en la esquina inferior derecha.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Información Municipal</h4>
                  <p className="text-sm text-gray-600">
                    El Municipio de Chía ofrece diversos trámites y servicios 
                    para los ciudadanos. Nuestro asistente virtual puede ayudarte 
                    a encontrar información sobre:
                  </p>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Trámites de identificación</li>
                    <li>Pagos de impuestos</li>
                    <li>Registro de empresas</li>
                    <li>Información de dependencias</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Horarios de Atención</h4>
                  <p className="text-sm text-gray-600">
                    Lunes a Viernes: 8:00 AM - 5:00 PM<br/>
                    Teléfono: (601) 123-4567<br/>
                    Email: info@chia.gov.co
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Chatbot IA</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ✅ Activo
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">API /api/chat</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    🔄 Listo
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Base de Datos</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    💾 Conectado
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">OpenAI GPT-4.1</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    🧠 Configurado
                  </span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Métricas Objetivo</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Respuesta web: &lt;3s ⏱️</li>
                  <li>• Escalación: confianza &lt;70% 📈</li>
                  <li>• Accesibilidad: WCAG AA ♿</li>
                  <li>• Multi-canal: Web + WhatsApp 📱</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Epic 4 - US-012: Interfaz de Usuario del Chatbot Web | 
            Portal de Atención Ciudadana de Chía
          </p>
        </div>
      </div>

      {/* ChatWidget will be rendered by ConditionalLayout */}
    </div>
  )
}
