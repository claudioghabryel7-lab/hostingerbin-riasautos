'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
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
            <div className="text-center py-8 text-white/60">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sem dados para exibir</p>
              <p className="text-sm mt-2">Adicione operações para ver o gráfico</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const winPercentage = (wins / total) * 100;
  const lossPercentage = (losses / total) * 100;

  // Configurações do gráfico de pizza
  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Ângulos em graus
  const winAngle = (winPercentage / 100) * 360;
  const lossAngle = (lossPercentage / 100) * 360;

  // Coordenadas para os arcos SVG
  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", center, center,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

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
          <div className="flex flex-col items-center space-y-6">
            {/* Gráfico de Pizza SVG */}
            <div className="relative">
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Arco de Losses */}
                <motion.path
                  d={createArcPath(0, lossAngle)}
                  fill="#ef4444"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{
                    stroke: 'none',
                    transformOrigin: 'center'
                  }}
                />
                {/* Arco de Wins */}
                <motion.path
                  d={createArcPath(lossAngle, lossAngle + winAngle)}
                  fill="#10b981"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{
                    stroke: 'none',
                    transformOrigin: 'center'
                  }}
                />
              </svg>
              
              {/* Texto central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-white">{total}</div>
                <div className="text-sm text-white/60">Operações</div>
              </div>
            </div>

            {/* Legendas e Estatísticas */}
            <div className="grid grid-cols-2 gap-6 w-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-green-400 font-semibold">WINS</span>
                </div>
                <div className="text-2xl font-bold text-white">{wins}</div>
                <div className="text-sm text-white/60">{winPercentage.toFixed(1)}%</div>
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
