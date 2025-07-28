// Debug component for feature flags
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React from 'react'
import { FEATURE_FLAGS } from '@/lib/constants'

export default function FeatureFlagDebug() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}
    >
      <div>🔧 Feature Flags Debug</div>
      <div>ENABLE_AI_CHATBOT: {String(FEATURE_FLAGS.ENABLE_AI_CHATBOT)}</div>
      <div>ENV: {process.env.NODE_ENV}</div>
      <div>NEXT_PUBLIC_ENABLE_AI_CHATBOT: {process.env.NEXT_PUBLIC_ENABLE_AI_CHATBOT || 'undefined'}</div>
    </div>
  )
}
