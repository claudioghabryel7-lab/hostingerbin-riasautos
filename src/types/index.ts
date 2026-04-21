export interface Transaction {
  id: string;
  date: string; // Mudar para string para compatibilidade
  result: 'win' | 'loss'; // Mudar de type para result
  amount: number; // Mudar de investment para amount
  profit: number; // Mudar de netProfit para profit
  asset: string; // Adicionar asset que os componentes usam
  currency: 'BRL' | 'USD';
  exchangeRate?: number;
}

export interface Metrics {
  totalProfit: number;
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
