'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, Shield, Brain, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MartingaleCalculator } from '@/components/MartingaleCalculator';
import { RiskManagement } from '@/components/RiskManagement';
import { PatternAnalysis } from '@/components/PatternAnalysis';
import { TradingStrategies } from '@/components/TradingStrategies';
import { PsychologicalControl } from '@/components/PsychologicalControl';
import { TradingSimulation } from '@/components/TradingSimulation';
import { useTransactions } from '@/hooks/useTransactions';

type ToolType = 'calculator' | 'risk' | 'patterns' | 'strategies' | 'psychological' | 'simulation';

interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function ToolsPage() {
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
      description: 'Estratégias com alta assertividade',
      icon: <Target className="h-5 w-5" />,
      color: 'text-orange-400'
    },
    {
      id: 'psychological',
      name: 'Controle Psicológico',
      description: 'Treine sua mente para trading disciplinado',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-pink-400'
    },
    {
      id: 'simulation',
      name: 'Simulação de Trading',
      description: 'Simule 30 dias com estratégia Martingale',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-cyan-400'
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
      case 'psychological':
        return <PsychologicalControl />;
      case 'simulation':
        return <TradingSimulation />;
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
    return tool ? tool.icon : <TrendingUp className="h-5 w-5" />;
  };

  const getActiveToolColor = () => {
    const tool = tools.find(t => t.id === activeTool);
    return tool ? tool.color : 'text-white';
  };

  const handleToolClick = (toolId: ToolType) => {
    console.log('Clicou na ferramenta:', toolId);
    setActiveTool(toolId);
  };

  const handleBackClick = () => {
    console.log('Clicou em voltar');
    setActiveTool(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" className="glass-dark border-white/10 text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Ferramentas de Trading
              </h1>
              <p className="text-white/60 text-sm sm:text-base">
                Calculadoras e análises profissionais para traders
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tools Content */}
        {activeTool ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-dark border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {getActiveToolIcon()}
                  <span className={getActiveToolColor()}>{getActiveToolTitle()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    onClick={handleBackClick}
                    className="text-white/60 hover:text-white mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Ferramentas
                  </Button>

                  {/* Active Tool Content */}
                  <div className="max-h-[600px] overflow-y-auto">
                    {renderActiveTool()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
                  onClick={() => handleToolClick(tool.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg bg-white/5 ${tool.color}`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{tool.name}</h3>
                        <p className="text-white/60 text-sm mt-1">{tool.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm">Clique para acessar</span>
                      <ArrowLeft className="h-4 w-4 text-white/40 rotate-180" />
                    </div>
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
            className="mt-8"
          >
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estatísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{transactions.length}</div>
                    <div className="text-xs text-white/60">Total Operações</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {transactions.filter(t => t.result === 'win').length}
                    </div>
                    <div className="text-xs text-white/60">Wins</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {transactions.filter(t => t.result === 'loss').length}
                    </div>
                    <div className="text-xs text-white/60">Losses</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {transactions.length > 0 
                        ? ((transactions.filter(t => t.result === 'win').length / transactions.length) * 100).toFixed(1)
                        : 0}%
                    </div>
                    <div className="text-xs text-white/60">Win Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
