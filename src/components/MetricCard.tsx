'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { Metrics } from '@/types';

interface MetricCardProps {
  metrics: Metrics;
  formatValue: (value: number, targetCurrency?: 'BRL' | 'USD') => string;
  usdBalance?: number;
  brlBalance?: number;
  exchangeRate?: number;
}

export function MetricCard({ metrics, formatValue, usdBalance = 0, brlBalance = 0, exchangeRate = 5.50 }: MetricCardProps) {
  const cards = [
    {
      title: 'Lucro Total do Ciclo',
      value: formatValue(metrics.totalCycleProfit),
      icon: TrendingUp,
      textColor: metrics.totalCycleProfit >= 0 ? 'text-green-400' : 'text-red-400',
      glow: metrics.totalCycleProfit >= 0 ? 'win-glow' : 'loss-glow'
    },
    {
      title: 'Taxa de Acerto',
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Target,
      textColor: metrics.winRate >= 50 ? 'text-green-400' : 'text-red-400',
      glow: metrics.winRate >= 50 ? 'win-glow' : 'loss-glow'
    },
    {
      title: 'Saldo Atual',
      value: (
        <div className="space-y-1">
          <div className="text-lg font-bold">
            {usdBalance !== 0 && (
              <div className={metrics.currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatValue(usdBalance, 'USD')}
              </div>
            )}
            <div className={`text-xl ${metrics.currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatValue(metrics.currentBalance, 'BRL')}
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
      textColor: metrics.currentBalance >= 0 ? 'text-green-400' : 'text-red-400',
      glow: metrics.currentBalance >= 0 ? 'win-glow' : 'loss-glow'
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
