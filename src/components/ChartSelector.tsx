'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, LineChart, BarChart, TrendingUp, BarChart2 } from 'lucide-react';
import { Transaction } from '@/types';

type ChartType = 'pie' | 'line' | 'bar';

interface ChartSelectorProps {
  transactions: Transaction[];
  formatValue: (value: number, targetCurrency?: 'BRL' | 'USD') => string;
}

export function ChartSelector({ transactions, formatValue }: ChartSelectorProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');

  const wins = transactions.filter(t => t.result === 'win').length;
  const losses = transactions.filter(t => t.result === 'loss').length;
  const total = wins + losses;

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-dark border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">0</div>
              <div className="text-white/60">Nenhuma operação registrada</div>
              <div className="text-sm text-white/40 mt-2">
                Adicione operações para ver os gráficos
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const winPercentage = (wins / total) * 100;
  const lossPercentage = (losses / total) * 100;

  // Renderizar gráfico baseado no tipo selecionado
  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return <PieChartComponent wins={wins} losses={losses} winPercentage={winPercentage} lossPercentage={lossPercentage} total={total} />;
      case 'line':
        return <LineChartComponent transactions={transactions} formatValue={formatValue} />;
      case 'bar':
        return <BarChartComponent wins={wins} losses={losses} winPercentage={winPercentage} lossPercentage={lossPercentage} />;
      default:
        return <PieChartComponent wins={wins} losses={losses} winPercentage={winPercentage} lossPercentage={lossPercentage} total={total} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-dark border-white/10 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de Operações
            </CardTitle>
            
            {/* Seletor de Tipo de Gráfico */}
            <div className="flex gap-2">
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
                className={chartType === 'pie' ? 'bg-blue-500 hover:bg-blue-600' : 'border-white/10 text-white hover:bg-white/10'}
              >
                <PieChart className="h-4 w-4 mr-1" />
                Pizza
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
                className={chartType === 'line' ? 'bg-blue-500 hover:bg-blue-600' : 'border-white/10 text-white hover:bg-white/10'}
              >
                <LineChart className="h-4 w-4 mr-1" />
                Linhas
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
                className={chartType === 'bar' ? 'bg-blue-500 hover:bg-blue-600' : 'border-white/10 text-white hover:bg-white/10'}
              >
                <BarChart2 className="h-4 w-4 mr-1" />
                Barras
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            key={chartType}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {renderChart()}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente de Gráfico de Pizza Corrigido
function PieChartComponent({ wins, losses, winPercentage, lossPercentage, total }: any) {
  return (
    <div className="space-y-6">
      {/* Gráfico de Pizza Moderno */}
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 200 200" className="transform rotate-0">
          {/* Círculo de fundo */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="20"
          />
          
          {/* Arco de Wins - Verde */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - winPercentage / 100)}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - winPercentage / 100) }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            transform="rotate(-90 100 100)"
          />
          
          {/* Arco de Losses - Vermelho */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (winPercentage / 100)}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (winPercentage / 100) }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            transform="rotate(-90 100 100)"
          />
        </svg>
        
        {/* Centro do gráfico */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{total}</div>
            <div className="text-xs text-white/60">Total</div>
          </div>
        </div>
      </div>

      {/* Legendas e Estatísticas */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
          >
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm text-green-400 font-semibold">Wins</div>
              <div className="text-2xl font-bold text-white">{wins}</div>
              <div className="text-sm text-green-400">{winPercentage.toFixed(1)}%</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <div className="text-sm text-red-400 font-semibold">Losses</div>
              <div className="text-2xl font-bold text-white">{losses}</div>
              <div className="text-sm text-red-400">{lossPercentage.toFixed(1)}%</div>
            </div>
          </motion.div>
        </div>

        {/* Taxa de Acerto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="text-sm text-white/60 mb-1">Taxa de Acerto</div>
          <div className={`text-3xl font-bold ${
            winPercentage >= 50 ? 'text-green-400' : 'text-red-400'
          }`}>
            {winPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-white/40 mt-1">
            {winPercentage >= 50 ? 'Acima da meta' : 'Abaixo da meta'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Componente de Gráfico de Linhas
function LineChartComponent({ transactions, formatValue }: any) {
  // Agrupar transações por data
  const dailyData = transactions.reduce((acc: any, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = { date, wins: 0, losses: 0, profit: 0 };
    }
    if (transaction.result === 'win') {
      acc[date].wins++;
      acc[date].profit += transaction.profit || 0;
    } else {
      acc[date].losses++;
      acc[date].profit += transaction.profit || 0;
    }
    return acc;
  }, {});

  const sortedData = Object.values(dailyData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg">
        <div className="text-center">
          <LineChart className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <div className="text-white/60">Gráfico de Linhas</div>
          <div className="text-sm text-white/40 mt-2">
            Evolução das operações ao longo do tempo
          </div>
          <div className="mt-4 space-y-2">
            {sortedData.slice(-5).map((day: any, index: number) => (
              <div key={index} className="text-xs text-white/60">
                {day.date}: {day.wins}W/{day.losses}L - {formatValue(day.profit)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Gráfico de Barras
function BarChartComponent({ wins, losses, winPercentage, lossPercentage }: any) {
  return (
    <div className="space-y-6">
      <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg">
        <div className="w-full max-w-xs">
          <div className="text-center mb-4">
            <BarChart2 className="h-12 w-12 text-white/20 mx-auto mb-2" />
            <div className="text-white/60">Gráfico de Barras</div>
          </div>
          
          {/* Barras */}
          <div className="flex justify-center items-end gap-8 h-32">
            <div className="flex flex-col items-center">
              <div 
                className="w-16 bg-green-500 rounded-t transition-all duration-1000 ease-out"
                style={{ height: `${winPercentage * 1.2}px` }}
              >
                <div className="text-white text-center pt-2 font-bold">
                  {wins}
                </div>
              </div>
              <div className="text-green-400 text-sm mt-2">Wins</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                className="w-16 bg-red-500 rounded-t transition-all duration-1000 ease-out"
                style={{ height: `${lossPercentage * 1.2}px` }}
              >
                <div className="text-white text-center pt-2 font-bold">
                  {losses}
                </div>
              </div>
              <div className="text-red-400 text-sm mt-2">Losses</div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <div className={`text-2xl font-bold ${
              winPercentage >= 50 ? 'text-green-400' : 'text-red-400'
            }`}>
              {winPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-white/40">Taxa de Acerto</div>
          </div>
        </div>
      </div>
    </div>
  );
}
