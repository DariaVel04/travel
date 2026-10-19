/**
 * Shared primitive types used across all features.
 */

/** ISO 4217 currency code. Extend this list when new markets are added. */
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'SEK' | 'NOK' | 'DKK' | 'CHF' | 'THB';

/**
 * A monetary amount.
 * Stored in minor units (cents) as an integer to avoid floating point rounding errors:
 * €12.50 → { amountMinor: 1250, currency: 'EUR' }.
 */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

/** Calendar date in ISO format: "2027-01-15". */
export type ISODate = string;

/** Date and time in ISO format: "2027-01-15T09:30". */
export type ISODateTime = string;

/** Calendar month in ISO format: "2027-01". */
export type YearMonth = string;

export interface DateRange {
  from: ISODate;
  to: ISODate;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type Severity = 'low' | 'medium' | 'high';

/** Confidence of an estimate or prediction. */
export type Confidence = 'low' | 'medium' | 'high';
