/** Frontend API models. These match backend JSON, not Prisma types. */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}

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

export interface TripRecord {
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
  status: string;
  selectedTripOptionId: string | null;
  transportMode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripOptionRecord {
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
  transportSummary: { type: string; originName: string };
  accommodationSummary: { name: string; stars: number };
  highlights: string[];
  createdAt: string;
}

export interface TransportRecord {
  id: string;
  tripId: string | null;
  type: string;
  provider: string | null;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string | null;
  arrivalTime: string | null;
  duration: number | null;
  price: number;
  currency: string;
  stops: number;
  overnight: boolean;
}

export interface AccommodationRecord {
  id: string;
  tripId: string | null;
  name: string;
  destination: string;
  address: string | null;
  type: string;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
}

export interface CreateTripPayload {
  title: string;
  destinationName?: string;
  startDate?: string;
  endDate?: string;
  travelers?: TravelersPayload;
  currency?: string;
  budget?: number;
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type SubscriptionPlan = 'FREE' | 'PREMIUM';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
}
