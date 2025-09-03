// ThemeContext.tsx
// Contexto y proveedor para gestionar el tema (claro/oscuro) en toda la aplicación

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Definición de tipos
type Theme = 'light' | 'dark';
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// Creación del contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Proveedor del tema
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Efecto para aplicar el tema al cargar y al cambiar
  useEffect(() => {
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Verificar la preferencia del sistema si no hay tema guardado
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Establecer el tema inicial
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    // Aplicar el tema al documento
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // Función para alternar el tema
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Guardar en localStorage
      localStorage.setItem('theme', newTheme);
      // Aplicar al documento
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el contexto del tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}