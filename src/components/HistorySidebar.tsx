'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp, TrendingDown, X, Filter } from 'lucide-react';
import { Transaction } from '@/types';

interface HistorySidebarProps {
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  formatValue: (value: number, currency?: string) => string;
  defaultCurrency: 'BRL' | 'USD';
  exchangeRate: number;
}

export function HistorySidebar({ transactions, isOpen, onClose, formatValue, defaultCurrency, exchangeRate }: HistorySidebarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Agrupar transações por data (últimos 7 dias)
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= sevenDaysAgo
    );

    const grouped = recentTransactions.reduce((acc, transaction) => {
      // Usar timestamp para evitar problemas de formatação no SSR
      const dateKey = new Date(transaction.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    return grouped;
  };

  // Formatar datas apenas no cliente para evitar erro de hidratação
  const [isClient, setIsClient] = useState(false);
  const [groupedTransactions, setGroupedTransactions] = useState<Record<string, Transaction[]>>({});
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setIsClient(true);
    
    // Agrupar transações por data
    const recentTransactions = transactions.slice(-50); // Últimas 50 transações
    const grouped = recentTransactions.reduce((acc, transaction) => {
      const dateKey = new Date(transaction.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);
    
    setGroupedTransactions(grouped);
    
    // Formatar datas apenas no cliente
    const formatted: Record<string, string> = {};
    Object.keys(grouped).forEach(dateKey => {
      formatted[dateKey] = new Date(dateKey).toLocaleDateString('pt-BR');
    });
    setFormattedDates(formatted);
  }, [transactions]); // Dependência apenas em transactions, não em groupedTransactions
  
  const dates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  useEffect(() => {
    if (selectedDate && groupedTransactions[selectedDate]) {
      setFilteredTransactions(groupedTransactions[selectedDate]);
    } else {
      setFilteredTransactions([]);
    }
  }, [selectedDate, groupedTransactions]);

  const getDayStats = (transactions: Transaction[]) => {
    const wins = transactions.filter(t => t.result === 'win').length;
    const losses = transactions.filter(t => t.result === 'loss').length;
    
    // SIMples soma sem conversões
    const totalProfit = transactions
      .filter(t => t.result === 'win')
      .reduce((sum, t) => sum + t.profit, 0);
      
    const totalLoss = transactions
      .filter(t => t.result === 'loss')
      .reduce((sum, t) => sum + Math.abs(t.profit), 0);

    return { wins, losses, totalProfit, totalLoss };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l border-white/10 z-50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Histórico (7 dias)
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content - Usando div simples em vez de ScrollArea */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedDate ? (
                  // Transações do dia selecionado
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {isClient && formattedDates[selectedDate] ? formattedDates[selectedDate] : selectedDate}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDate('')}
                        className="text-white/60 hover:text-white"
                      >
                        <Filter className="h-4 w-4 mr-1" />
                        Voltar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {filteredTransactions.map((transaction, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="glass-dark border-white/10 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {transaction.result === 'win' ? (
                                <TrendingUp className="h-4 w-4 text-green-400" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-400" />
                              )}
                              <span className="text-white font-medium">
                                {transaction.asset}
                              </span>
                            </div>
                            <Badge
                              variant={transaction.result === 'win' ? 'default' : 'destructive'}
                              className={
                                transaction.result === 'win'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }
                            >
                              {transaction.result.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-white/60">Entrada:</span>
                              <span className="text-white ml-1">
                                {formatValue(transaction.amount, transaction.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/60">Resultado:</span>
                              <span className={`ml-1 ${
                                transaction.result === 'win' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatValue(transaction.profit, transaction.currency)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-white/40">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {isClient ? new Date(transaction.date).toLocaleTimeString('pt-BR') : ''}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Dias com transações
                  <div className="space-y-4">
                    {dates.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">Nenhuma transação nos últimos 7 dias</p>
                      </div>
                    ) : (
                      dates.map(date => {
                        const dayTransactions = groupedTransactions[date];
                        const stats = getDayStats(dayTransactions);
                        
                        return (
                          <motion.div
                            key={date}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="glass-dark border-white/10 rounded-lg p-4 cursor-pointer hover:border-white/20 transition-colors"
                            onClick={() => setSelectedDate(date)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">
                                {isClient && formattedDates[date] ? formattedDates[date] : date}
                              </h4>
                              <Badge variant="secondary" className="bg-white/10 text-white/80">
                                {dayTransactions.length} ops
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div>
                                <div className="text-green-400 font-semibold">{stats.wins}</div>
                                <div className="text-xs text-white/60">Wins</div>
                              </div>
                              <div>
                                <div className="text-red-400 font-semibold">{stats.losses}</div>
                                <div className="text-xs text-white/60">Losses</div>
                              </div>
                              <div>
                                <div className="text-green-400 font-semibold">
                                  {formatValue(stats.totalProfit, defaultCurrency)}
                                </div>
                                <div className="text-xs text-white/60">Lucro</div>
                              </div>
                              <div>
                                <div className="text-red-400 font-semibold">
                                  {formatValue(-stats.totalLoss, defaultCurrency)}
                                </div>
                                <div className="text-xs text-white/60">Perda</div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
