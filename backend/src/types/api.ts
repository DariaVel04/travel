import type {
  AccommodationType,
  ActivityCategory,
  TransportType,
  TripCostCategory,
  TripStatus,
} from '@prisma/client';

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'SEK', 'NOK', 'DKK', 'CHF', 'THB'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export interface TravelersPayload {
  adults: number;
  children: number;
  infants?: number;
  seniors?: number;
  pets?: number;
  childrenAges?: number[];
}

export interface PlacePayload {
  name?: string;
  type?: string;
  code?: string;
  id?: string;
}

export interface TransportSummaryPayload {
  type: string;
  originName: string;
}

export interface AccommodationSummaryPayload {
  name: string;
  stars: number;
}

export interface TripResponse {
  id: string;
  userId: string | null;
  title: string;
  destination: PlacePayload | null;
  startDate: string | null;
  endDate: string | null;
  travelers: TravelersPayload;
  currency: string;
  budget: number | null;
  totalEstimatedCost: number;
  status: TripStatus;
  selectedTripOptionId: string | null;
  transportMode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripDetailResponse extends TripResponse {
  options: TripOptionResponse[];
  transports: TransportResponse[];
  accommodations: AccommodationResponse[];
  itinerary: ItineraryResponse | null;
  costs: TripCostResponse[];
}

export interface TripOptionResponse {
  id: string;
  tripId: string;
  destination: PlacePayload;
  country: string | null;
  countryCode: string | null;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: TravelersPayload;
  totalPrice: number;
  currency: string;
  transportSummary: TransportSummaryPayload;
  accommodationSummary: AccommodationSummaryPayload;
  highlights: string[];
  createdAt: string;
}

export interface TransportResponse {
  id: string;
  tripId: string | null;
  tripOptionId: string | null;
  type: TransportType;
  provider: string | null;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string | null;
  arrivalTime: string | null;
  duration: number | null;
  price: number;
  currency: string;
  stops: number;
  baggage: string | null;
  cabinClass: string | null;
  overnight: boolean;
  segments: unknown;
}

export interface AccommodationResponse {
  id: string;
  tripId: string | null;
  tripOptionId: string | null;
  name: string;
  destination: string;
  address: string | null;
  type: AccommodationType;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
}

export interface ActivityResponse {
  id: string;
  title: string;
  description: string | null;
  category: ActivityCategory;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  estimatedCost: number;
  currency: string;
}

export interface ItineraryDayResponse {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  description: string | null;
  estimatedCost: number;
  currency: string;
  activities: ActivityResponse[];
}

export interface ItineraryResponse {
  id: string;
  tripId: string;
  title: string | null;
  summary: string | null;
  days: ItineraryDayResponse[];
}

export interface TripCostResponse {
  id: string;
  category: TripCostCategory;
  amount: number;
  currency: string;
  description: string | null;
}

export interface HealthResponse {
  status: 'ok';
  db: 'up' | 'down';
}
