import type { Severity } from './common';

/**
 * Trip Convenience Score — data structures only.
 *
 * Offers are ranked on more than price: each offer carries a list of inconvenience
 * factors, and a future scoring strategy turns price + duration + factors into a score.
 */

export type InconvenienceType =
  | 'overnight_flight'
  | 'early_departure'
  | 'late_arrival'
  | 'long_layover'
  | 'multiple_stops'
  | 'airport_change'
  | 'self_transfer'
  | 'short_connection'
  | 'long_total_duration'
  | 'inconvenient_arrival'
  | 'overnight_layover'
  | 'transit_visa'
  | 'complex_route';

export interface InconvenienceFactor {
  type: InconvenienceType;
  severity: Severity;
  /** Optional structured details, e.g. { layoverMinutes: 480 }. */
  details?: Record<string, string | number>;
}

export type ScoreDimension =
  'price' | 'duration' | 'stops' | 'schedule' | 'transfers' | 'visa' | 'comfort';

/** How much each dimension matters. Can later be personalised per user. */
export type ScoreWeights = Record<ScoreDimension, number>;

export interface ConvenienceScore {
  /** 0 (worst) – 100 (best). */
  value: number;
  breakdown: Partial<Record<ScoreDimension, number>>;
  /** Lets us compare scores produced by different algorithm versions. */
  algorithmVersion: string;
}

/** Any scoring algorithm (simple rules today, ML/AI later) implements this interface. */
export interface ScoringStrategy<TItem> {
  id: string;
  score(item: TItem, weights: ScoreWeights): ConvenienceScore;
}
