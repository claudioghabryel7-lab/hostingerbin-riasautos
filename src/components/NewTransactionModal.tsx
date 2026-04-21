'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, NewTransactionForm } from '@/types';

interface NewTransactionModalProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  defaultCurrency: 'BRL' | 'USD';
}

export function NewTransactionModal({ onAddTransaction, defaultCurrency }: NewTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewTransactionForm>({
    investment: '',
    withdrawn: '',
    date: new Date().toISOString().split('T')[0],
    currency: defaultCurrency
  });
  const [transactionType, setTransactionType] = useState<'win' | 'loss'>('win');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.investment || !form.date) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const investment = parseFloat(form.investment.replace(',', '.'));
    const withdrawn = form.withdrawn ? parseFloat(form.withdrawn.replace(',', '.')) : 0;
    
    if (isNaN(investment) || investment <= 0) {
      alert('Valor de investimento inválido');
      return;
    }

    if (transactionType === 'win' && (!withdrawn || withdrawn <= 0)) {
      alert('Para operações WIN, o valor sacado é obrigatório');
      return;
    }

    const netProfit = transactionType === 'win' ? withdrawn - investment : -investment;

    onAddTransaction({
      date: new Date(form.date),
      type: transactionType,
      investment,
      withdrawn: transactionType === 'win' ? withdrawn : undefined,
      netProfit,
      currency: form.currency
    });

    setForm({
      investment: '',
      withdrawn: '',
      date: new Date().toISOString().split('T')[0],
      currency: defaultCurrency
    });
    setOpen(false);
  };

  const handleInputChange = (field: keyof NewTransactionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glass-dark border-white/10 text-white hover:bg-white/10">
          <Plus className="h-4 w-4 mr-2" />
          Nova Operação
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-dark border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Registrar Nova Operação
          </DialogTitle>
        </DialogHeader>
        
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Tipo de Operação */}
          <div className="space-y-2">
            <Label className="text-white/80">Tipo de Operação</Label>
            <div className="grid grid-cols-2 gap-2">
              <Card
                className={`cursor-pointer transition-all ${
                  transactionType === 'win' 
                    ? 'bg-green-500/20 border-green-400/50' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setTransactionType('win')}
              >
                <CardContent className="p-3 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-400" />
                  <span className="text-sm font-medium text-green-400">WIN</span>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${
                  transactionType === 'loss' 
                    ? 'bg-red-500/20 border-red-400/50' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setTransactionType('loss')}
              >
                <CardContent className="p-3 text-center">
                  <TrendingDown className="h-5 w-5 mx-auto mb-1 text-red-400" />
                  <span className="text-sm font-medium text-red-400">LOSS</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-white/80">Data</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="glass-dark border-white/10 text-white bg-white/5"
              required
            />
          </div>

          {/* Valor Investido */}
          <div className="space-y-2">
            <Label htmlFor="investment" className="text-white/80">
              Valor Investido ({form.currency === 'BRL' ? 'R$' : '$'})
            </Label>
            <Input
              id="investment"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={form.investment}
              onChange={(e) => handleInputChange('investment', e.target.value)}
              className="glass-dark border-white/10 text-white bg-white/5"
              required
            />
          </div>

          {/* Valor Sacado (apenas para WIN) */}
          {transactionType === 'win' && (
            <div className="space-y-2">
              <Label htmlFor="withdrawn" className="text-white/80">
                Valor Sacado ({form.currency === 'BRL' ? 'R$' : '$'})
              </Label>
              <Input
                id="withdrawn"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={form.withdrawn}
                onChange={(e) => handleInputChange('withdrawn', e.target.value)}
                className="glass-dark border-white/10 text-white bg-white/5"
                required
              />
            </div>
          )}

          {/* Preview do Lucro/Prejuízo */}
          {form.investment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="text-sm text-white/60 mb-1">Previsão de Resultado:</div>
              <div className={`text-lg font-bold ${
                transactionType === 'win' && form.withdrawn
                  ? (parseFloat(form.withdrawn) - parseFloat(form.investment)) >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                  : 'text-red-400'
              }`}>
                {transactionType === 'win' && form.withdrawn
                  ? `${form.currency === 'BRL' ? 'R$' : '$'} ${(parseFloat(form.withdrawn) - parseFloat(form.investment)).toFixed(2)}`
                  : `-${form.currency === 'BRL' ? 'R$' : '$'} ${parseFloat(form.investment).toFixed(2)}`
                }
              </div>
            </motion.div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-white/10 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${
                transactionType === 'win' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              Registrar {transactionType.toUpperCase()}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
