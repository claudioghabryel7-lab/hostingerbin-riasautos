'use client';

import { useState, useEffect } from 'react';

export type Currency = 'BRL' | 'USD';

const DEFAULT_CURRENCY_KEY = 'hotinger-default-currency';

export function useDefaultCurrency() {
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>('BRL');
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelected, setHasSelected] = useState(false);

  // Carregar moeda padrão do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem(DEFAULT_CURRENCY_KEY);
    if (stored) {
      try {
        const currency = JSON.parse(stored) as Currency;
        setDefaultCurrency(currency);
        setHasSelected(true);
      } catch (error) {
        console.error('Erro ao carregar moeda padrão:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Salvar moeda padrão no localStorage quando mudar
  const saveDefaultCurrency = (currency: Currency) => {
    setDefaultCurrency(currency);
    setHasSelected(true);
    localStorage.setItem(DEFAULT_CURRENCY_KEY, JSON.stringify(currency));
  };

  // Limpar seleção (para fins de teste)
  const clearDefaultCurrency = () => {
    setDefaultCurrency('BRL');
    setHasSelected(false);
    localStorage.removeItem(DEFAULT_CURRENCY_KEY);
  };

  return {
    defaultCurrency,
    isLoading,
    hasSelected,
    saveDefaultCurrency,
    clearDefaultCurrency
  };
}
