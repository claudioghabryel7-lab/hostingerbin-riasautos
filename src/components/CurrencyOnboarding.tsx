'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useDefaultCurrency, Currency } from '@/hooks/useDefaultCurrency';

interface CurrencyOnboardingProps {
  onComplete: () => void;
}

export function CurrencyOnboarding({ onComplete }: CurrencyOnboardingProps) {
  const { saveDefaultCurrency } = useDefaultCurrency();

  const currencies = [
    {
      code: 'BRL' as Currency,
      name: 'Real Brasileiro',
      symbol: 'R$',
      icon: Coins,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/50',
      description: 'Operações em Reais brasileiros',
      examples: ['R$ 100,00', 'R$ 250,50']
    },
    {
      code: 'USD' as Currency,
      name: 'Dólar Americano',
      symbol: '$',
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/50',
      description: 'Operações em Dólares americanos',
      examples: ['$ 100.00', '$ 250.50']
    }
  ];

  const handleSelectCurrency = (currency: Currency) => {
    saveDefaultCurrency(currency);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bem-vindo ao Hotinger Gestor OB
          </h1>
          <p className="text-xl text-white/80 mb-2">
            Sua plataforma profissional de gestão financeira
          </p>
          <p className="text-lg text-white/60">
            Em qual moeda você realiza suas operações?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currencies.map((currency, index) => {
            const Icon = currency.icon;
            return (
              <motion.div
                key={currency.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    'glass-dark border-white/10 text-white'
                  }`}
                  onClick={() => handleSelectCurrency(currency.code)}
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Icon */}
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${currency.bgColor} ${currency.borderColor} border-2`}>
                        <Icon className={`h-10 w-10 ${currency.color}`} />
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {currency.name}
                        </h3>
                        <p className="text-lg font-medium text-white/60">
                          {currency.code}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-white/60">
                        {currency.description}
                      </p>

                      {/* Examples */}
                      <div className="w-full space-y-2">
                        <div className="text-sm text-white/40 mb-2">Exemplos de valores:</div>
                        <div className="flex justify-center gap-4">
                          {currency.examples.map((example, i) => (
                            <div
                              key={i}
                              className={`px-3 py-1 rounded-lg ${currency.bgColor} ${currency.borderColor} border font-mono text-sm ${currency.color}`}
                            >
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Select Button */}
                      <Button
                        className={`w-full mt-6 ${currency.code === 'BRL' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCurrency(currency.code);
                        }}
                      >
                        Operar em {currency.code}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-white/40 text-sm">
            Você poderá alterar essa configuração a qualquer momento nas configurações
          </p>
        </motion.div>
      </div>
    </div>
  );
}
