'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { Period } from '@/types/period';

export type { Period } from '@/types/period';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const periods = [
    {
      value: 'day' as Period,
      name: 'Hoje',
      description: 'Operações do dia',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/50'
    },
    {
      value: 'week' as Period,
      name: 'Semana',
      description: 'Operações da semana',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/50'
    },
    {
      value: 'month' as Period,
      name: 'Mês',
      description: 'Operações do mês',
      icon: Clock,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/50'
    },
    {
      value: 'all' as Period,
      name: 'Tudo',
      description: 'Todas as operações',
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-400/50'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-white/80">Período do Saldo</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {periods.map((period) => {
          const Icon = period.icon;
          const isSelected = selectedPeriod === period.value;
          
          return (
            <motion.div
              key={period.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? `${period.bgColor} ${period.borderColor} border-2 ring-2 ring-white/30`
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => onPeriodChange(period.value)}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Icon className={`h-4 w-4 ${period.color}`} />
                    <div className="font-medium text-white text-sm">
                      {period.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {period.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function getPeriodDates(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      start.setTime(weekAgo.getTime());
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'all':
      return { start: new Date(0), end: new Date() };
  }

  return { start, end };
}
