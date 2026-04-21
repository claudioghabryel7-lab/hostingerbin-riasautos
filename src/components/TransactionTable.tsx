'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '@/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  formatValue: (value: number, targetCurrency?: 'BRL' | 'USD') => string;
}

export function TransactionTable({ transactions, onDeleteTransaction, formatValue }: TransactionTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="glass-dark border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Histórico de Operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>Nenhuma operação registrada ainda.</p>
              <p className="text-sm mt-2">Adicione sua primeira operação para começar!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/80">Data</TableHead>
                    <TableHead className="text-white/80">Tipo</TableHead>
                    <TableHead className="text-white/80 text-right">Investimento</TableHead>
                    <TableHead className="text-white/80 text-right">Valor Sacado</TableHead>
                    <TableHead className="text-white/80 text-right">Líquido Real</TableHead>
                    <TableHead className="text-white/80 text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="text-white/90">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === 'win' ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 font-medium">WIN</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-400" />
                              <span className="text-red-400 font-medium">LOSS</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-white/90">
                        {formatValue(transaction.investment, transaction.currency)}
                      </TableCell>
                      <TableCell className="text-right text-white/90">
                        {transaction.withdrawn ? formatValue(transaction.withdrawn, transaction.currency) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatValue(transaction.netProfit, transaction.currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTransaction(transaction.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
