'use client';

import { useState, useEffect, useMemo } from 'react';
import { Transaction, Metrics } from '@/types';
import { getUSDToBRLRate, convertCurrency, formatCurrency } from '@/lib/exchangeRate';
import { useDefaultCurrency } from './useDefaultCurrency';
import { Period, getPeriodDates } from '@/components/PeriodSelector';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getFirestore 
} from 'firebase/firestore';
import { useFirebaseAuth } from './useFirebaseAuth';
import { db } from '@/lib/firebase';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(5.50);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useFirebaseAuth();
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

  // Carregar transações do Firestore em tempo real
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(
      transactionsRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        
        const transaction = {
          id: doc.id,
          date: data.date,
          result: data.result,
          amount: data.amount,
          profit: data.profit,
          asset: data.asset,
          currency: data.currency,
          exchangeRate: data.exchangeRate,
          createdAt: data.createdAt
        } as Transaction;
        
        return transaction;
      });
      
      setTransactions(newTransactions);
      setIsLoading(false);
    }, (error) => {
      console.error('Erro ao carregar transações:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Adicionar transação no Firestore
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const transactionsRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(transactionsRef, {
        ...transaction,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  // Remover transação do Firestore
  const removeTransaction = async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const transactionRef = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(transactionRef);
    } catch (error) {
      console.error('Erro ao remover transação:', error);
      throw error;
    }
  };

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
      .reduce((sum, t) => sum + t.profit, 0);
  }, [filteredTransactions]);

  const brlBalance = useMemo(() => {
    return filteredTransactions
      .filter(t => t.currency === 'BRL')
      .reduce((sum, t) => sum + t.profit, 0);
  }, [filteredTransactions]);

  // Calcular métricas em tempo real (sempre em BRL) - baseado no período selecionado
  const metrics = useMemo((): Metrics => {
    const wins = filteredTransactions.filter(t => t.result === 'win');
    const losses = filteredTransactions.filter(t => t.result === 'loss');
    
    // Converter todos os valores para BRL
    const totalInvested = filteredTransactions.reduce((sum, t) => {
      const converted = convertCurrency(t.amount, t.currency, 'BRL', t.exchangeRate || exchangeRate);
      return sum + converted;
    }, 0);
    
    // SALDO REAL: Soma de todos os profits (wins - losses)
    // Simples soma dos valores já na moeda correta
    const realBalance = filteredTransactions.reduce((sum, t) => sum + t.profit, 0);

    return {
      totalProfit: realBalance,
      winRate: filteredTransactions.length > 0 ? Math.round((wins.length / filteredTransactions.length) * 100 * 10) / 10 : 0,
      currentBalance: realBalance,
      totalInvested,
      totalWithdrawn: 0, // Não usado mais com a nova estrutura
      winsCount: wins.length,
      lossesCount: losses.length
    };
  }, [filteredTransactions, exchangeRate]);

  // Função para formatar valores - SEM CONVERSÕES
  const formatValue = (value: number, targetCurrency?: string) => {
    const currency = targetCurrency || defaultCurrency || 'BRL';
    
    // NÃO FAZER CONVERSÃO - apenas formatar o valor exato
    if (currency === 'USD') {
      return formatCurrency(value, 'USD');
    }
    
    return formatCurrency(value, 'BRL');
  };

  return {
    transactions,
    filteredTransactions,
    metrics,
    exchangeRate,
    isLoadingRate,
    isLoading,
    usdBalance,
    brlBalance,
    selectedPeriod,
    setSelectedPeriod,
    addTransaction,
    removeTransaction,
    formatValue
  };
}
