'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SimpleAuthGuard } from '@/components/SimpleAuthGuard';
import { MetricCard } from '@/components/MetricCard';
import { PeriodSelector } from '@/components/PeriodSelector';
import { PieChart } from '@/components/PieChart';
import { ToolsBox } from '@/components/ToolsBox';
import { HistorySidebar } from '@/components/HistorySidebar';
import { NewTransactionModal } from '@/components/NewTransactionModal';
import { CurrencyOnboarding } from '@/components/CurrencyOnboarding';
import { UserMenu } from '@/components/UserMenu';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

export default function HomePage() {
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  const { defaultCurrency, isLoading: isLoadingCurrency, hasSelected } = useDefaultCurrency();
  const { transactions, addTransaction, removeTransaction, metrics, isLoading } = useTransactions();

  // Filtrar transações por período
  const filteredTransactions = transactions.filter(transaction => {
    if (selectedPeriod === 'all') return true;
    
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (selectedPeriod) {
      case '7d': return daysDiff <= 7;
      case '30d': return daysDiff <= 30;
      case '90d': return daysDiff <= 90;
      default: return true;
    }
  });

  // Formatar valores
  const formatValue = (value: number, currency?: string) => {
    const curr = currency || defaultCurrency?.code || 'BRL';
    const symbol = curr === 'USD' ? '$' : 'R$';
    return `${symbol} ${Math.abs(value).toFixed(2)}`;
  };

  // Mostrar onboarding se ainda não selecionou moeda padrão
  if (isLoadingCurrency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!hasSelected) {
    return <CurrencyOnboarding onComplete={() => {
      // Forçar atualização do estado
      window.location.reload();
    }} />;
  }

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
              {/* Metrics Cards */}
              <MetricCard 
                metrics={metrics} 
                formatValue={formatValue} 
                usdBalance={defaultCurrency?.code === 'USD'}
                brlBalance={defaultCurrency?.code === 'BRL'}
                exchangeRate={1}
              />

              {/* Period Selector */}
              <PeriodSelector 
                selectedPeriod={selectedPeriod} 
                onPeriodChange={setSelectedPeriod} 
              />

              {/* Chart and Tools Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-1">
                  <PieChart transactions={filteredTransactions} />
                </div>

                {/* Tools Box */}
                <div className="lg:col-span-2">
                  <ToolsBox />
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
        </div>

        {/* Modals */}
        <NewTransactionModal
          isOpen={showNewTransactionModal}
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
