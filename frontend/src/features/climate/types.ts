import type { ISODateTime, Severity } from '@/types/common';

/** Month number: 1 = January … 12 = December. */
export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface MonthlyClimate {
  month: MonthNumber;
  avgHighC: number;
  avgLowC: number;
  humidityPct: number;
  rainfallMm: number;
  rainyDays: number;
  sunshineHours?: number;
  seaTempC?: number;
}

export type SeasonalRiskType =
  | 'pollen'
  | 'jellyfish'
  | 'hurricane'
  | 'monsoon'
  | 'typhoon'
  | 'extreme_heat'
  | 'wildfire'
  | 'sandstorm'
  | 'peak_tourist_season';

export interface SeasonalRisk {
  type: SeasonalRiskType;
  months: MonthNumber[];
  severity: Severity;
}

/** Climate Intelligence data for one destination; used by the AI Planner to pick dates. */
export interface DestinationClimateProfile {
  placeId: string;
  monthly: MonthlyClimate[];
  risks: SeasonalRisk[];
  source: string;
  updatedAt: ISODateTime;
}
