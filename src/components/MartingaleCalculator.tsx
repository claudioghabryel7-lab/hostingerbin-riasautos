'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface MartingaleLevel {
  level: number;
  stake: number;
  profit: number;
  totalStake: number;
  totalProfit: number;
}

export function MartingaleCalculator() {
  const [initialValue, setInitialValue] = useState<string>('1.00');
  const [profitPercentage, setProfitPercentage] = useState<string>('80');
  const [levels, setLevels] = useState<string>('10');
  const [results, setResults] = useState<MartingaleLevel[]>([]);

  const calculateMartingale = () => {
    const initial = parseFloat(initialValue) || 1;
    const profitPercent = parseFloat(profitPercentage) || 80;
    const maxLevels = parseInt(levels) || 10;

    const calculatedLevels: MartingaleLevel[] = [];
    let totalInvested = 0;
    let totalProfit = 0;

    for (let level = 1; level <= maxLevels; level++) {
      // Valor investido neste nível
      let stakeValue = initial;
      
      // Para soros, o valor investido do próximo nível é o valor total da última operação
      if (level > 1) {
        const previousLevel = calculatedLevels[level - 2]; // level - 2 porque array é 0-based
        const previousTotal = previousLevel.stake + previousLevel.profit;
        stakeValue = previousTotal;
      }
      
      // Ganho líquido (porcentagem sobre o valor investido)
      const netGain = stakeValue * (profitPercent / 100);
      
      // Valor líquido (valor investido + ganho líquido)
      const netValue = stakeValue + netGain;
      
      totalInvested += stakeValue;
      totalProfit += netGain;

      calculatedLevels.push({
        level,
        stake: stakeValue, // Valor investido
        profit: netGain, // Ganho líquido
        totalStake: totalInvested, // Valor total investido acumulado
        totalProfit: totalProfit // Lucro total acumulado
      });
    }

    setResults(calculatedLevels);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="initialValue" className="text-white/80">Valor Inicial (R$)</Label>
          <Input
            id="initialValue"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="1,00"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            className="glass-dark border-white/10 text-white bg-white/5"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="profitPercentage" className="text-white/80">Porcentagem de Lucro (%)</Label>
          <Input
            id="profitPercentage"
            type="number"
            step="0.1"
            min="1"
            max="200"
            placeholder="80"
            value={profitPercentage}
            onChange={(e) => setProfitPercentage(e.target.value)}
            className="glass-dark border-white/10 text-white bg-white/5"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="levels" className="text-white/80">Níveis do Soros</Label>
          <Input
            id="levels"
            type="number"
            min="1"
            max="20"
            placeholder="10"
            value={levels}
            onChange={(e) => setLevels(e.target.value)}
            className="glass-dark border-white/10 text-white bg-white/5"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={calculateMartingale}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calcular Soros
        </Button>
        {results.length > 0 && (
          <Button
            onClick={clearResults}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Warning */}
      {results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-400">
              <p className="font-medium mb-1">Atenção: Risco Elevado</p>
              <p className="text-yellow-300/80">
                A estratégia de soros (Martingale) é extremamente arriscada. 
                Use apenas para fins educacionais e nunca com dinheiro real.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-dark border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">
                Resultado do Cálculo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-white/5">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{results.length}</div>
                    <div className="text-sm text-white/60">Níveis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(results[results.length - 1].totalStake)}
                    </div>
                    <div className="text-sm text-white/60">Investimento Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(results[results.length - 1].totalProfit)}
                    </div>
                    <div className="text-sm text-white/60">Lucro Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {((results[results.length - 1].totalProfit / results[results.length - 1].totalStake) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-white/60">ROI</div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 text-white/80">Nível</th>
                        <th className="text-right p-2 text-white/80">Valor investido</th>
                        <th className="text-right p-2 text-white/80">Ganho líquido (Payout)</th>
                        <th className="text-right p-2 text-white/80">Valor total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((level, index) => (
                        <motion.tr
                          key={level.level}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <td className="p-2 text-white font-medium">{level.level}</td>
                          <td className="p-2 text-right text-white">
                            {formatCurrency(level.stake)}
                          </td>
                          <td className="p-2 text-right text-green-400">
                            {formatCurrency(level.profit)}
                          </td>
                          <td className="p-2 text-right text-blue-400">
                            {formatCurrency(level.stake + level.profit)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Risk Warning */}
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="text-sm text-red-400">
                      <p className="font-medium mb-1">Aviso Importante</p>
                      <p className="text-red-300/80">
                        Para cobrir {results.length} perdas consecutivas, você precisaria de{' '}
                        <span className="font-bold text-white">
                          {formatCurrency(results[results.length - 1].totalStake)}
                        </span>.
                        {' '}Isso representa um risco extremamente elevado que pode levar à perda total do capital.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
