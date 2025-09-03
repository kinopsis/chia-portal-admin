// ThemeTest.tsx
// Componente para probar el funcionamiento del modo oscuro

'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeContext';

const ThemeTest = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 border rounded-lg bg-background-secondary border-border">
      <h2 className="text-xl font-bold mb-4 text-foreground">Prueba de Modo Oscuro</h2>
      <p className="mb-4 text-foreground">
        Tema actual: <span className="font-semibold">{theme === 'light' ? 'Claro' : 'Oscuro'}</span>
      </p>
      <button
        onClick={toggleTheme}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
      >
        Alternar Modo
      </button>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-background-elevated rounded">
          <h3 className="font-semibold mb-2 text-foreground">Elemento de prueba 1</h3>
          <p className="text-foreground">Este es un texto de prueba para verificar el contraste.</p>
        </div>
        <div className="p-4 bg-background-tertiary rounded">
          <h3 className="font-semibold mb-2 text-foreground">Elemento de prueba 2</h3>
          <p className="text-foreground">Este es otro texto de prueba para verificar el contraste.</p>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;