'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SimpleAuthGuard } from '@/components/SimpleAuthGuard';
import { MetricCard } from '@/components/MetricCard';
import { PeriodSelector, Period } from '@/components/PeriodSelector';
import { ChartSelector } from '@/components/ChartSelector';
import { HistorySidebar } from '@/components/HistorySidebar';
import { NewTransactionModal } from '@/components/NewTransactionModal';
import { CurrencyOnboarding } from '@/components/CurrencyOnboarding';
import { UserMenu } from '@/components/UserMenu';
import { Card, CardContent } from '@/components/ui/card';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  
  const { defaultCurrency, isLoading: isLoadingCurrency, hasSelected } = useDefaultCurrency();
  const { transactions, addTransaction, removeTransaction, metrics, isLoading, formatValue } = useTransactions();

  // Filtrar transações por período
  const filteredTransactions = transactions.filter((transaction: any) => {
    if (selectedPeriod === 'all') return true;
    
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (selectedPeriod) {
      case 'day': return daysDiff <= 1;
      case 'week': return daysDiff <= 7;
      case 'month': return daysDiff <= 30;
      default: return true;
    }
  });

  return (
    <SimpleAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Hotinger Gestor OB
              </h1>
              <p className="text-white/60">
                Gestão profissional de operações binárias
              </p>
            </div>
            
            <div className="flex gap-3 items-center">
              <Button
                onClick={() => setShowHistorySidebar(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Histórico
              </Button>
              
              <Button
                onClick={() => setShowNewTransactionModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Operação
              </Button>

              <UserMenu />
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">Carregando dados...</div>
            </div>
          ) : (
            <>
              {/* Currency Onboarding */}
              {hasSelected === false && (
                <CurrencyOnboarding onComplete={() => window.location.reload()} />
              )}

              {/* Metrics Cards */}
              {hasSelected && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <MetricCard
                      title="Lucro Total"
                      value={formatValue(metrics.totalProfit, defaultCurrency)}
                      change={Math.round(metrics.totalProfit * 100) / 100}
                      isPositive={metrics.totalProfit >= 0}
                    />
                    <MetricCard
                      title="Win Rate"
                      value={`${metrics.winRate.toFixed(1)}%`}
                      change={Math.round((metrics.winRate - 50) * 10) / 10}
                      isPositive={metrics.winRate >= 50}
                    />
                    <MetricCard
                      title="Total Ops"
                      value={`${transactions.length}`}
                      change={0}
                      isPositive={transactions.length > 0}
                    />
                    <MetricCard
                      title="Saldo Atual"
                      value={formatValue(metrics.currentBalance, defaultCurrency)}
                      change={Math.round(metrics.currentBalance * 100) / 100}
                      isPositive={metrics.currentBalance >= 0}
                    />
                  </div>

                  {/* Period Selector */}
                  <PeriodSelector 
                    selectedPeriod={selectedPeriod} 
                    onPeriodChange={setSelectedPeriod} 
                  />

                  {/* Chart and Tools Link */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart */}
                    <div className="lg:col-span-1">
                      <ChartSelector transactions={filteredTransactions} formatValue={formatValue} />
                    </div>

                    {/* Tools Link */}
                    <div className="lg:col-span-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link href="/tools">
                          <Card className="glass-dark border-white/10 cursor-pointer hover:border-white/20 transition-all h-full">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-white mb-2">Ferramentas de Trading</h3>
                                  <p className="text-white/60 mb-4">
                                    Acesse calculadoras, análises e estratégias profissionais
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                      Calculadora Martingale
                                    </span>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                      Gerenciamento de Risco
                                    </span>
                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                      Análise de Padrões
                                    </span>
                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                                      Estratégias com Alta Assertividade
                                    </span>
                                  </div>
                                </div>
                                <div className="text-white/40">
                                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  {filteredTransactions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                    >
                      <div className="glass-dark border-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">{metrics.winsCount}</div>
                        <div className="text-sm text-white/60">Wins</div>
                      </div>
                      <div className="glass-dark border-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">{metrics.lossesCount}</div>
                        <div className="text-sm text-white/60">Losses</div>
                      </div>
                      <div className="glass-dark border-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{metrics.winRate}%</div>
                        <div className="text-sm text-white/60">Win Rate</div>
                      </div>
                      <div className="glass-dark border-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">{filteredTransactions.length}</div>
                        <div className="text-sm text-white/60">Total Ops</div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <NewTransactionModal
          show={showNewTransactionModal}
          onClose={() => setShowNewTransactionModal(false)}
          onAddTransaction={addTransaction}
          defaultCurrency={defaultCurrency}
        />

        <HistorySidebar
          transactions={transactions}
          isOpen={showHistorySidebar}
          onClose={() => setShowHistorySidebar(false)}
          formatValue={formatValue}
        />
      </div>
    </SimpleAuthGuard>
  );
}
