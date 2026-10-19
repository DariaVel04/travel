import type { ISODate, ISODateTime, Money } from '@/types/common';
import type { PlaceRef } from '@/types/location';
import type { DateSelection } from '@/features/flights/types';

/* ---------- Price Prediction ---------- */

export interface PricePoint {
  date: ISODate;
  price: Money;
}

export type PriceTrend = 'rising' | 'falling' | 'stable';

export type PriceLevel = 'low' | 'typical' | 'high';

export type PriceRecommendation = 'buy_now' | 'wait' | 'no_recommendation';

/** "Price is currently €420, historical average €510 — relatively low." */
export interface PriceInsight {
  /** Identifies the route + date window, e.g. "HEL-BKK:2027-01". */
  routeKey: string;
  currentPrice: Money;
  historicalAverage: Money;
  historicalLow?: Money;
  level: PriceLevel;
  trend: PriceTrend;
  recommendation: PriceRecommendation;
  /** 0–1: how sure the model is. */
  confidence: number;
  dataPoints: number;
}

/* ---------- Price Monitoring ---------- */

export type NotificationChannel = 'email' | 'telegram';

/** "Notify me if Helsinki → Bangkok drops below €500." */
export interface PriceAlert {
  id: string;
  userId: string;
  origins: PlaceRef[];
  destinations: PlaceRef[];
  dates?: DateSelection;
  thresholdPrice: Money;
  channels: NotificationChannel[];
  isActive: boolean;
  createdAt: ISODateTime;
  lastNotifiedAt?: ISODateTime;
}
