import type { AccommodationTypeFilter } from '@/features/hotels/types';
import type { TransportMode } from '@/features/transportation/types';
import type { CurrencyCode, YearMonth } from '@/types/common';
import type { LocationType, TravelLocation } from '@/types/location';
import { toPlaceRef } from '@/utils/location';
import { money } from '@/utils/money';
import type {
  ClimatePreference,
  ComfortLevel,
  FoodPreference,
  Interest,
  PlannerRequest,
  TravelGroup,
  TravelPace,
  TripType,
} from './types';

export const PLANNER_LOCATION_TYPES = ['city', 'country', 'region'] as const satisfies ReadonlyArray<
  LocationType
>;

export const PLANNER_CURRENCIES = ['EUR', 'USD', 'GBP', 'THB'] as const satisfies ReadonlyArray<
  CurrencyCode
>;

/** Raw state of the planner form; converted to a PlannerRequest on submit. */
export interface PlannerFormValues {
  origins: TravelLocation[];
  destinations: TravelLocation[];
  departureMonth: YearMonth | '';
  durationDays: number;
  group: TravelGroup;
  tripTypes: TripType[];
  budget: string;
  currency: (typeof PLANNER_CURRENCIES)[number];
  climate: ClimatePreference;
  pace: TravelPace;
  comfort: ComfortLevel;
  interests: Interest[];
  food: FoodPreference[];
  /** null until the user answers "How do you want to move around?". */
  transportMode: TransportMode | null;
  stayType: AccommodationTypeFilter;
  rooms: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
}

export const DEFAULT_CHILD_AGE = 8;

export function createInitialPlannerValues(
  prefill: {
    origins?: TravelLocation[];
    destinations?: TravelLocation[];
    tripType?: TripType;
  } = {},
): PlannerFormValues {
  return {
    origins: prefill.origins ?? [],
    destinations: prefill.destinations ?? [],
    departureMonth: '',
    durationDays: 7,
    group: { adults: 2, children: 0, childrenAges: [], seniors: 0, pets: 0 },
    tripTypes: prefill.tripType ? [prefill.tripType] : [],
    budget: '',
    currency: 'EUR',
    climate: 'any',
    pace: 'moderate',
    comfort: 'standard',
    interests: [],
    food: [],
    transportMode: null,
    stayType: 'any',
    rooms: 1,
    breakfastIncluded: false,
    freeCancellation: false,
  };
}

export function resetPlannerPreferences(values: PlannerFormValues): PlannerFormValues {
  return {
    ...values,
    tripTypes: [],
    budget: '',
    currency: 'EUR',
    climate: 'any',
    pace: 'moderate',
    comfort: 'standard',
    interests: [],
    food: [],
    transportMode: null,
    stayType: 'any',
    rooms: 1,
    breakfastIncluded: false,
    freeCancellation: false,
  };
}

/** Keeps one age entry per child when the number of children changes. */
export function resizeChildrenAges(ages: number[], childCount: number): number[] {
  return Array.from({ length: childCount }, (_, index) => ages[index] ?? DEFAULT_CHILD_AGE);
}

export function toPlannerRequest(values: PlannerFormValues): PlannerRequest {
  const budgetAmount = Number.parseFloat(values.budget);

  return {
    origins: values.origins.length > 0 ? values.origins.map(toPlaceRef) : undefined,
    destinations: values.destinations.length > 0 ? values.destinations.map(toPlaceRef) : undefined,
    departureMonth: values.departureMonth || undefined,
    durationDays: values.durationDays,
    group: values.group,
    tripTypes: values.tripTypes,
    preferences: {
      budget:
        Number.isFinite(budgetAmount) && budgetAmount > 0
          ? money(budgetAmount, values.currency)
          : undefined,
      currency: values.currency,
      climate: values.climate,
      pace: values.pace,
      comfort: values.comfort,
      interests: values.interests,
      food: values.food,
    },
    transportMode: values.transportMode ?? undefined,
    stay: {
      type: values.stayType,
      rooms: Math.max(1, values.rooms),
      breakfastIncluded: values.breakfastIncluded,
      freeCancellation: values.freeCancellation,
    },
  };
}
