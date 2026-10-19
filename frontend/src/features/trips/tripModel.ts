import type { JourneyOffer } from '@/features/flights/types';
import type { AccommodationSearchResult } from '@/features/hotels/types';
import { resolvePlannerDates } from '@/features/planner/plannerDates';
import { tripPlanToItinerary } from '@/features/planner/mapItinerary';
import type { TripOptionDetails, TripPlan } from '@/features/planner/tripPlan';
import type { PlannerRequest, TravelGroup, TravelPreferences } from '@/features/planner/types';
import { TRANSPORT_MODES } from '@/features/transportation/options';
import type { TransportMode } from '@/features/transportation/types';
import type { CurrencyCode, ISODate, Money } from '@/types/common';
import type { PlaceRef } from '@/types/location';
import { money, sumMoney } from '@/utils/money';
import type { Trip, TripTravelers, TripWarning } from './types';

/** Planner output that can be folded into the current Trip without a second copy of trip state. */
export interface PlannerTripInput {
  request?: PlannerRequest;
  option?: TripOptionDetails;
  plan?: TripPlan;
}

const CURRENCIES: ReadonlyArray<CurrencyCode> = [
  'EUR',
  'USD',
  'GBP',
  'SEK',
  'NOK',
  'DKK',
  'CHF',
  'THB',
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const DEFAULT_TRAVELERS: TripTravelers = {
  adults: 2,
  children: 0,
  infants: 0,
};

export function createEmptyTrip(): Trip {
  return {
    id: `trip-${Date.now().toString(36)}`,
    travelers: { ...DEFAULT_TRAVELERS },
    transport: [],
    activities: [],
    estimatedTotal: money(0),
    currency: 'EUR',
    warnings: [],
  };
}

export function travelerCount(travelers: TripTravelers): number {
  return travelers.adults + travelers.children + travelers.infants + (travelers.seniors ?? 0);
}

export function tripItemCount(trip: Trip | null): number {
  if (!trip) return 0;
  return trip.transport.length + (trip.accommodation ? 1 : 0);
}

export function isTripStarted(trip: Trip | null): boolean {
  if (!trip) return false;
  return Boolean(
    trip.destination ||
      trip.startDate ||
      trip.endDate ||
      trip.transport.length > 0 ||
      trip.accommodation ||
      trip.preferences ||
      trip.selectedTripOptionId,
  );
}

export function datesFromOffer(offer: JourneyOffer): { startDate?: ISODate; endDate?: ISODate } {
  const times = offer.journeys.flatMap((journey) =>
    journey.segments.flatMap((segment) => [segment.departure, segment.arrival]),
  );
  if (times.length === 0) return {};
  const sorted = [...times].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return {
    startDate: first ? first.slice(0, 10) : undefined,
    endDate: last ? last.slice(0, 10) : undefined,
  };
}

export function destinationFromOffer(offer: JourneyOffer): PlaceRef | undefined {
  const firstJourney = offer.journeys[0];
  if (!firstJourney) return undefined;
  const lastSegment = firstJourney.segments[firstJourney.segments.length - 1];
  return lastSegment?.destination;
}

export function addTransportToTrip(
  trip: Trip | null,
  offer: JourneyOffer,
  extras?: { travelers?: TripTravelers },
): Trip {
  const base = trip ?? createEmptyTrip();
  if (base.transport.some((item) => item.id === offer.id)) return finalizeTrip(base);

  return finalizeTrip({
    ...base,
    transport: [...base.transport, offer],
    destination: base.destination ?? destinationFromOffer(offer),
    startDate: base.startDate ?? datesFromOffer(offer).startDate,
    endDate: base.endDate ?? datesFromOffer(offer).endDate,
    travelers: trip ? base.travelers : (extras?.travelers ?? base.travelers),
  });
}

export function addAccommodationToTrip(
  trip: Trip | null,
  stay: AccommodationSearchResult,
  extras?: { startDate?: ISODate; endDate?: ISODate; travelers?: TripTravelers },
): Trip {
  const base = trip ?? createEmptyTrip();
  if (base.accommodation?.id === stay.id) return finalizeTrip(base);

  return finalizeTrip({
    ...base,
    accommodation: stay,
    destination: base.destination ?? stay.destination,
    startDate: base.startDate ?? extras?.startDate,
    endDate: base.endDate ?? extras?.endDate,
    travelers: trip ? base.travelers : (extras?.travelers ?? base.travelers),
  });
}

export function removeTransportFromTrip(trip: Trip, offerId: string): Trip {
  return finalizeTrip({
    ...trip,
    transport: trip.transport.filter((item) => item.id !== offerId),
  });
}

export function removeAccommodationFromTrip(trip: Trip): Trip {
  return finalizeTrip({ ...trip, accommodation: undefined });
}

/**
 * Maps Vacation Planner request / selected option / itinerary onto the current Trip.
 * Trip stays the single assembled representation; planner data is not stored twice.
 */
export function mapPlannerDataToTrip(trip: Trip | null, input: PlannerTripInput): Trip {
  const base = trip ?? createEmptyTrip();
  const { request, option, plan } = input;
  const requestDestination = request?.destinations?.find((place) => place.type !== 'anywhere');
  const plannerDates = request ? resolvePlannerDates(request) : undefined;
  const group = plan?.travelers ?? option?.option.travelers ?? request?.group;
  const plannerTotal = plan?.cost.total ?? option?.cost.total;
  const plannerCurrency =
    plan?.cost.currency ?? option?.cost.currency ?? request?.preferences.currency;
  const accommodation = option?.stay ?? base.accommodation;

  const preferences = mergePlannerPreferences(base.preferences, request, option, plan);

  const next = finalizeTrip({
    ...base,
    destination: plan?.destination ?? option?.option.destination ?? requestDestination ?? base.destination,
    startDate: plan?.startDate ?? option?.option.startDate ?? plannerDates?.startDate ?? base.startDate,
    endDate: plan?.endDate ?? option?.option.endDate ?? plannerDates?.endDate ?? base.endDate,
    travelers: group ? travelersFromPlanner(group) : base.travelers,
    accommodation,
    preferences,
    transportMode: request?.transportMode ?? base.transportMode,
    selectedTripOptionId: option?.option.id,
    itinerary: plan
      ? {
          ...tripPlanToItinerary(plan),
          stays: accommodation ? [accommodation] : [],
          transportMode: request?.transportMode ?? base.transportMode,
        }
      : undefined,
    tripPlan: plan,
    estimatedTotal: plannerTotal ?? base.estimatedTotal,
    currency: plannerCurrency ?? base.currency,
  });

  if (plannerTotal && !plan) {
    return {
      ...next,
      estimatedTotal: plannerTotal,
      currency: plannerCurrency ?? next.currency,
    };
  }

  return next;
}

export function applyTripPlanToTrip(trip: Trip | null, plan: TripPlan): Trip {
  return mapPlannerDataToTrip(trip, { plan });
}

export function applyPlannerRequestToTrip(trip: Trip | null, request: PlannerRequest): Trip {
  return mapPlannerDataToTrip(trip, { request });
}

export function finalizeTrip(trip: Trip): Trip {
  if (trip.tripPlan) {
    return {
      ...trip,
      currency: trip.tripPlan.cost.currency,
      estimatedTotal: trip.tripPlan.cost.total,
      warnings: collectWarnings(trip),
    };
  }

  const currency =
    trip.transport[0]?.price.total.currency ?? trip.accommodation?.totalPrice.currency ?? 'EUR';
  const parts: Money[] = [
    ...trip.transport.map((offer) => offer.price.total),
    ...(trip.accommodation ? [trip.accommodation.totalPrice] : []),
  ];

  return {
    ...trip,
    currency,
    estimatedTotal: sumMoney(parts, currency),
    warnings: collectWarnings(trip),
  };
}

export function parseTrip(value: unknown): Trip | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || value.id.length === 0) return null;
  if (!isTravelers(value.travelers)) return null;
  if (!Array.isArray(value.transport)) return null;
  if (!Array.isArray(value.activities)) return null;

  const transport: JourneyOffer[] = [];
  for (const item of value.transport) {
    const offer = parseJourneyOffer(item);
    if (!offer) return null;
    transport.push(offer);
  }

  let accommodation: AccommodationSearchResult | undefined;
  if (value.accommodation !== undefined) {
    const stay = parseStay(value.accommodation);
    if (!stay) return null;
    accommodation = stay;
  }

  const destination = parseOptionalPlace(value.destination);
  if (value.destination !== undefined && !destination) return null;

  const startDate = parseOptionalDate(value.startDate);
  if (value.startDate !== undefined && !startDate) return null;
  const endDate = parseOptionalDate(value.endDate);
  if (value.endDate !== undefined && !endDate) return null;

  if (!isMoney(value.estimatedTotal)) return null;
  const currency = parseCurrency(value.currency);
  if (!currency) return null;

  const parsed = finalizeTrip({
    id: value.id,
    destination,
    startDate,
    endDate,
    travelers: value.travelers,
    transport,
    accommodation,
    activities: [],
    preferences: isRecord(value.preferences)
      ? (value.preferences as unknown as TravelPreferences)
      : undefined,
    transportMode: parseTransportMode(value.transportMode),
    selectedTripOptionId:
      typeof value.selectedTripOptionId === 'string' ? value.selectedTripOptionId : undefined,
    tripPlan: parseTripPlan(value.tripPlan),
    estimatedTotal: value.estimatedTotal,
    currency,
    warnings: [],
  });

  if (
    !parsed.tripPlan &&
    parsed.selectedTripOptionId &&
    isMoney(value.estimatedTotal)
  ) {
    return { ...parsed, estimatedTotal: value.estimatedTotal, currency };
  }

  return parsed;
}

function parseTripPlan(value: unknown): TripPlan | undefined {
  if (!isRecord(value) || typeof value.id !== 'string') return undefined;
  if (!Array.isArray(value.days) || !isRecord(value.cost)) return undefined;
  return value as unknown as TripPlan;
}

function travelersFromPlanner(group: TravelGroup): TripTravelers {
  return {
    adults: group.adults,
    children: group.children,
    infants: 0,
    seniors: group.seniors,
    pets: group.pets,
    childrenAges: group.childrenAges,
  };
}

function mergePlannerPreferences(
  current: TravelPreferences | undefined,
  request: PlannerRequest | undefined,
  option: TripOptionDetails | undefined,
  plan: TripPlan | undefined,
): TravelPreferences | undefined {
  if (!request && !current) return undefined;

  const base = request?.preferences ?? current;
  if (!base) return undefined;

  return {
    ...base,
    budget: plan?.budget ?? option?.budget ?? request?.preferences.budget ?? current?.budget,
    currency:
      plan?.cost.currency ??
      option?.cost.currency ??
      request?.preferences.currency ??
      current?.currency ??
      base.currency,
  };
}

function collectWarnings(trip: Trip): TripWarning[] {
  const warnings: TripWarning[] = [];
  const destinations: PlaceRef[] = [];
  const datePairs: Array<{ startDate?: ISODate; endDate?: ISODate }> = [];

  trip.transport.forEach((offer) => {
    const destination = destinationFromOffer(offer);
    if (destination) destinations.push(destination);
    datePairs.push(datesFromOffer(offer));
  });

  if (trip.accommodation) destinations.push(trip.accommodation.destination);

  if (
    trip.destination &&
    destinations.some((place) => !samePlace(place, trip.destination))
  ) {
    warnings.push({ code: 'destination_mismatch' });
  }

  if (
    trip.startDate &&
    trip.endDate &&
    datePairs.some(
      (dates) =>
        (dates.startDate && dates.startDate !== trip.startDate) ||
        (dates.endDate && dates.endDate !== trip.endDate),
    )
  ) {
    warnings.push({ code: 'dates_mismatch' });
  }

  return warnings;
}

function samePlace(left: PlaceRef, right?: PlaceRef): boolean {
  if (!right) return true;
  if (left.id && right.id) return left.id === right.id;
  if (left.code && right.code) return left.code === right.code;
  return normalizeName(left.name) === normalizeName(right.name);
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function parseJourneyOffer(value: unknown): JourneyOffer | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string') return null;
  if (!Array.isArray(value.journeys)) return null;
  if (!isRecord(value.price) || !isMoney(value.price.total)) return null;

  for (const item of value.journeys) {
    if (!isRecord(item) || !Array.isArray(item.segments)) return null;
  }

  return value as unknown as JourneyOffer;
}

function parseStay(value: unknown): AccommodationSearchResult | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  if (!isMoney(value.totalPrice)) return null;
  if (!isRecord(value.destination) || typeof value.destination.name !== 'string') return null;
  return value as unknown as AccommodationSearchResult;
}

function parseOptionalPlace(value: unknown): PlaceRef | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.type !== 'string') {
    return undefined;
  }
  return value as unknown as PlaceRef;
}

function parseOptionalDate(value: unknown): ISODate | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'string' && ISO_DATE.test(value) ? value : undefined;
}

function parseCurrency(value: unknown): CurrencyCode | undefined {
  return typeof value === 'string' && CURRENCIES.includes(value as CurrencyCode)
    ? (value as CurrencyCode)
    : undefined;
}

function parseTransportMode(value: unknown): TransportMode | undefined {
  return typeof value === 'string' &&
    (TRANSPORT_MODES as ReadonlyArray<string>).includes(value)
    ? (value as TransportMode)
    : undefined;
}

function isTravelers(value: unknown): value is TripTravelers {
  if (!isRecord(value)) return false;
  return (
    isNonNegativeInt(value.adults) &&
    isNonNegativeInt(value.children) &&
    isNonNegativeInt(value.infants)
  );
}

function isMoney(value: unknown): value is Money {
  if (!isRecord(value)) return false;
  return typeof value.amountMinor === 'number' && Number.isFinite(value.amountMinor);
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
