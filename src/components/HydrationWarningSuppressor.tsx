'use client';

import { useEffect } from 'react';

export function HydrationWarningSuppressor() {
  useEffect(() => {
    // Suprimir avisos de hidratação específicos causados por extensões de navegador
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      // Filtrar mensagens de hidratação relacionadas a extensões de navegador
      const errorMessage = args[0];
      
      if (
        typeof errorMessage === 'string' && 
        (
          errorMessage.includes('bis_skin_checked') ||
          errorMessage.includes('bis_register') ||
          errorMessage.includes('hydration mismatch') ||
          errorMessage.includes('server rendered HTML') ||
          errorMessage.includes('client properties')
        )
      ) {
        // Suprimir estes avisos específicos
        return;
      }
      
      // Manter outros erros importantes
      originalConsoleError.apply(console, args);
    };

    // Limpar ao desmontar
    return () => {
      console.error = originalConsoleError;
    };
  }, []); // Array de dependências vazio para executar apenas uma vez

  // Componente não renderiza nada visualmente
  return null;
}
