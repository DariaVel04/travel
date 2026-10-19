import type { CurrencyCode, Money } from '@/types/common';

/** Creates Money from a major-unit amount: money(12.5) → { amountMinor: 1250, currency: 'EUR' }. */
export function money(amount: number, currency: CurrencyCode = 'EUR'): Money {
  return { amountMinor: Math.round(amount * 100), currency };
}

/** Sums amounts of the same currency. Currency conversion is out of scope for now. */
export function sumMoney(items: Money[], currency: CurrencyCode = 'EUR'): Money {
  const amountMinor = items
    .filter((item) => item.currency === currency)
    .reduce((total, item) => total + item.amountMinor, 0);
  return { amountMinor, currency };
}

export function formatMoney(value: Money, locale: string): string {
  const amount = value.amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
