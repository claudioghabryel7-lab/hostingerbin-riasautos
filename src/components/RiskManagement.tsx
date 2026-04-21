'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Calculator, Target } from 'lucide-react';
import { Transaction } from '@/types';

interface RiskManagementProps {
  transactions: Transaction[];
}

export function RiskManagement({ transactions }: RiskManagementProps) {
  const [balance, setBalance] = useState(1000);
  const [riskPercentage, setRiskPercentage] = useState(2);
  const [stopLoss, setStopLoss] = useState(10);
  const [takeProfit, setTakeProfit] = useState(20);

  // Calcular métricas de risco
  const calculateRiskMetrics = () => {
    if (transactions.length === 0) return null;

    const wins = transactions.filter(t => t.result === 'win');
    const losses = transactions.filter(t => t.result === 'loss');
    
    const avgWin = wins.reduce((sum, t) => sum + t.profit, 0) / wins.length || 0;
    const avgLoss = Math.abs(losses.reduce((sum, t) => sum + t.profit, 0) / losses.length) || 0;
    
    const currentStreak = calculateCurrentStreak();
    const maxWinStreak = calculateMaxStreak('win');
    const maxLossStreak = calculateMaxStreak('loss');
    
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    const winRate = (wins.length / transactions.length) * 100;
    
    return {
      avgWin,
      avgLoss,
      currentStreak,
      maxWinStreak,
      maxLossStreak,
      riskRewardRatio,
      winRate,
      totalWins: wins.length,
      totalLosses: losses.length
    };
  };

  const calculateCurrentStreak = () => {
    let streak = 0;
    for (let i = transactions.length - 1; i >= 0; i--) {
      if (transactions[i].result === 'win') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateMaxStreak = (type: 'win' | 'loss') => {
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const transaction of transactions) {
      if (transaction.result === type) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  };

  const calculateRecommendedAmount = () => {
    return (balance * riskPercentage) / 100;
  };

  const metrics = calculateRiskMetrics();

  const getRiskLevel = () => {
    if (!metrics) return 'low';
    
    const { currentStreak, maxLossStreak, winRate } = metrics;
    
    if (currentStreak >= 3 || winRate >= 70) return 'low';
    if (currentStreak <= -2 || maxLossStreak >= 3 || winRate <= 40) return 'high';
    return 'medium';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Gerenciamento de Risco</h3>
        <Badge className={getRiskBadgeColor(riskLevel)}>
          Risco {riskLevel === 'low' ? 'Baixo' : riskLevel === 'medium' ? 'Médio' : 'Alto'}
        </Badge>
      </div>

      {/* Risk Calculator */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Risco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="balance" className="text-white/80">Saldo (BRL)</Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="glass-dark border-white/10 text-white bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="risk" className="text-white/80">Risco por Operação (%)</Label>
              <Input
                id="risk"
                type="number"
                value={riskPercentage}
                onChange={(e) => setRiskPercentage(Number(e.target.value))}
                className="glass-dark border-white/10 text-white bg-white/5"
              />
            </div>
          </div>
          
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Valor recomendado por operação:</span>
              <span className="text-xl font-bold text-blue-400">
                R$ {calculateRecommendedAmount().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stoploss" className="text-white/80">Stop Loss (%)</Label>
              <Input
                id="stoploss"
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="glass-dark border-white/10 text-white bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="takeprofit" className="text-white/80">Take Profit (%)</Label>
              <Input
                id="takeprofit"
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
                className="glass-dark border-white/10 text-white bg-white/5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      {metrics && (
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Métricas de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60">Sequência Atual</div>
                <div className={`text-lg font-bold ${metrics.currentStreak >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.currentStreak >= 0 ? '+' : ''}{metrics.currentStreak}
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60">Taxa de Acerto</div>
                <div className="text-lg font-bold text-white">
                  {metrics.winRate.toFixed(1)}%
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60">Maior Sequência de Wins</div>
                <div className="text-lg font-bold text-green-400">
                  {metrics.maxWinStreak}
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60">Maior Sequência de Loss</div>
                <div className="text-lg font-bold text-red-400">
                  {metrics.maxLossStreak}
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60">Ganho Médio</div>
                <div className="text-lg font-bold text-green-400">
                  R$ {metrics.avgWin.toFixed(2)}
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60">Perda Média</div>
                <div className="text-lg font-bold text-red-400">
                  R$ {metrics.avgLoss.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-white/60">Risco/Retorno</div>
              <div className="text-lg font-bold text-white">
                1:{metrics.riskRewardRatio.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Recommendations */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics && (
              <>
                {metrics.currentStreak >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Ótima sequência! Considere reduzir o risco para proteger os ganhos.</span>
                    </div>
                  </motion.div>
                )}
                
                {metrics.currentStreak <= -2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-red-400">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm">Sequência de perdas! Reduza o risco e faça uma pausa.</span>
                    </div>
                  </motion.div>
                )}
                
                {metrics.winRate < 40 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Taxa de acerto baixa. Reveja sua estratégia.</span>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-blue-400 text-sm">
                <strong>Regra de Ouro:</strong> Nunca arrisque mais de 2% do seu saldo em uma única operação.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
