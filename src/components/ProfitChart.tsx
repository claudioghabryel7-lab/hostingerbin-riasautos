'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Transaction } from '@/types';

interface ProfitChartProps {
  transactions: Transaction[];
}

export function ProfitChart({ transactions }: ProfitChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Agrupar transações por dia
  const dailyData = transactions.reduce((acc, transaction) => {
    const dateKey = transaction.date.toLocaleDateString('pt-BR');
    if (!acc[dateKey]) {
      acc[dateKey] = { profit: 0, wins: 0, losses: 0 };
    }
    acc[dateKey].profit += transaction.netProfit;
    if (transaction.type === 'win') {
      acc[dateKey].wins++;
    } else {
      acc[dateKey].losses++;
    }
    return acc;
  }, {} as Record<string, { profit: number; wins: number; losses: number }>);

  const sortedDates = Object.keys(dailyData).sort((a, b) => {
    const dateA = new Date(a.split('/').reverse().join('-'));
    const dateB = new Date(b.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });

  const last7Days = sortedDates.slice(0, 7).reverse();

  const maxProfit = Math.max(...last7Days.map(date => Math.abs(dailyData[date].profit)), 1);

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-dark border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gráfico de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-white/60">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sem dados para exibir</p>
              <p className="text-sm mt-2">Adicione operações para ver o gráfico</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-dark border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráfico de Lucro (Últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {last7Days.map((date, index) => {
              const data = dailyData[date];
              const height = Math.abs(data.profit) / maxProfit * 100;
              const isPositive = data.profit >= 0;
              
              return (
                <motion.div
                  key={date}
                  className="flex-1 flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="relative w-full flex flex-col items-center">
                    <span className={`text-xs font-medium mb-1 ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(Math.abs(data.profit))}
                    </span>
                    <div
                      className={`w-full rounded-t transition-all hover:opacity-80 ${
                        isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/60 text-center">
                    <div>{date.split('/')[0]}/{date.split('/')[1]}</div>
                    <div className="text-xs opacity-70">
                      {data.wins}W/{data.losses}L
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-white/60">Lucro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-white/60">Prejuízo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
