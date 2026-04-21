export interface Transaction {
  id: string;
  date: Date;
  type: 'win' | 'loss';
  investment: number;
  withdrawn?: number;
  netProfit: number;
  currency: 'BRL' | 'USD';
  exchangeRate?: number; // Cotação na data da transação (USD para BRL)
}

export interface Metrics {
  totalCycleProfit: number;
  winRate: number;
  currentBalance: number;
  totalInvested: number;
  totalWithdrawn: number;
  winsCount: number;
  lossesCount: number;
}

export interface NewTransactionForm {
  investment: string;
  withdrawn?: string;
  date: string;
  currency: 'BRL' | 'USD';
}
