import type { AccommodationSearchResult, AccommodationTypeFilter } from '@/features/hotels/types';
import type { CurrencyCode, Money, YearMonth } from '@/types/common';
import type { PlaceRef } from '@/types/location';
import type { TransportLeg, TransportMode } from '@/features/transportation/types';
import type { TripCostEstimate } from '@/features/trips/types';
import type {
  CLIMATE_PREFERENCES,
  COMFORT_LEVELS,
  FOOD_PREFERENCES,
  INTERESTS,
  STOP_KINDS,
  TRAVEL_PACES,
  TRIP_TYPES,
} from './options';

export type TripType = (typeof TRIP_TYPES)[number];
export type ClimatePreference = (typeof CLIMATE_PREFERENCES)[number];
export type TravelPace = (typeof TRAVEL_PACES)[number];
export type ComfortLevel = (typeof COMFORT_LEVELS)[number];
export type Interest = (typeof INTERESTS)[number];
export type FoodPreference = (typeof FOOD_PREFERENCES)[number];
export type StopKind = (typeof STOP_KINDS)[number];

export interface TravelGroup {
  adults: number;
  children: number;
  /** One entry per child; lets the planner pick age-appropriate activities. */
  childrenAges: number[];
  seniors: number;
  pets: number;
}

export interface TravelPreferences {
  budget?: Money;
  currency?: CurrencyCode;
  climate: ClimatePreference;
  pace: TravelPace;
  comfort: ComfortLevel;
  interests: Interest[];
  food: FoodPreference[];
}

export interface PlannerStayPreferences {
  type: AccommodationTypeFilter;
  rooms: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
}

/** Everything the user tells the AI Vacation Planner. */
export interface PlannerRequest {
  /** Where the trip starts. Empty means the origin is not specified. */
  origins?: PlaceRef[];
  /** Empty means "suggest destinations for me". */
  destinations?: PlaceRef[];
  departureMonth?: YearMonth;
  durationDays: number;
  group: TravelGroup;
  tripTypes: TripType[];
  preferences: TravelPreferences;
  transportMode?: TransportMode;
  stay: PlannerStayPreferences;
}

export interface ItineraryStop {
  id: string;
  kind: StopKind;
  /** Real place name once a places API is connected. */
  name?: string;
  plannedDurationMinutes: number;
  /** How the traveller gets here from the previous stop. */
  legFromPrevious?: TransportLeg;
}

export interface ItineraryDay {
  dayNumber: number;
  stops: ItineraryStop[];
}

/** Day-by-Day Trip Planner output. */
export interface Itinerary {
  id: string;
  destinationName?: string;
  durationDays: number;
  travellerCount: number;
  transportMode?: TransportMode;
  days: ItineraryDay[];
  stays: AccommodationSearchResult[];
  /** Location ids used to open Hotels search for the same destination. */
  destinationIds: string[];
  costEstimate?: TripCostEstimate;
}
