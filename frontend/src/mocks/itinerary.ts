import type { AccommodationSearchResult } from '@/features/hotels/types';
import type {
  Itinerary,
  ItineraryDay,
  ItineraryStop,
  PlannerRequest,
  StopKind,
} from '@/features/planner/types';
import type { TransportLeg, TransportMode } from '@/features/transportation/types';
import type { TravelLocation } from '@/types/location';
import { money } from '@/utils/money';

/** Stop templates for the first days. Day 3 goes further out, which suits a rental car. */
const DAY_TEMPLATES: StopKind[][] = [
  ['hotel', 'city_center', 'museum', 'restaurant'],
  ['hotel', 'old_town', 'market', 'viewpoint', 'restaurant'],
  ['hotel', 'nature_spot', 'beach', 'restaurant'],
];

const PREVIEW_DAYS = DAY_TEMPLATES.length;

const PUBLIC_VEHICLES = ['metro', 'bus', 'tram'] as const;

/** Very rough demo numbers that show how the transport choice changes the plan. */
function buildLeg(mode: TransportMode, legIndex: number, isFarStop: boolean): TransportLeg {
  switch (mode) {
    case 'public_transport':
      return {
        mode,
        vehicle: isFarStop
          ? 'train'
          : (PUBLIC_VEHICLES[legIndex % PUBLIC_VEHICLES.length] ?? 'bus'),
        durationMinutes: isFarStop ? 65 : 20,
        estimatedCost: money(isFarStop ? 6 : 2.5),
      };
    case 'taxi':
      return {
        mode,
        vehicle: 'taxi',
        durationMinutes: isFarStop ? 45 : 12,
        estimatedCost: money(isFarStop ? 48 : 14),
      };
    case 'rental_car':
      return {
        mode,
        vehicle: 'car',
        durationMinutes: isFarStop ? 40 : 15,
        // Fuel + parking for the leg.
        estimatedCost: money(isFarStop ? 9 : 4),
      };
  }
}

function buildDay(
  dayIndex: number,
  template: StopKind[],
  mode: TransportMode | undefined,
  stayName?: string,
): ItineraryDay {
  const stops: ItineraryStop[] = template.map((kind, stopIndex) => ({
    id: `day${dayIndex + 1}-stop${stopIndex + 1}`,
    kind,
    name: kind === 'hotel' ? stayName : undefined,
    plannedDurationMinutes: kind === 'hotel' ? 0 : 90,
    legFromPrevious:
      stopIndex === 0 || !mode ? undefined : buildLeg(mode, stopIndex, kind === 'nature_spot'),
  }));

  return { dayNumber: dayIndex + 1, stops };
}

const EMPTY_STAYS = { stays: [] as AccommodationSearchResult[], destinations: [] as TravelLocation[] };

export function buildMockItinerary(
  request: PlannerRequest,
  suggestions: {
    stays: AccommodationSearchResult[];
    destinations: TravelLocation[];
  } = EMPTY_STAYS,
): Itinerary {
  const { group } = request;
  const dayCount = Math.min(request.durationDays, PREVIEW_DAYS);
  const stayName = suggestions.stays[0]?.name;
  const firstStay = suggestions.stays[0];

  return {
    id: `mock-${Date.now()}`,
    destinationName:
      namedDestinations(request.destinations) ??
      firstStay?.destination.name ??
      suggestions.destinations[0]?.name,
    durationDays: request.durationDays,
    travellerCount: group.adults + group.children + group.seniors,
    transportMode: request.transportMode,
    days: DAY_TEMPLATES.slice(0, dayCount).map((template, index) =>
      buildDay(index, template, request.transportMode, stayName),
    ),
    stays: suggestions.stays,
    destinationIds: destinationIdsFor(suggestions),
  };
}

function namedDestinations(destinations: PlannerRequest['destinations']): string | undefined {
  const names = (destinations ?? [])
    .filter((place) => place.type !== 'anywhere')
    .map((place) => place.name)
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : undefined;
}

function destinationIdsFor(suggestions: {
  stays: AccommodationSearchResult[];
  destinations: TravelLocation[];
}): string[] {
  const ids = new Set<string>();
  suggestions.destinations.forEach((place) => {
    if (place.id !== 'anywhere') ids.add(place.id);
  });
  suggestions.stays.forEach((stay) => {
    if (stay.destination.id) ids.add(stay.destination.id);
  });
  return [...ids];
}
