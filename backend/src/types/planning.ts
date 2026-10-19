import type { CurrencyCode, TravelersPayload } from './api.js';

/**
 * Persistence contract for a future AI planner.
 *
 * AI Planner → TripPlanningService → validated plan → these records → MySQL
 *
 * No AI provider is connected here.
 */
export interface PersistableTripCost {
  category:
    | 'TRANSPORT'
    | 'ACCOMMODATION'
    | 'BAGGAGE'
    | 'FOOD'
    | 'LOCAL_TRANSPORT'
    | 'ACTIVITIES'
    | 'INSURANCE'
    | 'VISA'
    | 'FEES'
    | 'OTHER';
  amountMinor: number;
  currency: CurrencyCode;
  description?: string;
}

export interface PersistableActivity {
  title: string;
  description?: string;
  category:
    | 'SIGHTSEEING'
    | 'FOOD'
    | 'TRANSPORT'
    | 'NATURE'
    | 'CULTURE'
    | 'SHOPPING'
    | 'WELLNESS'
    | 'ENTERTAINMENT'
    | 'OTHER';
  location?: string;
  startTime?: string;
  endTime?: string;
  estimatedCostMinor?: number;
  currency: CurrencyCode;
}

export interface PersistableItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  estimatedCostMinor?: number;
  currency: CurrencyCode;
  activities: PersistableActivity[];
}

export interface PersistableTripPlan {
  destinationName: string;
  startDate: string;
  endDate: string;
  travelers: TravelersPayload;
  currency: CurrencyCode;
  totalEstimatedCost: number;
  days: PersistableItineraryDay[];
  costs: PersistableTripCost[];
}

export interface TripPlanPersistence {
  persistValidatedPlan(tripId: string, plan: PersistableTripPlan): Promise<void>;
}
