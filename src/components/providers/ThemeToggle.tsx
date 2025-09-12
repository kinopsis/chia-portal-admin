// ThemeToggle.tsx
// Componente para alternar entre modo claro y oscuro con iconos de Heroicons

'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/components/providers/ThemeContext';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Solo renderizar después de que el componente se haya montado
  // para evitar discrepancias entre el servidor y el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled className="opacity-0">
        <SunIcon className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <>
          <MoonIcon className="h-5 w-5" />
          <span className="sr-only">Switch to dark mode</span>
        </>
      ) : (
        <>
          <SunIcon className="h-5 w-5" />
          <span className="sr-only">Switch to light mode</span>
        </>
      )}
    </Button>
  );
}