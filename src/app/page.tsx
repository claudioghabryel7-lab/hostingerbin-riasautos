'use client';

import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { MetricCard } from '@/components/MetricCard';
import { PieChart } from '@/components/PieChart';
import { TransactionTable } from '@/components/TransactionTable';
import { NewTransactionModal } from '@/components/NewTransactionModal';
import { CurrencyOnboarding } from '@/components/CurrencyOnboarding';
import { PeriodSelector } from '@/components/PeriodSelector';
import { ToolsBox } from '@/components/ToolsBox';
import { SimpleAuthGuard } from '@/components/SimpleAuthGuard';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { TrendingUp, BarChart3, History, Plus, Coins } from 'lucide-react';

export default function Home() {
  const { 
    transactions, 
    filteredTransactions, 
    metrics, 
    addTransaction, 
    removeTransaction, 
    formatValue, 
    exchangeRate, 
    isLoadingRate, 
    defaultCurrency,
    selectedPeriod,
    setSelectedPeriod,
    usdBalance,
    brlBalance
  } = useTransactions();
  const { hasSelected, isLoading: isLoadingCurrency } = useDefaultCurrency();

  const handleDiscountApplied = (percentage: number) => {
    console.log(`Desconto de ${percentage}% aplicado!`);
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

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Hotinger Gestor OB
                </h1>
                <p className="text-white/60 text-sm sm:text-base">
                  Sistema profissional de gestão de operações
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-white/60">Cotação USD/BRL</div>
                  <div className="text-lg font-bold text-white">
                    {isLoadingRate ? 'Carregando...' : formatValue(exchangeRate, 'BRL')}
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <NewTransactionModal onAddTransaction={addTransaction} defaultCurrency={defaultCurrency} />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Metrics Cards */}
            <MetricCard 
              metrics={metrics} 
              formatValue={formatValue} 
              usdBalance={usdBalance}
              brlBalance={brlBalance}
              exchangeRate={exchangeRate}
            />

            {/* Period Selector */}
            <PeriodSelector 
              selectedPeriod={selectedPeriod} 
              onPeriodChange={setSelectedPeriod} 
            />

            {/* Transaction Table */}
            <div className="glass-dark border-white/10 rounded-lg mb-6">
              <TransactionTable 
                transactions={filteredTransactions} 
                onDeleteTransaction={removeTransaction}
                formatValue={formatValue}
              />
            </div>

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
                  <div className="text-2xl font-bold text-white">{filteredTransactions.length}</div>
                  <div className="text-sm text-white/60">Total Ops</div>
                </div>
                <div className="glass-dark border-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {metrics.totalInvested > 0 ? ((metrics.totalCycleProfit / metrics.totalInvested) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-sm text-white/60">ROI</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </SimpleAuthGuard>
  );
}
