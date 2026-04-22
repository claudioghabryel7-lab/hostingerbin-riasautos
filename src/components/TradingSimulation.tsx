'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, TrendingUp, TrendingDown, DollarSign, Calendar, Target, AlertCircle } from 'lucide-react';

interface DayResult {
  day: number;
  result: 'win' | 'loss';
  investment: number;
  martingaleLevel: number;
  profit: number;
  balance: number;
  cumulativeProfit: number;
}

interface SimulationConfig {
  investment: number;
  soros: number;
  payout: number;
  days: number;
  wins: number;
  losses: number;
}

export function TradingSimulation() {
  const [config, setConfig] = useState<SimulationConfig>({
    investment: 10,
    soros: 4,
    payout: 80,
    days: 30,
    wins: 5,
    losses: 25
  });

  const [result, setResult] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = () => {
    setIsRunning(true);
    
    // Calcular resultado final com Soros
    let totalWins = 0;
    let totalLosses = 0;
    
    // Calcular losses (simplesmente perde o investimento)
    totalLosses = config.losses * config.investment;
    
    // Calcular wins - todos usam o nível máximo de Soros
    if (config.wins > 0) {
      // Calcular o valor do nível máximo usando a fórmula correta
      let valorAtual = config.investment;
      
      for (let i = 1; i <= config.soros; i++) {
        // Cada nível calcula o payout sobre o valor atual
        const ganhoPayout = valorAtual * (config.payout / 100);
        valorAtual = valorAtual + ganhoPayout;
      }
      
      // O valor final do nível máximo
      const valorNivelMaximo = valorAtual;
      
      totalWins = config.wins * valorNivelMaximo;
    }
    
    const finalValue = totalWins - totalLosses;
    
    setResult(finalValue);
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setResult(null);
  };

  const updateConfig = (key: keyof SimulationConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Simulação de Trading</h2>
        <p className="text-white/60">Simule operações com estratégia Martingale</p>
      </div>

      {/* Configuration */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configuração da Simulação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Investimento Diário ($)</label>
              <input
                type="number"
                value={config.investment}
                onChange={(e) => updateConfig('investment', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="1000"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/60">Soros (Níveis)</label>
              <input
                type="number"
                value={config.soros}
                onChange={(e) => updateConfig('soros', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/60">Payout (%)</label>
              <input
                type="number"
                value={config.payout}
                onChange={(e) => updateConfig('payout', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/60">Dias de Simulação</label>
              <input
                type="number"
                value={config.days}
                onChange={(e) => updateConfig('days', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="365"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/60">Wins</label>
              <input
                type="number"
                value={config.wins}
                onChange={(e) => updateConfig('wins', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="0"
                max={config.days}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/60">Losses</label>
              <input
                type="number"
                value={config.losses}
                onChange={(e) => updateConfig('losses', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="0"
                max={config.days}
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <Button
              onClick={runSimulation}
              disabled={isRunning}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Executando...' : 'Executar Simulação'}
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result !== null && (
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultado Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                result >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${result.toFixed(2)}
              </div>
              <div className="text-white/60">
                {result >= 0 ? 'Lucro' : 'Prejuízo'}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2">Cálculo com Soros:</h4>
              <div className="space-y-2 text-xs text-white/60">
                <div className="font-semibold text-blue-400">Estratégia Soros - Nível Máximo:</div>
                {config.wins > 0 && (
                  <div className="ml-4 space-y-1">
                    <div>Cálculo por nível (payout sobre valor atual):</div>
                    {(() => {
                      const niveis = [];
                      let valorAtual = config.investment;
                      
                      for (let i = 1; i <= config.soros; i++) {
                        const ganhoPayout = valorAtual * (config.payout / 100);
                        const valorTotal = valorAtual + ganhoPayout;
                        
                        niveis.push({
                          nivel: i,
                          valorAntes: valorAtual,
                          ganhoPayout: ganhoPayout,
                          valorTotal: valorTotal
                        });
                        
                        valorAtual = valorTotal;
                      }
                      
                      return niveis.map((n) => (
                        <div key={n.nivel} className="ml-4">
                          Nível {n.nivel}: ${n.valorAntes.toFixed(2)} + ${n.ganhoPayout.toFixed(2)} = ${n.valorTotal.toFixed(2)}
                        </div>
                      ));
                    })()}
                    
                    <div className="font-bold text-green-400">
                      Valor Final Nível {config.soros}: ${(() => {
                        let valorAtual = config.investment;
                        for (let i = 1; i <= config.soros; i++) {
                          const ganhoPayout = valorAtual * (config.payout / 100);
                          valorAtual = valorAtual + ganhoPayout;
                        }
                        return valorAtual.toFixed(2);
                      })()}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-white/20">
                  <div>Total Wins: {config.wins} x ${(() => {
                    let valorAtual = config.investment;
                    for (let i = 1; i <= config.soros; i++) {
                      const ganhoPayout = valorAtual * (config.payout / 100);
                      valorAtual = valorAtual + ganhoPayout;
                    }
                    return valorAtual.toFixed(2);
                  })()} = ${(config.wins * (() => {
                    let valorAtual = config.investment;
                    for (let i = 1; i <= config.soros; i++) {
                      const ganhoPayout = valorAtual * (config.payout / 100);
                      valorAtual = valorAtual + ganhoPayout;
                    }
                    return valorAtual;
                  })()).toFixed(2)}</div>
                  <div>Total Losses: {config.losses} x ${config.investment.toFixed(2)} = ${(config.losses * config.investment).toFixed(2)}</div>
                  <div className="pt-2 font-bold text-white">
                    Final: ${(config.wins * (() => {
                      let valorAtual = config.investment;
                      for (let i = 1; i <= config.soros; i++) {
                        const ganhoPayout = valorAtual * (config.payout / 100);
                        valorAtual = valorAtual + ganhoPayout;
                      }
                      return valorAtual;
                    })() - config.losses * config.investment).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
