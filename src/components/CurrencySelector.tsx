'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Coins } from 'lucide-react';

interface CurrencySelectorProps {
  selectedCurrency: 'BRL' | 'USD';
  onCurrencyChange: (currency: 'BRL' | 'USD') => void;
  exchangeRate?: number;
}

export function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange, 
  exchangeRate 
}: CurrencySelectorProps) {
  const currencies = [
    {
      code: 'BRL' as const,
      name: 'Real Brasileiro',
      symbol: 'R$',
      icon: Coins,
      color: 'text-green-400'
    },
    {
      code: 'USD' as const,
      name: 'Dólar Americano',
      symbol: '$',
      icon: DollarSign,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-white/80">Moeda</div>
      <div className="grid grid-cols-2 gap-2">
        {currencies.map((currency) => {
          const Icon = currency.icon;
          const isSelected = selectedCurrency === currency.code;
          
          return (
            <motion.div
              key={currency.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-white/20 border-white/30 ring-2 ring-white/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => onCurrencyChange(currency.code)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${currency.color}`} />
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">
                        {currency.code}
                      </div>
                      <div className="text-xs text-white/60">
                        {currency.symbol}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Exibir cotação atual */}
      {exchangeRate && selectedCurrency === 'USD' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-400">Cotação USD/BRL:</span>
            <span className="text-sm font-medium text-white">
              R$ {exchangeRate.toFixed(2)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
