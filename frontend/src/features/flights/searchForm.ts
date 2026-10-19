import type { ISODate, YearMonth } from '@/types/common';
import type { TravelLocation } from '@/types/location';
import { toPlaceRef } from '@/utils/location';
import type { FLEX_DAYS_OPTIONS } from './options';
import type {
  BaggagePreference,
  CabinClass,
  CheapestWithinMonths,
  DateMode,
  DateSelection,
  DepartureTimeWindow,
  DurationPreset,
  FlightSearchParams,
  JourneyPreference,
  JourneyTransportMode,
  OfferSourceType,
  OvernightPreference,
  SearchLeg,
  StopsPreference,
  TransportFilter,
  TripDuration,
  TripKind,
} from './types';

export type FlexDays = (typeof FLEX_DAYS_OPTIONS)[number];

export interface SearchLegValues {
  origins: TravelLocation[];
  destinations: TravelLocation[];
}

/**
 * The raw state of the search form. It's flat and uses strings where inputs produce strings;
 * `toFlightSearchParams` converts it into the clean domain type used by services.
 */
export interface FlightSearchFormValues {
  tripKind: TripKind;
  transport: TransportFilter;
  mixedModes: JourneyTransportMode[];
  legs: SearchLegValues[];
  dateMode: DateMode;
  departureDate: ISODate;
  returnDate: ISODate;
  rangeFrom: ISODate;
  rangeTo: ISODate;
  flexDate: ISODate;
  flexDays: FlexDays;
  months: YearMonth[];
  cheapestWithin: CheapestWithinMonths;
  durationPreset: DurationPreset | 'custom';
  customMinDays: number;
  customMaxDays: number;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  stops: StopsPreference;
  baggage: BaggagePreference;
  departureTime: DepartureTimeWindow;
  overnight: OvernightPreference;
  preference: JourneyPreference;
  sources: OfferSourceType[];
}

export const MAX_JOURNEY_LEGS = 6;

function emptyLeg(): SearchLegValues {
  return { origins: [], destinations: [] };
}

export function createSearchLeg(
  origins: TravelLocation[] = [],
  destinations: TravelLocation[] = [],
): SearchLegValues {
  return { origins, destinations };
}

export function legsForTripKind(tripKind: TripKind, current: SearchLegValues[]): SearchLegValues[] {
  const first = current[0] ?? emptyLeg();

  if (tripKind === 'one_way') {
    return [first];
  }

  if (tripKind === 'multi_city') {
    if (current.length >= 2) return current.slice(0, MAX_JOURNEY_LEGS);
    return [first, createSearchLeg(first.destinations, [])];
  }

  const existingReturn = current[1];
  if (
    existingReturn &&
    (existingReturn.origins.length > 0 || existingReturn.destinations.length > 0)
  ) {
    return [first, existingReturn];
  }

  return [first, createSearchLeg(first.destinations, first.origins)];
}

export function createInitialFormValues(
  prefill: { origins?: TravelLocation[]; destinations?: TravelLocation[] } = {},
): FlightSearchFormValues {
  const outbound = createSearchLeg(prefill.origins ?? [], prefill.destinations ?? []);
  return {
    tripKind: 'round_trip',
    transport: 'any',
    mixedModes: ['flight', 'train'],
    legs: [outbound, createSearchLeg(outbound.destinations, outbound.origins)],
    dateMode: 'flexible',
    departureDate: '',
    returnDate: '',
    rangeFrom: '',
    rangeTo: '',
    flexDate: '',
    flexDays: 3,
    months: [],
    cheapestWithin: 6,
    durationPreset: 7,
    customMinDays: 5,
    customMaxDays: 10,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy',
    stops: 'any',
    baggage: 'none',
    departureTime: 'any',
    overnight: 'any',
    preference: 'cheapest',
    sources: ['airline', 'ota', 'tour_operator', 'charter', 'package'],
  };
}

const DEFAULT_SOURCES = ['airline', 'ota', 'tour_operator', 'charter', 'package'] as const;

export function resetFlightPreferences(values: FlightSearchFormValues): FlightSearchFormValues {
  return {
    ...values,
    cabinClass: 'economy',
    stops: 'any',
    baggage: 'none',
    departureTime: 'any',
    overnight: 'any',
    preference: 'cheapest',
    sources: [...DEFAULT_SOURCES],
  };
}

function toDateSelection(values: FlightSearchFormValues): DateSelection {
  switch (values.dateMode) {
    case 'exact':
      return {
        mode: 'exact',
        departureDate: values.departureDate,
        returnDate: values.tripKind === 'one_way' ? undefined : values.returnDate,
      };
    case 'range':
      return { mode: 'range', from: values.rangeFrom, to: values.rangeTo };
    case 'flexible':
      return { mode: 'flexible', date: values.flexDate, flexDays: values.flexDays };
    case 'months':
      return { mode: 'months', months: values.months };
    case 'cheapest':
      return { mode: 'cheapest', withinMonths: values.cheapestWithin };
  }
}

function toTripDuration(values: FlightSearchFormValues): TripDuration {
  return values.durationPreset === 'custom'
    ? { type: 'custom', minDays: values.customMinDays, maxDays: values.customMaxDays }
    : { type: 'preset', days: values.durationPreset };
}

export function isReturnTrip(tripKind: TripKind): boolean {
  return tripKind !== 'one_way';
}

/** Duration only matters when the traveller comes back and exact dates aren't given. */
export function needsDuration(values: FlightSearchFormValues): boolean {
  return isReturnTrip(values.tripKind) && values.dateMode !== 'exact';
}

export function isFlightRelevant(
  values: Pick<FlightSearchFormValues, 'transport' | 'mixedModes'>,
): boolean {
  return (
    values.transport === 'flight' ||
    values.transport === 'any' ||
    (values.transport === 'mixed' && values.mixedModes.includes('flight'))
  );
}

export function passengerTotal(
  values: Pick<FlightSearchFormValues, 'adults' | 'children' | 'infants'>,
): number {
  return values.adults + values.children + values.infants;
}

function toSearchLegs(values: FlightSearchFormValues): SearchLeg[] {
  return values.legs.map((leg) => ({
    origins: leg.origins.map(toPlaceRef),
    destinations: leg.destinations.map(toPlaceRef),
  }));
}

export function toFlightSearchParams(values: FlightSearchFormValues): FlightSearchParams {
  const legs = toSearchLegs(values);
  const first = legs[0];
  const last = values.tripKind === 'multi_city' ? legs[legs.length - 1] : first;

  return {
    tripKind: values.tripKind,
    transport: values.transport,
    mixedModes: values.transport === 'mixed' ? values.mixedModes : [],
    legs,
    origins: first?.origins ?? [],
    destinations: last?.destinations ?? [],
    dates: toDateSelection(values),
    duration: needsDuration(values) ? toTripDuration(values) : undefined,
    passengers: { adults: values.adults, children: values.children, infants: values.infants },
    cabinClass: isFlightRelevant(values) ? values.cabinClass : undefined,
    stops: values.stops,
    baggage: values.baggage,
    departureTime: values.departureTime,
    overnight: values.overnight,
    preference: values.preference,
    sources: isFlightRelevant(values) ? values.sources : [],
  };
}
