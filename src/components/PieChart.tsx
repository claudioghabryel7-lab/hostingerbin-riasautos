'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '@/types';

interface PieChartProps {
  transactions: Transaction[];
}

export function PieChart({ transactions }: PieChartProps) {
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
              <PieChartIcon className="h-5 w-5" />
              Distribuição Wins/Losses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">0</div>
              <div className="text-white/60">Nenhuma operação registrada</div>
              <div className="text-sm text-white/40 mt-2">
                Adicione operações para ver a distribuição
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const winPercentage = (wins / total) * 100;
  const lossPercentage = (losses / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-dark border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribuição Wins/Losses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Gráfico de Pizza Moderno */}
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Círculo de fundo */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="20"
                />
                
                {/* Arco de Wins */}
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
                />
                
                {/* Arco de Losses */}
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
                />
              </svg>
              
              {/* Centro do gráfico */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center transform rotate-90">
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
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Wins</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{wins}</div>
                    <div className="text-sm text-green-400">{winPercentage.toFixed(1)}%</div>
                  </div>
                </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-red-400 font-semibold">LOSSES</span>
                </div>
                <div className="text-2xl font-bold text-white">{losses}</div>
                <div className="text-sm text-white/60">{lossPercentage.toFixed(1)}%</div>
              </motion.div>
            </div>

            {/* Taxa de Acerto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="w-full p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="text-center">
                <div className="text-sm text-white/60 mb-1">Taxa de Acerto</div>
                <div className={`text-3xl font-bold ${
                  winPercentage >= 50 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {winPercentage.toFixed(1)}%
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
