'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  BarChart3,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TradingStrategiesProps {
  transactions: any[];
}

export function TradingStrategies({ transactions }: TradingStrategiesProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const strategies = [
    {
      id: 'rsi-divergence',
      name: 'Divergência RSI',
      category: 'Análise Técnica',
      difficulty: 'Intermediário',
      winRate: 72,
      description: 'Identifica divergências entre o preço e o RSI para prever reversões.',
      rules: [
        'RSI abaixo de 30 com preço fazendo nova baixa = sinal de COMPRA',
        'RSI acima de 70 com preço fazendo nova alta = sinal de VENDA',
        'Confirmar com padrão de velas de reversão',
        'Stop loss de 2% e take profit de 4%'
      ],
      pros: [
        'Alta precisão em mercados laterais',
        'Sinais claros e objetivos',
        'Funciona bem em múltiplos timeframes'
      ],
      cons: [
        'Requer prática para identificar divergências',
        'Pode gerar falsos sinais em tendências fortes',
        'Necessita confirmação adicional'
      ],
      timeframes: ['M5', 'M15', 'H1'],
      assets: ['EUR/USD', 'GBP/USD', 'Ouro', 'Petróleo']
    },
    {
      id: 'support-resistance',
      name: 'Suporte e Resistência',
      category: 'Análise Clássica',
      difficulty: 'Iniciante',
      winRate: 68,
      description: 'Opera baseado em topos e fundos significativos do gráfico.',
      rules: [
        'Identifique níveis claros de suporte e resistência',
        'Aguarde teste do nível com confirmação',
        'Entrar na direção da rejeição do nível',
        'Use volume para confirmar a força'
      ],
      pros: [
        'Fácil de aprender e aplicar',
        'Níveis funcionam em todos os mercados',
        'Alta probabilidade de acerto'
      ],
      cons: [
        'Subjetividade na identificação dos níveis',
        'Breakouts falsos são comuns',
        'Requer paciência para esperar setups'
      ],
      timeframes: ['M15', 'H1', 'H4'],
      assets: ['Todos os pares de moedas', 'Índices', 'Commodities']
    },
    {
      id: 'breakout-momentum',
      name: 'Breakout com Momentum',
      category: 'Momentum',
      difficulty: 'Intermediário',
      winRate: 65,
      description: 'Aproveita o rompimento de níveis importantes com volume.',
      rules: [
        'Identifique consolidação clara',
        'Aguarde rompimento com volume aumentado',
        'Entrar após confirmação do breakout',
        'Use trailing stop para proteger ganhos'
      ],
      pros: [
        'Grande potencial de lucro',
        'Sinais claros de entrada',
        'Funciona bem em volatilidade alta'
      ],
      cons: [
        'Alto risco de falsos breakouts',
        'Requer gestão de risco rigorosa',
        'Pode gerar perdas rápidas'
      ],
      timeframes: ['M5', 'M15', 'H1'],
      assets: ['GBP/JPY', 'EUR/JPY', 'Índices voláteis']
    },
    {
      id: 'fibonacci-retracement',
      name: 'Retração de Fibonacci',
      category: 'Análise Técnica',
      difficulty: 'Avançado',
      winRate: 70,
      description: 'Usa níveis de Fibonacci para identificar pontos de reversão.',
      rules: [
        'Desenhe Fibonacci do swing alto ao baixo (ou vice-versa)',
        'Procure reversão nos níveis 38.2%, 50% ou 61.8%',
        'Combine com outros indicadores',
        'Confirme com padrão de candles'
      ],
      pros: [
        'Níveis muito precisos',
        'Funciona bem em tendências',
        'Amplamente usado por profissionais'
      ],
      cons: [
        'Requer prática para desenhar corretamente',
        'Subjetividade na escolha dos pontos',
        'Múltiplos níveis podem confundir'
      ],
      timeframes: ['H1', 'H4', 'Daily'],
      assets: ['EUR/USD', 'GBP/USD', 'Dow Jones', 'S&P 500']
    },
    {
      id: 'moving-average-crossover',
      name: 'Cruz de Médias Móveis',
      category: 'Trend Following',
      difficulty: 'Iniciante',
      winRate: 62,
      description: 'Sinais baseados no cruzamento de médias móveis de diferentes períodos.',
      rules: [
        'Use EMA 9 e EMA 21 para sinais rápidos',
        'Cruz para cima = sinal de compra',
        'Cruz para baixo = sinal de venda',
        'Filtre sinais contra a tendência principal'
      ],
      pros: [
        'Sinais objetivos e automáticos',
        'Fácil de implementar',
        'Bom para identificar tendências'
      ],
      cons: [
        'Atraso nos sinais',
        'Falsos cruzados em mercados laterais',
        'Menos eficaz em alta volatilidade'
      ],
      timeframes: ['M5', 'M15', 'H1'],
      assets: ['Todos os pares principais', 'Índices principais']
    },
    {
      id: 'bollinger-bands',
      name: 'Bandas de Bollinger',
      category: 'Volatilidade',
      difficulty: 'Intermediário',
      winRate: 66,
      description: 'Opera nas extremidades das bandas com reversão para a média.',
      rules: [
        'Toque na banda superior = sinal de venda',
        'Toque na banda inferior = sinal de compra',
        'Confirme com padrão de reversão',
        'Use ADX para filtrar tendências'
      ],
      pros: [
        'Funciona bem em mercados laterais',
        'Sinais claros de extremos',
        'Adapta-se à volatilidade'
      ],
      cons: [
        'Perigoso em tendências fortes',
        'Pode ficar preso em posições',
        'Requer gestão de risco rigorosa'
      ],
      timeframes: ['M15', 'H1', 'H4'],
      assets: ['EUR/USD', 'GBP/USD', 'Ouro']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediário': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Avançado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-400';
    if (winRate >= 65) return 'text-yellow-400';
    return 'text-red-400';
  };

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-6 w-6 text-green-400" />
        <h3 className="text-xl font-bold text-white">Estratégias de Trading</h3>
      </div>

      {/* Strategy List */}
      <div className="grid gap-4">
        {strategies.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-dark border-white/10 rounded-lg p-4 cursor-pointer hover:border-white/20 transition-all"
            onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-semibold">{strategy.name}</h4>
                  <Badge className={getDifficultyColor(strategy.difficulty)}>
                    {strategy.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {strategy.category}
                  </Badge>
                </div>
                
                <p className="text-white/60 text-sm mb-3">{strategy.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">Win Rate:</span>
                    <span className={`font-bold ${getWinRateColor(strategy.winRate)}`}>
                      {strategy.winRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-white/40" />
                    <span className="text-white/60">{strategy.timeframes.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                {selectedStrategy === strategy.id ? (
                  <XCircle className="h-5 w-5 text-white/40" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Strategy Details */}
      {selectedStrategyData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark border-white/10 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-white">{selectedStrategyData.name}</h3>
            <Badge className={getDifficultyColor(selectedStrategyData.difficulty)}>
              {selectedStrategyData.difficulty}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rules */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Regras da Estratégia
              </h4>
              <ul className="space-y-2">
                {selectedStrategyData.rules.map((rule, index) => (
                  <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-1">·</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pros and Cons */}
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Vantagens
                </h4>
                <ul className="space-y-2">
                  {selectedStrategyData.pros.map((pro, index) => (
                    <li key={index} className="text-green-400 text-sm flex items-start gap-2">
                      <span className="mt-1">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Desvantagens
                </h4>
                <ul className="space-y-2">
                  {selectedStrategyData.cons.map((con, index) => (
                    <li key={index} className="text-red-400 text-sm flex items-start gap-2">
                      <span className="mt-1">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Assets and Timeframes */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Ativos Recomendados</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStrategyData.assets.map((asset, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/10 text-white/80">
                      {asset}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Timeframes Ideais</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStrategyData.timeframes.map((timeframe, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-500/10 text-blue-400">
                      {timeframe}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-semibold mb-1">Aviso de Risco</p>
                <p className="text-yellow-400/80 text-sm">
                  Esta estratégia tem uma taxa de acerto estimada de {selectedStrategyData.winRate}%. 
                  Sempre use gestão de risco adequada e nunca arrisque mais de 2% do seu capital em uma única operação.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* General Tips */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dicas Gerais para Opções Binárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">
                  <strong>Gestão de Risco:</strong> Nunca arrisque mais de 2% do seu saldo por operação.
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Psicologia:</strong> Mantenha a disciplina e siga seu plano de trading.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-400 text-sm">
                  <strong>Análise:</strong> Combine múltiplos indicadores para confirmar sinais.
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Paciência:</strong> Espere pelo setup perfeito, não force operações.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
