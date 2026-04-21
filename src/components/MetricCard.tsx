'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { Metrics } from '@/types';

interface MetricCardProps {
  title?: string;
  value?: string | React.ReactNode;
  change?: number;
  isPositive?: boolean;
  metrics?: Metrics;
  formatValue?: (value: number, targetCurrency?: 'BRL' | 'USD') => string;
  usdBalance?: number;
  brlBalance?: number;
  exchangeRate?: number;
}

export function MetricCard({ title, value, change, isPositive, metrics, formatValue, usdBalance = 0, brlBalance = 0, exchangeRate = 5.50 }: MetricCardProps) {
  // Se props individuais foram passados, renderizar apenas um card
  if (title && value !== undefined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-dark border-white/10">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm text-white/60 mb-1">{title}</div>
              <div className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {value}
              </div>
              {change !== undefined && (
                <div className={`text-xs mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{change}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Valores padrão caso metrics seja undefined (modo completo)
  const safeMetrics = metrics || {
    totalProfit: 0,
    winRate: 0,
    currentBalance: 0,
    totalInvested: 0,
    totalWithdrawn: 0,
    winsCount: 0,
    lossesCount: 0
  };

  // Função segura de formatação
  const safeFormatValue = (value: number, currency?: string) => {
    if (typeof formatValue === 'function') {
      // Usar type assertion para garantir compatibilidade
      return formatValue(value, currency as 'BRL' | 'USD' | undefined);
    }
    // Fallback simples
    const formattedValue = currency === 'USD' ? (value / exchangeRate).toFixed(2) : value.toFixed(2);
    return currency === 'USD' ? `$${formattedValue}` : `R$${formattedValue}`;
  };

  const cards = [
    {
      title: 'Lucro Total do Ciclo',
      value: safeFormatValue(safeMetrics.totalProfit),
      icon: TrendingUp,
      textColor: safeMetrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400',
      glow: safeMetrics.totalProfit >= 0 ? 'win-glow' : 'loss-glow'
    },
    {
      title: 'Taxa de Acerto',
      value: `${safeMetrics.winRate.toFixed(1)}%`,
      icon: Target,
      textColor: safeMetrics.winRate >= 50 ? 'text-green-400' : 'text-red-400',
      glow: safeMetrics.winRate >= 50 ? 'win-glow' : 'loss-glow'
    },
    {
      title: 'Saldo Atual',
      value: (
        <div className="space-y-1">
          <div className="text-lg font-bold">
            {usdBalance !== 0 && (
              <div className={safeMetrics.currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}>
                {safeFormatValue(usdBalance, 'USD')}
              </div>
            )}
            <div className={`text-xl ${safeMetrics.currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {safeFormatValue(safeMetrics.currentBalance, 'BRL')}
            </div>
          </div>
          {usdBalance !== 0 && (
            <div className="text-xs text-white/50">
              (USD × {exchangeRate.toFixed(2)})
            </div>
          )}
        </div>
      ),
      icon: DollarSign,
      textColor: safeMetrics.currentBalance >= 0 ? 'text-green-400' : 'text-red-400',
      glow: safeMetrics.currentBalance >= 0 ? 'win-glow' : 'loss-glow'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`glass-dark ${card.glow} border-white/10 text-white`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.textColor}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
