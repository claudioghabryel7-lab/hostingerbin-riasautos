'use client';

import { useState, useEffect, useMemo } from 'react';
import { Transaction, Metrics } from '@/types';
import { getUSDToBRLRate, convertCurrency, formatCurrency } from '@/lib/exchangeRate';
import { useDefaultCurrency } from './useDefaultCurrency';
import { Period, getPeriodDates } from '@/components/PeriodSelector';

const STORAGE_KEY = 'hotinger-transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(5.50); // Valor padrão
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const { defaultCurrency } = useDefaultCurrency();

  // Buscar cotação do dólar ao montar
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const rate = await getUSDToBRLRate();
        setExchangeRate(rate);
      } catch (error) {
        console.error('Erro ao carregar cotação:', error);
      } finally {
        setIsLoadingRate(false);
      }
    };

    loadExchangeRate();
  }, []);

  // Carregar transações do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTransactions(parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })));
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      }
    }
  }, []);

  // Salvar transações no localStorage quando mudar
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  // Filtrar transações por período
  const filteredTransactions = useMemo(() => {
    const { start, end } = getPeriodDates(selectedPeriod);
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, selectedPeriod]);

  // Calcular saldos separados por moeda para exibição (baseado no período)
  const usdBalance = useMemo(() => {
    return filteredTransactions
      .filter(t => t.currency === 'USD')
      .reduce((sum, t) => sum + t.netProfit, 0);
  }, [filteredTransactions]);

  const brlBalance = useMemo(() => {
    return filteredTransactions
      .filter(t => t.currency === 'BRL')
      .reduce((sum, t) => sum + t.netProfit, 0);
  }, [filteredTransactions]);

  // Calcular métricas em tempo real (sempre em BRL) - baseado no período selecionado
  const metrics = useMemo((): Metrics => {
    const wins = filteredTransactions.filter(t => t.type === 'win');
    const losses = filteredTransactions.filter(t => t.type === 'loss');
    
    // Converter todos os valores para BRL
    const totalInvested = filteredTransactions.reduce((sum, t) => {
      const converted = convertCurrency(t.investment, t.currency, 'BRL', t.exchangeRate || exchangeRate);
      return sum + converted;
    }, 0);
    
    const totalWithdrawn = filteredTransactions.reduce((sum, t) => {
      if (!t.withdrawn) return sum;
      const converted = convertCurrency(t.withdrawn, t.currency, 'BRL', t.exchangeRate || exchangeRate);
      return sum + converted;
    }, 0);
    
    // SALDO REAL: Soma de todos os netProfits (wins - losses)
    // WIN: netProfit positivo (lucro), LOSS: netProfit negativo (prejuízo)
    const realBalance = filteredTransactions.reduce((sum, t) => {
      const converted = convertCurrency(t.netProfit, t.currency, 'BRL', exchangeRate);
      return sum + converted;
    }, 0);
    
    const winRate = filteredTransactions.length > 0 
      ? (wins.length / filteredTransactions.length) * 100 
      : 0;

    return {
      totalCycleProfit: realBalance, // Usando o saldo real
      winRate,
      currentBalance: realBalance, // Saldo atual é o saldo real do período
      totalInvested,
      totalWithdrawn,
      winsCount: wins.length,
      lossesCount: losses.length
    };
  }, [filteredTransactions, exchangeRate]);

  // Adicionar nova transação
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    let finalExchangeRate = transaction.exchangeRate;
    
    // Se for USD e não tiver taxa, buscar a atual
    if (transaction.currency === 'USD' && !finalExchangeRate) {
      try {
        finalExchangeRate = await getUSDToBRLRate();
        setExchangeRate(finalExchangeRate);
      } catch (error) {
        console.error('Erro ao buscar cotação para nova transação:', error);
        finalExchangeRate = exchangeRate;
      }
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date(transaction.date),
      exchangeRate: finalExchangeRate
    };
    
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  // Remover transação
  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Limpar todas as transações
  const clearTransactions = () => {
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Função utilitária para formatar valores convertidos
  const formatValue = (value: number, targetCurrency: 'BRL' | 'USD' = 'BRL') => {
    return formatCurrency(value, targetCurrency);
  };

  return {
    transactions,
    filteredTransactions,
    metrics,
    exchangeRate,
    isLoadingRate,
    defaultCurrency,
    selectedPeriod,
    setSelectedPeriod,
    usdBalance,
    brlBalance,
    addTransaction,
    removeTransaction,
    clearTransactions,
    formatValue
  };
}
