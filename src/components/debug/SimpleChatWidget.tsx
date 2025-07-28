// Simple ChatWidget for debugging
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React from 'react'

export default function SimpleChatWidget() {
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        backgroundColor: '#007bff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
      onClick={() => alert('Simple ChatWidget clicked!')}
    >
      💬
    </div>
  )
}
