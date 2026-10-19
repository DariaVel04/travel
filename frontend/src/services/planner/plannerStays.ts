import type {
  AccommodationSearchParams,
  AccommodationSearchResult,
  AccommodationSort,
  Amenity,
  RatingFilter,
} from '@/features/hotels/types';
import type { PlannerRequest } from '@/features/planner/types';
import { refineAccommodations, searchAccommodations } from '@/services/accommodation/accommodationService';
import { resolveLocations } from '@/services/locations/locationService';
import type { ISODate } from '@/types/common';
import type { TravelLocation } from '@/types/location';
import { todayISODate, toISODate } from '@/utils/date';
import { toPlaceRef } from '@/utils/location';

const FALLBACK_DESTINATION = 'region-europe';
const MAX_SUGGESTIONS = 3;
const MAX_ROOMS = 8;

export interface PlannerStaySuggestions {
  stays: AccommodationSearchResult[];
  destinations: TravelLocation[];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function stayDates(request: PlannerRequest): { checkIn: ISODate; checkOut: ISODate } {
  const start = request.departureMonth
    ? new Date(`${request.departureMonth}-10T00:00:00`)
    : addDays(new Date(`${todayISODate()}T00:00:00`), 21);
  const nights = Math.max(1, request.durationDays - 1);

  return {
    checkIn: toISODate(start),
    checkOut: toISODate(addDays(start, nights)),
  };
}

function ratingForRequest(request: PlannerRequest): RatingFilter {
  if (request.preferences.comfort === 'luxury' || request.tripTypes.includes('luxury')) {
    return '4_5';
  }
  if (request.preferences.comfort === 'premium') return '4';
  return 'any';
}

function sortForRequest(request: PlannerRequest): AccommodationSort {
  if (request.preferences.comfort === 'budget' || request.tripTypes.includes('budget')) {
    return 'price_asc';
  }
  if (
    request.preferences.comfort === 'luxury' ||
    request.preferences.comfort === 'premium' ||
    request.tripTypes.includes('luxury')
  ) {
    return 'rating';
  }
  return 'recommended';
}

function amenitiesForRequest(request: PlannerRequest): Amenity[] {
  return request.group.pets > 0 ? ['pets_allowed'] : [];
}

export function toPlannerAccommodationParams(
  request: PlannerRequest,
  destinations: TravelLocation[],
): AccommodationSearchParams {
  const { checkIn, checkOut } = stayDates(request);

  return {
    destinations: destinations.map(toPlaceRef),
    checkIn,
    checkOut,
    adults: request.group.adults + request.group.seniors,
    children: request.group.children,
    childAges: request.group.childrenAges.slice(0, request.group.children),
    rooms: Math.min(MAX_ROOMS, Math.max(1, request.stay.rooms)),
    type: request.stay.type,
    filters: {
      currency: 'any',
      minRating: ratingForRequest(request),
      amenities: amenitiesForRequest(request),
      freeCancellation: request.stay.freeCancellation,
      breakfastIncluded: request.stay.breakfastIncluded,
      privateBathroom: false,
    },
    sort: sortForRequest(request),
  };
}

export async function suggestPlannerStays(request: PlannerRequest): Promise<PlannerStaySuggestions> {
  const destinationIds = (request.destinations ?? [])
    .filter((place) => place.id && place.type !== 'anywhere')
    .map((place) => place.id)
    .filter((id): id is string => Boolean(id));
  const resolved = destinationIds.length > 0 ? await resolveLocations(destinationIds) : [];
  const destinations =
    resolved.length > 0 ? resolved : await resolveLocations([FALLBACK_DESTINATION]);

  if (destinations.length === 0) {
    return { stays: [], destinations: [] };
  }

  const params = toPlannerAccommodationParams(request, destinations);
  const matches = await searchAccommodations(params);
  const refined = refineAccommodations(matches, params);
  const pool = refined.length > 0 ? refined : matches;

  return { stays: pool.slice(0, MAX_SUGGESTIONS), destinations };
}
