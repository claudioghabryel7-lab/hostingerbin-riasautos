'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Activity,
  Zap,
  Shield
} from 'lucide-react';
import { Transaction } from '@/types';

interface TradingStrategiesProps {
  transactions: Transaction[];
}

export function TradingStrategies({ transactions }: TradingStrategiesProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Estratégias com indicadores de alta assertividade
  const strategies = [
    {
      id: 'rsi_stochastic',
      name: 'RSI + Stochastic Oversold',
      description: 'Combinação de RSI e Stochastic para identificar pontos de entrada sobrevendidos',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-green-400',
      accuracy: '85%',
      indicators: ['RSI (14)', 'Stochastic (14,3,3)'],
      timeframe: 'M5 - M15',
      assets: ['EUR/USD', 'GBP/USD', 'AUD/USD'],
      rules: [
        'RSI abaixo de 30 (sobrevendido)',
        'Stochastic %K cruzando %D para cima abaixo de 20',
        'Confirmar com padrão de velas de reversão',
        'Entrada na próxima vela após confirmação',
        'Stop Loss 2% abaixo da entrada',
        'Take Profit 3:1'
      ],
      pros: [
        'Alta precisão em mercados laterais',
        'Múltiplas confirmações reduzem falsos sinais',
        'Funciona bem em pares de moedas principais'
      ],
      cons: [
        'Menos frequente que outras estratégias',
        'Requer paciência para esperar setup perfeito',
        'Pode falhar em tendências fortes'
      ],
      risk: 'Médio'
    },
    {
      id: 'bollinger_bounce',
      name: 'Bollinger Bands Bounce',
      description: 'Utiliza Bollinger Bands para identificar reversões nas bandas extremas',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-blue-400',
      accuracy: '82%',
      indicators: ['Bollinger Bands (20,2)', 'RSI (14)'],
      timeframe: 'M1 - M5',
      assets: ['EUR/USD', 'USD/JPY', 'GBP/JPY'],
      rules: [
        'Preço toca ou ultrapassa banda inferior (compra) ou superior (venda)',
        'RSI deve estar abaixo de 30 (compra) ou acima de 70 (venda)',
        'Aguardar 1-2 velas de confirmação',
        'Entrada na reversão para dentro das bandas',
        'Stop Loss fora da banda',
        'Take Profit na banda oposta ou linha média'
      ],
      pros: [
        'Setup visual claro e fácil de identificar',
        'Alta taxa de acerto em mercados voláteis',
        'Risco/recompensa bem definido'
      ],
      cons: [
        'Falsos breakouts podem ocorrer',
        'Requer monitoramento constante',
        'Menos eficaz em mercados com baixa volatilidade'
      ],
      risk: 'Médio-Alto'
    },
    {
      id: 'macd_divergence',
      name: 'MACD Divergence Strategy',
      description: 'Identifica divergências entre preço e MACD para prever reversões',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-400',
      accuracy: '78%',
      indicators: ['MACD (12,26,9)', 'RSI (14)'],
      timeframe: 'M15 - H1',
      assets: ['EUR/USD', 'GBP/USD', 'USD/CHF'],
      rules: [
        'Identificar divergência baixista (preço alta, MACD baixa) ou altista (preço baixa, MACD alta)',
        'RSI deve confirmar a divergência',
        'Aguardar cruzamento MACD para confirmar entrada',
        'Entrada após padrão de reversão de velas',
        'Stop Loss no último máximo/mínimo',
        'Take Profit 2-3x o risco'
      ],
      pros: [
        'Sinais de alta confiabilidade',
        'Funciona bem em múltiplos timeframes',
        'Antecipa reversões significativas'
      ],
      cons: [
        'Requer experiência para identificar divergências',
        'Sinais menos frequentes',
        'Pode ser tardio em mercados rápidos'
      ],
      risk: 'Médio'
    },
    {
      id: 'ema_crossover',
      name: 'EMA Crossover with Volume',
      description: 'Cruzamento de EMAs confirmado por volume para entradas precisas',
      icon: <Zap className="h-5 w-5" />,
      color: 'text-yellow-400',
      accuracy: '75%',
      indicators: ['EMA 9/21', 'Volume', 'RSI (14)'],
      timeframe: 'M5 - M15',
      assets: ['Todos os pares principais'],
      rules: [
        'EMA 9 cruzando EMA 21 para cima (compra) ou para baixo (venda)',
        'Volume deve aumentar significativamente no cruzamento',
        'RSI deve estar acima de 50 (compra) ou abaixo de 50 (venda)',
        'Entrada após confirmação do cruzamento',
        'Stop Loss no último swing',
        'Take Profit 2:1 ou próximo suporte/resistência'
      ],
      pros: [
        'Sinais claros e objetivos',
        'Volume adiciona confirmação extra',
        'Funciona bem em mercados com tendência'
      ],
      cons: [
        'Falsos cruzamentos em mercados laterais',
        'Pode ser tardio em reversões rápidas',
        'Requer análise de múltiplos indicadores'
      ],
      risk: 'Médio'
    },
    {
      id: 'fibonacci_retracement',
      name: 'Fibonacci Retracement Levels',
      description: 'Usa níveis de Fibonacci para identificar suportes e resistências',
      icon: <Target className="h-5 w-5" />,
      color: 'text-red-400',
      accuracy: '80%',
      indicators: ['Fibonacci', 'RSI (14)', 'Volume'],
      timeframe: 'M15 - H4',
      assets: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
      rules: [
        'Identificar swing significativo (alta para baixa ou vice-versa)',
        'Traçar níveis de Fibonacci (38.2%, 50%, 61.8%)',
        'Aguardar preço atingir nível 50% ou 61.8%',
        'RSI deve mostrar sobrevenda/venda no nível',
        'Volume aumentando na confirmação',
        'Entrada na reversão do nível',
        'Stop Loss abaixo/acima do nível 61.8%',
        'Take Profit no nível 38.2% ou máximo/mínimo anterior'
      ],
      pros: [
        'Níveis matemáticos precisos',
        'Alta probabilidade de reversão',
        'Funciona bem em todos os mercados'
      ],
      cons: [
        'Subjetivo na seleção de swings',
        'Requer prática para identificar corretamente',
        'Mercado pode ignorar níveis em eventos noticiosos'
      ],
      risk: 'Médio'
    },
    {
      id: 'support_resistance_breakout',
      name: 'Support/Resistance Breakout',
      description: 'Identifica breakouts de suportes/resistências com confirmação',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-orange-400',
      accuracy: '77%',
      indicators: ['Suporte/Resistência', 'Volume', 'RSI (14)'],
      timeframe: 'M5 - H1',
      assets: ['Todos os pares voláteis'],
      rules: [
        'Identificar nível claro de suporte/resistência',
        'Aguardar teste do nível (mínimo 2 toques)',
        'Volume deve aumentar no breakout',
        'RSI deve confirmar direção',
        'Entrada no fechamento da vela de breakout',
        'Stop Loss dentro do nível rompido',
        'Take Profit 2-3x o risco'
      ],
      pros: [
        'Setup visual fácil de identificar',
        'Alta probabilidade em níveis testados',
        'Risco bem definido'
      ],
      cons: [
        'Falsos breakouts comuns',
        'Requer paciência para setup correto',
        'Pode ser parado em movimentos bruscos'
      ],
      risk: 'Alto'
    }
  ];

  const getAccuracyColor = (accuracy: string) => {
    const value = parseInt(accuracy);
    if (value >= 85) return 'text-green-400';
    if (value >= 80) return 'text-blue-400';
    if (value >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Baixo': return 'bg-green-500/20 text-green-400';
      case 'Médio': return 'bg-yellow-500/20 text-yellow-400';
      case 'Médio-Alto': return 'bg-orange-500/20 text-orange-400';
      case 'Alto': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-6 w-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Estratégias com Alta Assertividade</h3>
      </div>

      {/* Estratégias */}
      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/5 ${strategy.color}`}>
                      {strategy.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{strategy.name}</h4>
                      <p className="text-sm text-white/60">{strategy.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getAccuracyColor(strategy.accuracy)}`}>
                      {strategy.accuracy}
                    </div>
                    <div className="text-xs text-white/60">Assertividade</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Indicadores e Timeframe */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-white/60 mb-1">Indicadores</div>
                      <div className="flex flex-wrap gap-1">
                        {strategy.indicators.map((indicator, i) => (
                          <Badge key={i} variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-1">Timeframe</div>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                        {strategy.timeframe}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-1">Risco</div>
                      <Badge variant="secondary" className={getRiskColor(strategy.risk)}>
                        {strategy.risk}
                      </Badge>
                    </div>
                  </div>

                  {/* Ativos */}
                  <div>
                    <div className="text-sm text-white/60 mb-2">Ativos Recomendados</div>
                    <div className="flex flex-wrap gap-2">
                      {strategy.assets.map((asset, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Regras */}
                  <div>
                    <div className="text-sm text-white/60 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Regras da Estratégia
                    </div>
                    <ul className="space-y-1 text-sm text-white/80">
                      {strategy.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">{'\u2022'}</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prós e Contras */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-green-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Prós
                      </div>
                      <ul className="space-y-1 text-sm text-white/80">
                        {strategy.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">+</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm text-red-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Contras
                      </div>
                      <ul className="space-y-1 text-sm text-white/80">
                        {strategy.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">-</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Aviso de Risco */}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <div className="text-yellow-400 text-sm">
                        <strong>Aviso de Risco:</strong> Estas estratégias têm alta assertividade baseada em análise histórica, 
                        mas não garantem lucros. Sempre use gerenciamento de risco adequado e nunca arrisque mais de 2% 
                        do seu capital em uma única operação.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dicas Gerais */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dicas Essenciais para Alta Assertividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div className="text-sm text-white/80">
                  <strong>Disciplina:</strong> Siga estritamente as regras da estratégia sem desvios emocionais.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div className="text-sm text-white/80">
                  <strong>Paciência:</strong> Aguarde apenas os setups perfeitos com todas as confirmações.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div className="text-sm text-white/80">
                  <strong>Gerenciamento:</strong> Use sempre stop loss e nunca arrisque mais de 2% por operação.
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div className="text-sm text-white/80">
                  <strong>Análise:</strong> Confirme múltiplos indicadores antes de entrar na operação.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div className="text-sm text-white/80">
                  <strong>Horário:</strong> Opere nos horários de maior liquidez (Londres/NY).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div className="text-sm text-white/80">
                  <strong>Diário:</strong> Registre todas as operações para analisar e melhorar continuamente.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
