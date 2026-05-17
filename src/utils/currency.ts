// ========================================
// Utility — Currency formatting
// ========================================

import { CURRENCY_SYMBOLS, type CurrencyCode } from '../types/settings';

export function formatCurrency(amount: number, currency: CurrencyCode = 'EGP'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-EG').format(num);
}

export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}
