import type { JourneyOffer } from '@/features/flights/types';
import type { AccommodationSearchResult } from '@/features/hotels/types';
import type { TripPlan } from '@/features/planner/tripPlan';
import type { Itinerary, TravelGroup, TravelPreferences } from '@/features/planner/types';
import type { TransportMode } from '@/features/transportation/types';
import type { Confidence, CurrencyCode, DateRange, ISODate, ISODateTime, Money } from '@/types/common';
import type { PlaceRef } from '@/types/location';

/* ---------- AI Total Cost ---------- */

/** Cost categories and the sub-items each one may contain. */
export interface CostSubcategories {
  flights: 'ticket' | 'baggage' | 'fees';
  accommodation: 'room' | 'taxes' | 'resort_fee' | 'cleaning_fee';
  food: 'restaurants' | 'groceries' | 'meals';
  transportation: 'public_transport' | 'taxi' | 'rental_car' | 'fuel' | 'parking' | 'tolls';
  other: 'activities' | 'tickets' | 'insurance' | 'visas' | 'other';
}

export type TripCostCategory = keyof CostSubcategories;

/**
 * A single cost line. The mapped type guarantees that the subcategory matches
 * its category, e.g. { category: 'food', subcategory: 'parking' } is a type error.
 */
export type CostLineItem = {
  [C in TripCostCategory]: {
    category: C;
    subcategory: CostSubcategories[C];
    amount: Money;
    /** true = AI estimate (e.g. food), false = known price (e.g. a flight offer). */
    isEstimate: boolean;
  };
}[TripCostCategory];

export interface TripCostEstimate {
  currency: CurrencyCode;
  travellerCount: number;
  items: CostLineItem[];
  total: Money;
  confidence: Confidence;
  generatedAt: ISODateTime;
}

/* ---------- Current trip being assembled ---------- */

export interface TripTravelers {
  adults: number;
  children: number;
  infants: number;
  seniors?: number;
  pets?: number;
  childrenAges?: number[];
}

export interface TripActivity {
  id: string;
  name?: string;
}

export type TripWarningCode = 'destination_mismatch' | 'dates_mismatch';

export interface TripWarning {
  code: TripWarningCode;
}

/**
 * One trip the traveller is putting together from Transport, Hotels and (later) Planner.
 * Transport and accommodation can be missing; several transport offers can be stored.
 */
export interface Trip {
  id: string;
  destination?: PlaceRef;
  startDate?: ISODate;
  endDate?: ISODate;
  travelers: TripTravelers;
  transport: JourneyOffer[];
  accommodation?: AccommodationSearchResult;
  activities: TripActivity[];
  preferences?: TravelPreferences;
  transportMode?: TransportMode;
  /** Id of the Vacation Planner option currently applied to this trip. */
  selectedTripOptionId?: string;
  /** Filled later by the AI day-by-day planner. */
  itinerary?: Itinerary;
  tripPlan?: TripPlan;
  estimatedTotal: Money;
  currency: CurrencyCode;
  warnings: TripWarning[];
}

/* ---------- Saved & shared trips (future) ---------- */

export type TripVisibility = 'private' | 'shared';

export interface SavedTrip {
  id: string;
  ownerId: string;
  title: string;
  destination?: PlaceRef;
  dates?: DateRange;
  group: TravelGroup;
  transportMode?: TransportMode;
  savedFlightOfferIds: string[];
  savedAccommodationIds: string[];
  itinerary?: Itinerary;
  costEstimate?: TripCostEstimate;
  visibility: TripVisibility;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type TripParticipantRole = 'owner' | 'editor' | 'voter' | 'viewer';

export interface TripParticipant {
  id: string;
  userId?: string;
  displayName: string;
  role: TripParticipantRole;
}

export interface TripVote {
  participantId: string;
  targetType: 'destination' | 'flight' | 'accommodation' | 'activity';
  targetId: string;
  value: 'up' | 'down';
}

/** Group travel: shared via a public link like /trip/abc123. */
export interface SharedTrip {
  tripId: string;
  shareSlug: string;
  participants: TripParticipant[];
  votes: TripVote[];
}
