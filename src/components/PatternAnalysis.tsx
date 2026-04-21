'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Clock, 
  Target,
  Brain,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '@/types';

interface PatternAnalysisProps {
  transactions: Transaction[];
}

export function PatternAnalysis({ transactions }: PatternAnalysisProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('day');

  // Analisar padrões de trading
  const analyzePatterns = () => {
    if (transactions.length === 0) return null;

    const patterns = {
      bestTimeOfDay: findBestTimeOfDay(),
      bestAsset: findBestAsset(),
      consecutivePatterns: findConsecutivePatterns(),
      volatilityPatterns: findVolatilityPatterns(),
      recoveryPatterns: findRecoveryPatterns(),
      riskiestTime: findRiskiestTime()
    };

    return patterns;
  };

  const findBestTimeOfDay = () => {
    const timeGroups = transactions.reduce((acc, t) => {
      const hour = new Date(t.date).getHours();
      const timeSlot = getTimeSlot(hour);
      if (!acc[timeSlot]) {
        acc[timeSlot] = { wins: 0, losses: 0, total: 0 };
      }
      acc[timeSlot].total++;
      if (t.result === 'win') acc[timeSlot].wins++;
      else acc[timeSlot].losses++;
      return acc;
    }, {} as Record<string, { wins: number; losses: number; total: number }>);

    let bestTime = '';
    let bestWinRate = 0;

    Object.entries(timeGroups).forEach(([time, data]) => {
      const winRate = (data.wins / data.total) * 100;
      if (winRate > bestWinRate && data.total >= 3) {
        bestWinRate = winRate;
        bestTime = time;
      }
    });

    return { time: bestTime, winRate: bestWinRate, sample: timeGroups[bestTime]?.total || 0 };
  };

  const getTimeSlot = (hour: number): string => {
    if (hour >= 6 && hour < 12) return 'Manhã (6h-12h)';
    if (hour >= 12 && hour < 18) return 'Tarde (12h-18h)';
    if (hour >= 18 && hour < 24) return 'Noite (18h-24h)';
    return 'Madrugada (0h-6h)';
  };

  const findBestAsset = () => {
    const assetGroups = transactions.reduce((acc, t) => {
      if (!acc[t.asset]) {
        acc[t.asset] = { wins: 0, losses: 0, total: 0, profit: 0 };
      }
      acc[t.asset].total++;
      acc[t.asset].profit += t.profit;
      if (t.result === 'win') acc[t.asset].wins++;
      else acc[t.asset].losses++;
      return acc;
    }, {} as Record<string, { wins: number; losses: number; total: number; profit: number }>);

    let bestAsset = '';
    let bestProfit = -Infinity;

    Object.entries(assetGroups).forEach(([asset, data]) => {
      if (data.profit > bestProfit && data.total >= 3) {
        bestProfit = data.profit;
        bestAsset = asset;
      }
    });

    return { 
      asset: bestAsset, 
      profit: bestProfit, 
      winRate: assetGroups[bestAsset] ? (assetGroups[bestAsset].wins / assetGroups[bestAsset].total) * 100 : 0,
      sample: assetGroups[bestAsset]?.total || 0
    };
  };

  const findConsecutivePatterns = () => {
    const patterns = {
      winAfterWin: 0,
      winAfterLoss: 0,
      lossAfterWin: 0,
      lossAfterLoss: 0,
      total: 0
    };

    for (let i = 1; i < transactions.length; i++) {
      const prev = transactions[i - 1];
      const curr = transactions[i];
      
      patterns.total++;
      
      if (prev.result === 'win' && curr.result === 'win') patterns.winAfterWin++;
      else if (prev.result === 'loss' && curr.result === 'win') patterns.winAfterLoss++;
      else if (prev.result === 'win' && curr.result === 'loss') patterns.lossAfterWin++;
      else if (prev.result === 'loss' && curr.result === 'loss') patterns.lossAfterLoss++;
    }

    return patterns;
  };

  const findVolatilityPatterns = () => {
    const dailyResults = transactions.reduce((acc, t) => {
      const day = new Date(t.date).toDateString();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(t.profit);
      return acc;
    }, {} as Record<string, number[]>);

    const volatilityScores = Object.values(dailyResults).map(day => {
      const mean = day.reduce((sum, val) => sum + val, 0) / day.length;
      const variance = day.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / day.length;
      return Math.sqrt(variance);
    });

    const avgVolatility = volatilityScores.reduce((sum, val) => sum + val, 0) / volatilityScores.length;
    const maxVolatility = Math.max(...volatilityScores);

    return {
      average: avgVolatility,
      maximum: maxVolatility,
      isHigh: avgVolatility > 50
    };
  };

  const findRecoveryPatterns = () => {
    let recoveryCount = 0;
    let totalLossStreaks = 0;

    let currentStreak = 0;
    for (const transaction of transactions) {
      if (transaction.result === 'loss') {
        currentStreak--;
        totalLossStreaks++;
      } else {
        if (currentStreak < 0) {
          recoveryCount++;
        }
        currentStreak = 0;
      }
    }

    return {
      recoveryRate: totalLossStreaks > 0 ? (recoveryCount / totalLossStreaks) * 100 : 0,
      totalRecoveries: recoveryCount,
      totalLossStreaks
    };
  };

  const findRiskiestTime = () => {
    const timeGroups = transactions.reduce((acc, t) => {
      const hour = new Date(t.date).getHours();
      const timeSlot = getTimeSlot(hour);
      if (!acc[timeSlot]) {
        acc[timeSlot] = { losses: 0, total: 0, avgLoss: 0 };
      }
      acc[timeSlot].total++;
      if (t.result === 'loss') {
        acc[timeSlot].losses++;
        acc[timeSlot].avgLoss += Math.abs(t.profit);
      }
      return acc;
    }, {} as Record<string, { losses: number; total: number; avgLoss: number }>);

    // Calcular média de perdas por período
    Object.keys(timeGroups).forEach(time => {
      if (timeGroups[time].losses > 0) {
        timeGroups[time].avgLoss = timeGroups[time].avgLoss / timeGroups[time].losses;
      }
    });

    let riskiestTime = '';
    let highestLossRate = 0;

    Object.entries(timeGroups).forEach(([time, data]) => {
      const lossRate = (data.losses / data.total) * 100;
      if (lossRate > highestLossRate && data.total >= 3) {
        highestLossRate = lossRate;
        riskiestTime = time;
      }
    });

    return { 
      time: riskiestTime, 
      lossRate: highestLossRate, 
      avgLoss: timeGroups[riskiestTime]?.avgLoss || 0,
      sample: timeGroups[riskiestTime]?.total || 0
    };
  };

  const patterns = analyzePatterns();

  const getPatternStrength = (winRate: number, sample: number) => {
    if (sample < 3) return 'insufficient';
    if (winRate >= 70) return 'strong';
    if (winRate >= 60) return 'moderate';
    return 'weak';
  };

  const getPatternColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'weak': return 'text-red-400';
      case 'insufficient': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPatternBadgeColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'weak': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'insufficient': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Análise de Padrões</h3>
      </div>

      {patterns ? (
        <>
          {/* Best Time Pattern */}
          <Card className="glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Melhor Horário para Operar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patterns.bestTimeOfDay.time ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Período:</span>
                    <span className="text-white font-medium">{patterns.bestTimeOfDay.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Taxa de Acerto:</span>
                    <span className="text-green-400 font-bold">
                      {patterns.bestTimeOfDay.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Amostra:</span>
                    <span className="text-white">{patterns.bestTimeOfDay.sample} operações</span>
                  </div>
                  <Badge className={getPatternBadgeColor(
                    getPatternStrength(patterns.bestTimeOfDay.winRate, patterns.bestTimeOfDay.sample)
                  )}>
                    Padrão {getPatternStrength(patterns.bestTimeOfDay.winRate, patterns.bestTimeOfDay.sample) === 'strong' ? 'Forte' :
                           getPatternStrength(patterns.bestTimeOfDay.winRate, patterns.bestTimeOfDay.sample) === 'moderate' ? 'Moderado' :
                           getPatternStrength(patterns.bestTimeOfDay.winRate, patterns.bestTimeOfDay.sample) === 'weak' ? 'Fraco' : 'Insuficiente'}
                  </Badge>
                </div>
              ) : (
                <p className="text-white/60">Dados insuficientes para análise</p>
              )}
            </CardContent>
          </Card>

          {/* Best Asset Pattern */}
          <Card className="glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Melhor Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patterns.bestAsset.asset ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Ativo:</span>
                    <span className="text-white font-medium">{patterns.bestAsset.asset}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Lucro Total:</span>
                    <span className="text-green-400 font-bold">
                      R$ {patterns.bestAsset.profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Taxa de Acerto:</span>
                    <span className="text-green-400 font-bold">
                      {patterns.bestAsset.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <Badge className={getPatternBadgeColor(
                    getPatternStrength(patterns.bestAsset.winRate, patterns.bestAsset.sample)
                  )}>
                    Padrão {getPatternStrength(patterns.bestAsset.winRate, patterns.bestAsset.sample) === 'strong' ? 'Forte' :
                           getPatternStrength(patterns.bestAsset.winRate, patterns.bestAsset.sample) === 'moderate' ? 'Moderado' :
                           getPatternStrength(patterns.bestAsset.winRate, patterns.bestAsset.sample) === 'weak' ? 'Fraco' : 'Insuficiente'}
                  </Badge>
                </div>
              ) : (
                <p className="text-white/60">Dados insuficientes para análise</p>
              )}
            </CardContent>
          </Card>

          {/* Riskiest Time */}
          <Card className="glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Período de Maior Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patterns.riskiestTime.time ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Período:</span>
                    <span className="text-red-400 font-medium">{patterns.riskiestTime.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Taxa de Perda:</span>
                    <span className="text-red-400 font-bold">
                      {patterns.riskiestTime.lossRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Perda Média:</span>
                    <span className="text-red-400 font-bold">
                      R$ {patterns.riskiestTime.avgLoss.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">
                      Evite operar neste período ou reduza significativamente o risco.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-white/60">Dados insuficientes para análise</p>
              )}
            </CardContent>
          </Card>

          {/* Consecutive Patterns */}
          <Card className="glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Padrões de Sequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60">Win após Win</div>
                    <div className="text-lg font-bold text-green-400">
                      {patterns.consecutivePatterns.total > 0 ? 
                        ((patterns.consecutivePatterns.winAfterWin / patterns.consecutivePatterns.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60">Win após Loss</div>
                    <div className="text-lg font-bold text-blue-400">
                      {patterns.consecutivePatterns.total > 0 ? 
                        ((patterns.consecutivePatterns.winAfterLoss / patterns.consecutivePatterns.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60">Loss após Win</div>
                    <div className="text-lg font-bold text-red-400">
                      {patterns.consecutivePatterns.total > 0 ? 
                        ((patterns.consecutivePatterns.lossAfterWin / patterns.consecutivePatterns.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60">Loss após Loss</div>
                    <div className="text-lg font-bold text-orange-400">
                      {patterns.consecutivePatterns.total > 0 ? 
                        ((patterns.consecutivePatterns.lossAfterLoss / patterns.consecutivePatterns.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    <strong>Insight:</strong> {patterns.consecutivePatterns.winAfterLoss > patterns.consecutivePatterns.winAfterWin ? 
                      "Você tende a se recuperar bem após perdas. Continue confiante!" :
                      "Você tem mais sucesso em sequências de vitórias. Mantenha o momentum!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Patterns */}
          <Card className="glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Padrões de Recuperação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Taxa de Recuperação:</span>
                  <span className="text-blue-400 font-bold">
                    {patterns.recoveryPatterns.recoveryRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Recuperações Totais:</span>
                  <span className="text-white">{patterns.recoveryPatterns.totalRecoveries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Sequências de Perda:</span>
                  <span className="text-white">{patterns.recoveryPatterns.totalLossStreaks}</span>
                </div>
                
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-400 text-sm">
                    {patterns.recoveryPatterns.recoveryRate >= 70 ? 
                      "Excelente capacidade de recuperação! Você se recupera bem das perdas." :
                      patterns.recoveryPatterns.recoveryRate >= 50 ?
                      "Boa capacidade de recuperação. Considere analisar o que funciona." :
                      "Trabalhe na sua recuperação. Faça pausas após perdas."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="glass-dark border-white/10">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Faça pelo menos 10 operações para ver a análise de padrões</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
