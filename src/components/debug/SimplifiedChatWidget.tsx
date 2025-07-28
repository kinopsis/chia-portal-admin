// Simplified ChatWidget for debugging
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React, { useState } from 'react'

interface SimplifiedChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  defaultOpen?: boolean
  className?: string
}

export default function SimplifiedChatWidget({ 
  position = 'bottom-right',
  defaultOpen = false,
  className = ''
}: SimplifiedChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'bot'}>>([])

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage('')
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: `Gracias por tu mensaje: "${message}". Este es el chatbot IA de Chía funcionando correctamente.`,
        sender: 'bot' as const
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Abrir chat del asistente virtual"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Asistente Virtual IA</h3>
              <p className="text-xs opacity-90">Portal de Chía</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded p-1"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                <p>¡Hola! 👋</p>
                <p>Soy el asistente virtual de la Alcaldía de Chía.</p>
                <p>¿En qué puedo ayudarte hoy?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
