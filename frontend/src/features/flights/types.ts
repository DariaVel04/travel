import type { ISODate, ISODateTime, Money, YearMonth } from '@/types/common';
import type { IataCode, PlaceRef } from '@/types/location';
import type { BookingOption } from '@/types/partner';
import type { ConvenienceScore, InconvenienceFactor } from '@/types/scoring';
import type {
  BAGGAGE_PREFERENCES,
  CABIN_CLASSES,
  CHEAPEST_WITHIN_MONTHS,
  DATE_MODES,
  DEPARTURE_TIME_WINDOWS,
  DURATION_PRESETS,
  JOURNEY_PREFERENCES,
  JOURNEY_TRANSPORT_MODES,
  OFFER_SOURCE_TYPES,
  OVERNIGHT_PREFERENCES,
  STOPS_PREFERENCES,
  TRANSPORT_FILTERS,
  TRIP_KINDS,
} from './options';

export type TripKind = (typeof TRIP_KINDS)[number];
export type DateMode = (typeof DATE_MODES)[number];
export type DurationPreset = (typeof DURATION_PRESETS)[number];
export type CheapestWithinMonths = (typeof CHEAPEST_WITHIN_MONTHS)[number];
export type OfferSourceType = (typeof OFFER_SOURCE_TYPES)[number];
export type JourneyTransportMode = (typeof JOURNEY_TRANSPORT_MODES)[number];
export type TransportFilter = (typeof TRANSPORT_FILTERS)[number];
export type CabinClass = (typeof CABIN_CLASSES)[number];
export type StopsPreference = (typeof STOPS_PREFERENCES)[number];
export type BaggagePreference = (typeof BAGGAGE_PREFERENCES)[number];
export type DepartureTimeWindow = (typeof DEPARTURE_TIME_WINDOWS)[number];
export type OvernightPreference = (typeof OVERNIGHT_PREFERENCES)[number];
export type JourneyPreference = (typeof JOURNEY_PREFERENCES)[number];

/** How the user wants to pick dates. Each mode carries only the fields it needs. */
export type DateSelection =
  | { mode: 'exact'; departureDate: ISODate; returnDate?: ISODate }
  | { mode: 'range'; from: ISODate; to: ISODate }
  | { mode: 'flexible'; date: ISODate; flexDays: number }
  | { mode: 'months'; months: YearMonth[] }
  | { mode: 'cheapest'; withinMonths: CheapestWithinMonths };

export type TripDuration =
  { type: 'preset'; days: DurationPreset } | { type: 'custom'; minDays: number; maxDays: number };

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

/** One hop the traveller wants to search for (origin(s) → destination(s)). */
export interface SearchLeg {
  origins: PlaceRef[];
  destinations: PlaceRef[];
}

export interface FlightSearchParams {
  tripKind: TripKind;
  transport: TransportFilter;
  /** Used when `transport` is `mixed`. No route optimisation is applied yet. */
  mixedModes: JourneyTransportMode[];
  /** Outbound, return, or each multi-city hop — origins/destinations can differ per leg. */
  legs: SearchLeg[];
  /** First-leg origins, for callers that only need the start of the trip. */
  origins: PlaceRef[];
  destinations: PlaceRef[];
  dates: DateSelection;
  /** When dates are not fixed on a return-style trip. */
  duration?: TripDuration;
  passengers: PassengerCounts;
  cabinClass?: CabinClass;
  stops: StopsPreference;
  baggage: BaggagePreference;
  departureTime: DepartureTimeWindow;
  overnight: OvernightPreference;
  /** Stored for a future ranking/AI step. Not applied to mock results. */
  preference: JourneyPreference;
  sources: OfferSourceType[];
}

export interface FlightSegment {
  carrier: string;
  flightNumber: string;
  from: IataCode;
  to: IataCode;
  departureTime: ISODateTime;
  arrivalTime: ISODateTime;
  durationMinutes: number;
}

export interface Layover {
  arrivalAirport: IataCode;
  /** Differs from arrivalAirport when the traveller has to change airports. */
  departureAirport: IataCode;
  durationMinutes: number;
  overnight: boolean;
  /** Traveller collects bags and re-checks in themselves. */
  selfTransfer: boolean;
  transitVisaRequired?: boolean;
}

/** One direction of travel (outbound or inbound). */
export interface FlightJourney {
  segments: FlightSegment[];
  layovers: Layover[];
  totalDurationMinutes: number;
}

/** Everything the traveller must actually pay, not just the ticket. */
export interface FlightPriceBreakdown {
  base: Money;
  baggage?: Money;
  fees?: Money;
  /** e.g. transfer between airports during a self-transfer. */
  transfer?: Money;
  total: Money;
}

export type FlightOfferTag = 'special_offer' | 'last_minute';

export interface FlightOffer {
  id: string;
  sourceType: OfferSourceType;
  outbound: FlightJourney;
  inbound?: FlightJourney;
  price: FlightPriceBreakdown;
  bookingOptions: BookingOption[];
  inconveniences: InconvenienceFactor[];
  /** Filled in later by a ScoringStrategy. */
  convenienceScore?: ConvenienceScore;
  tags: FlightOfferTag[];
}

/**
 * One transport hop in a journey. Origins and destinations are independent
 * per segment so outbound and return do not have to share cities.
 */
export interface JourneySegment {
  id: string;
  mode: JourneyTransportMode;
  origin: PlaceRef;
  destination: PlaceRef;
  departure: ISODateTime;
  arrival: ISODateTime;
  durationMinutes: number;
  transfers: number;
  estimatedCost: Money;
  carrier?: string;
  vehicleCode?: string;
}

export type JourneyDirection = 'outbound' | 'inbound' | 'leg';

export interface Journey {
  id: string;
  direction: JourneyDirection;
  segments: JourneySegment[];
  totalDurationMinutes: number;
  totalTransfers: number;
  estimatedCost: Money;
}

/** A complete searchable option: one or more journeys made of mixed segments. */
export interface JourneyOffer {
  id: string;
  journeys: Journey[];
  modes: JourneyTransportMode[];
  price: FlightPriceBreakdown;
  bookingOptions: BookingOption[];
  inconveniences: InconvenienceFactor[];
  convenienceScore?: ConvenienceScore;
  tags: FlightOfferTag[];
  sourceType?: OfferSourceType;
  cabinClass?: CabinClass;
}
