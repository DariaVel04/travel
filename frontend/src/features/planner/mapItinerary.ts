import { travellerCount } from './plannerDates';
import type { Itinerary, ItineraryDay, ItineraryStop, StopKind } from './types';
import type { DayPlan, TripPlan } from './tripPlan';

const STOP_FROM_TITLE: Array<{ match: string; kind: StopKind }> = [
  { match: 'museum', kind: 'museum' },
  { match: 'beach', kind: 'beach' },
  { match: 'nature', kind: 'nature_spot' },
  { match: 'market', kind: 'market' },
  { match: 'checkIn', kind: 'hotel' },
  { match: 'restaurant', kind: 'restaurant' },
  { match: 'localFood', kind: 'restaurant' },
];

/** Maps a TripPlan onto the existing Itinerary shape used by Trip Assembly. */
export function tripPlanToItinerary(plan: TripPlan): Itinerary {
  return {
    id: plan.id,
    destinationName: plan.destination.name,
    durationDays: plan.days.length,
    travellerCount: travellerCount(plan.travelers),
    days: plan.days.map(toItineraryDay),
    stays: [],
    destinationIds: plan.destination.id ? [plan.destination.id] : [],
  };
}

function toItineraryDay(day: DayPlan): ItineraryDay {
  const stops: ItineraryStop[] = [
    ...day.activities.map((activity) => ({
      id: activity.id,
      kind: kindFromTitleKey(activity.titleKey),
      name: activity.locationName,
      plannedDurationMinutes: activity.durationMinutes ?? 90,
    })),
    ...day.meals.map((meal) => ({
      id: meal.id,
      kind: 'restaurant' as const,
      plannedDurationMinutes: 60,
    })),
  ];
  return { dayNumber: day.dayNumber, stops };
}

function kindFromTitleKey(titleKey: string): StopKind {
  const found = STOP_FROM_TITLE.find((item) => titleKey.includes(item.match));
  return found?.kind ?? 'city_center';
}
