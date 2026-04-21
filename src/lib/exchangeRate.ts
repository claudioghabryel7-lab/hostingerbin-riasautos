// Cache da cotação para evitar múltiplas requisições no mesmo dia
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 horas em milissegundos

export interface ExchangeRateResponse {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  varBid: string;
  pctChange: string;
  bid: string;
  ask: string;
  timestamp: string;
  create_date: string;
}

export async function getUSDToBRLRate(): Promise<number> {
  const now = Date.now();
  
  // Verificar se temos um cache válido
  if (cachedRate && (now - cachedRate.timestamp) < CACHE_DURATION) {
    return cachedRate.rate;
  }

  try {
    // Usar API AwesomeAPI (gratuita e confiável)
    const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
    
    if (!response.ok) {
      throw new Error('Falha ao buscar cotação do dólar');
    }

    const data = await response.json();
    const usdBrl = data.USDBRL as ExchangeRateResponse;
    
    if (!usdBrl || !usdBrl.bid) {
      throw new Error('Dados da cotação inválidos');
    }

    const rate = parseFloat(usdBrl.bid);
    
    // Atualizar cache
    cachedRate = {
      rate,
      timestamp: now
    };

    return rate;
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    
    // Retornar uma cotação padrão em caso de erro
    const fallbackRate = 5.50; // Valor aproximado como fallback
    return fallbackRate;
  }
}

export function formatCurrency(value: number, currency: 'BRL' | 'USD' = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function convertCurrency(
  amount: number, 
  fromCurrency: 'BRL' | 'USD', 
  toCurrency: 'BRL' | 'USD',
  exchangeRate?: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Se não tiver taxa de câmbio, usar uma padrão
  const rate = exchangeRate || 5.50;
  
  if (fromCurrency === 'USD' && toCurrency === 'BRL') {
    return amount * rate;
  }
  
  if (fromCurrency === 'BRL' && toCurrency === 'USD') {
    return amount / rate;
  }

  return amount;
}

export function getCurrencySymbol(currency: 'BRL' | 'USD'): string {
  return currency === 'BRL' ? 'R$' : '$';
}
