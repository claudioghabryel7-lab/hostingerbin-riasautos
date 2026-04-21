'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, RefreshCw, Trash2, DollarSign, AlertTriangle } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

export function SettingsPanel() {
  const [isResetting, setIsResetting] = useState(false);
  const [isClearingToday, setIsClearingToday] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const { transactions, removeTransaction } = useTransactions();
  const { saveDefaultCurrency, clearDefaultCurrency, defaultCurrency } = useDefaultCurrency();

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      // Apagar todas as transações uma por uma
      for (const transaction of transactions) {
        await removeTransaction(transaction.id);
      }
      setShowConfirmReset(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearTodayTransactions = async () => {
    setIsClearingToday(true);
    try {
      const today = new Date().toDateString();
      const todayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === today
      );
      
      // Apagar apenas as transações de hoje
      for (const transaction of todayTransactions) {
        await removeTransaction(transaction.id);
      }
      
      setShowConfirmClear(false);
    } catch (error) {
      console.error('Erro ao apagar transações de hoje:', error);
    } finally {
      setIsClearingToday(false);
    }
  };

  const handleCurrencyChange = (newCurrency: 'BRL' | 'USD') => {
    saveDefaultCurrency(newCurrency);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Moeda */}
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Moeda Padrão
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={defaultCurrency === 'BRL' ? 'default' : 'outline'}
                onClick={() => handleCurrencyChange('BRL')}
                className={`${
                  defaultCurrency === 'BRL' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'border-white/10 text-white hover:bg-white/10'
                }`}
              >
                R$ - Real
              </Button>
              <Button
                variant={defaultCurrency === 'USD' ? 'default' : 'outline'}
                onClick={() => handleCurrencyChange('USD')}
                className={`${
                  defaultCurrency === 'USD' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'border-white/10 text-white hover:bg-white/10'
                }`}
              >
                $ - Dólar
              </Button>
            </div>
            <p className="text-white/60 text-sm mt-2">
              Moeda atual: {defaultCurrency === 'BRL' ? 'Real Brasileiro' : 'Dólar Americano'}
            </p>
          </div>

          {/* Limpar Dados */}
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Gerenciamento de Dados
            </h3>
            
            {/* Apagar Operações do Dia */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmClear(true)}
                className="w-full border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Apagar Operações de Hoje
              </Button>
              
              {showConfirmClear && (
                <Alert className="border-orange-500/20 bg-orange-500/10">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <AlertDescription className="text-orange-200">
                    Tem certeza que deseja apagar todas as operações de hoje? Esta ação não pode ser desfeita.
                  </AlertDescription>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowConfirmClear(false)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleClearTodayTransactions}
                      disabled={isClearingToday}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isClearingToday ? 'Apagando...' : 'Confirmar'}
                    </Button>
                  </div>
                </Alert>
              )}
            </div>

            {/* Resetar Todos os Dados */}
            <div className="space-y-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmReset(true)}
                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar Todos os Dados
              </Button>
              
              {showConfirmReset && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    Tem certeza que deseja resetar todos os dados? Todas as operações serão apagadas permanentemente.
                  </AlertDescription>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowConfirmReset(false)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleResetData}
                      disabled={isResetting}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {isResetting ? 'Resetando...' : 'Confirmar Reset'}
                    </Button>
                  </div>
                </Alert>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div>
            <h3 className="text-white font-medium mb-3">Estatísticas Atuais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">{transactions.length}</div>
                <div className="text-xs text-white/60">Total de Operações</div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
