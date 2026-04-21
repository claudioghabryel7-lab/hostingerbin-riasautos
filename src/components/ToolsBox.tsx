'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Settings, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ToolsBox() {
  const tools = [
    {
      title: 'Calculadora de Soros',
      description: 'Calcule níveis de Martingale',
      icon: Calculator,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/50',
      href: '/tools'
    },
    {
      title: 'Gerenciamento de Risco',
      description: 'Em breve...',
      icon: Settings,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/50',
      href: '#',
      disabled: true
    },
    {
      title: 'Análise de Padrões',
      description: 'Em breve...',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/50',
      href: '#',
      disabled: true
    }
  ];

  return (
    <Card className="glass-dark border-white/10 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Ferramentas</h3>
          <Calculator className="h-5 w-5 text-white/60" />
        </div>
        
        <div className="space-y-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            
            if (tool.disabled) {
              return (
                <div
                  key={tool.title}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.bgColor}`}>
                      <Icon className={`h-4 w-4 ${tool.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{tool.title}</div>
                      <div className="text-xs text-white/50">{tool.description}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/30" />
                </div>
              );
            }
            
            return (
              <Link key={tool.title} href={tool.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.bgColor} ${tool.borderColor} border`}>
                        <Icon className={`h-4 w-4 ${tool.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{tool.title}</div>
                        <div className="text-xs text-white/50">{tool.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/60" />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <Link href="/tools">
            <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">
              Ver Todas as Ferramentas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
