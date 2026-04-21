'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MartingaleCalculator } from '@/components/MartingaleCalculator';
import { RiskManagement } from '@/components/RiskManagement';
import { PatternAnalysis } from '@/components/PatternAnalysis';
import { TradingStrategies } from '@/components/TradingStrategies';
import { useTransactions } from '@/hooks/useTransactions';
import { 
  Calculator, 
  Shield, 
  Brain, 
  Target, 
  TrendingUp, 
  BarChart3,
  ArrowRight 
} from 'lucide-react';

type ToolType = 'calculator' | 'risk' | 'patterns' | 'strategies';

interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function ToolsBox() {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const { transactions } = useTransactions();

  const tools: Tool[] = [
    {
      id: 'calculator',
      name: 'Calculadora de Soros',
      description: 'Calcule valores para estratégia Martingale',
      icon: <Calculator className="h-5 w-5" />,
      color: 'text-blue-400'
    },
    {
      id: 'risk',
      name: 'Gerenciamento de Risco',
      description: 'Analise e controle seus riscos',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-green-400'
    },
    {
      id: 'patterns',
      name: 'Análise de Padrões',
      description: 'Identifique padrões no seu trading',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-purple-400'
    },
    {
      id: 'strategies',
      name: 'Estratégias de Trading',
      description: 'Estratégias para opções binárias',
      icon: <Target className="h-5 w-5" />,
      color: 'text-yellow-400'
    }
  ];

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'calculator':
        return <MartingaleCalculator />;
      case 'risk':
        return <RiskManagement transactions={transactions} />;
      case 'patterns':
        return <PatternAnalysis transactions={transactions} />;
      case 'strategies':
        return <TradingStrategies transactions={transactions} />;
      default:
        return null;
    }
  };

  const getActiveToolTitle = () => {
    const tool = tools.find(t => t.id === activeTool);
    return tool ? tool.name : 'Ferramentas';
  };

  const getActiveToolIcon = () => {
    const tool = tools.find(t => t.id === activeTool);
    return tool ? tool.icon : <BarChart3 className="h-5 w-5" />;
  };

  const getActiveToolColor = () => {
    const tool = tools.find(t => t.id === activeTool);
    return tool ? tool.color : 'text-white';
  };

  return (
    <Card className="glass-dark border-white/10 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {getActiveToolIcon()}
          <span className={getActiveToolColor()}>{getActiveToolTitle()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeTool ? (
          <div className="space-y-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setActiveTool(null)}
              className="text-white/60 hover:text-white mb-4"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Voltar para Ferramentas
            </Button>

            {/* Active Tool Content */}
            <div className="max-h-[600px] overflow-y-auto">
              {renderActiveTool()}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="glass-dark border-white/10 cursor-pointer hover:border-white/20 transition-all h-full"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${tool.color}`}>
                        {tool.icon}
                      </div>
                      <h3 className="text-white font-semibold">{tool.name}</h3>
                    </div>
                    <p className="text-white/60 text-sm">{tool.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {!activeTool && transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Estatísticas Rápidas
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">{transactions.length}</div>
                <div className="text-xs text-white/60">Total Operações</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {transactions.filter(t => t.result === 'win').length}
                </div>
                <div className="text-xs text-white/60">Wins</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-red-400">
                  {transactions.filter(t => t.result === 'loss').length}
                </div>
                <div className="text-xs text-white/60">Losses</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {transactions.length > 0 
                    ? ((transactions.filter(t => t.result === 'win').length / transactions.length) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-white/60">Win Rate</div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
