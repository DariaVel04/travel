import type { AccommodationSearchResult } from '@/features/hotels/types';
import type { CurrencyCode, ISODate, ISODateTime, Money } from '@/types/common';
import type { PlaceRef } from '@/types/location';
import type { TravelGroup } from './types';

export type DaySlot = 'morning' | 'afternoon' | 'evening';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type TransportStepType =
  | 'flight'
  | 'train'
  | 'bus'
  | 'ferry'
  | 'public_transport'
  | 'taxi'
  | 'rental_car'
  | 'walk';

export interface PlannedActivity {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  locationName?: string;
  estimatedCost?: Money;
  durationMinutes?: number;
  slot?: DaySlot;
}

export interface PlannedMeal {
  id: string;
  slot: MealSlot;
  titleKey: string;
  estimatedCost?: Money;
}

export interface TransportationStep {
  id: string;
  type: TransportStepType;
  origin: PlaceRef;
  destination: PlaceRef;
  departure?: ISODateTime;
  arrival?: ISODateTime;
  durationMinutes: number;
  estimatedCost?: Money;
  /** Journey offer this step came from, when the traveller already picked transport. */
  sourceOfferId?: string;
}

export interface AccommodationRecommendation {
  id: string;
  name?: string;
  nameKey?: string;
  destination: PlaceRef;
  nights: number;
  estimatedCost: Money;
  fromSelection: boolean;
}

export interface DayPlan {
  dayNumber: number;
  date: ISODate;
  titleKey: string;
  activities: PlannedActivity[];
  meals: PlannedMeal[];
  transportation: TransportationStep[];
  accommodation?: AccommodationRecommendation;
  estimatedCost: Money;
}

export interface TripCostBreakdown {
  transport: Money;
  accommodation: Money;
  baggage: Money;
  food: Money;
  localTransport: Money;
  activities: Money;
  insurance: Money;
  visa: Money;
  other: Money;
  total: Money;
  currency: CurrencyCode;
}

/** Optional hints for a future convenience score — no score is computed yet. */
export interface TripConvenienceHints {
  transferCount?: number;
  overnightTravel?: boolean;
  airportChanges?: number;
  totalTravelMinutes?: number;
  visaMayBeRequired?: boolean;
  longLayovers?: boolean;
}

export interface TripOption {
  id: string;
  destination: PlaceRef;
  country: string;
  countryCode: string;
  startDate: ISODate;
  endDate: ISODate;
  nights: number;
  travelers: TravelGroup;
  totalPrice: Money;
  transportSummary: {
    type: TransportStepType;
    originName: string;
  };
  accommodationSummary: {
    name: string;
    stars: number;
  };
  highlightKeys: string[];
  tagKeys: string[];
  imageUrl: string;
  imageAlt: string;
}

/** High-level option plus the data needed for the trip overview (no daily itinerary yet). */
export interface TripOptionDetails {
  option: TripOption;
  transport: TransportationStep[];
  stay: AccommodationSearchResult;
  cost: TripCostBreakdown;
  budget?: Money;
}

/** Complete planned trip produced by the Vacation Planner service. */
export interface TripPlan {
  id: string;
  destination: PlaceRef;
  origins: PlaceRef[];
  startDate: ISODate;
  endDate: ISODate;
  travelers: TravelGroup;
  summaryKey: string;
  days: DayPlan[];
  transport: TransportationStep[];
  accommodation: AccommodationRecommendation[];
  cost: TripCostBreakdown;
  budget?: Money;
  convenience?: TripConvenienceHints;
  selectedTransportOfferIds: string[];
  selectedAccommodationId?: string;
}

export const TRIP_COST_KEYS = [
  'transport',
  'accommodation',
  'baggage',
  'food',
  'localTransport',
  'activities',
  'insurance',
  'visa',
  'other',
] as const satisfies ReadonlyArray<keyof Omit<TripCostBreakdown, 'total' | 'currency'>>;

export type TripCostLineKey = (typeof TRIP_COST_KEYS)[number];
