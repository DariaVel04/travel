import type { Money } from '@/types/common';
import type { BookingOption } from '@/types/partner';
import type { PUBLIC_TRANSPORT_TYPES, TRANSPORT_MODES } from './options';

export type TransportMode = (typeof TRANSPORT_MODES)[number];
export type PublicTransportType = (typeof PUBLIC_TRANSPORT_TYPES)[number];

/** What actually moves the traveller on a single leg of the itinerary. */
export type TransportVehicle = PublicTransportType | 'taxi' | 'car' | 'walk';

/** Movement between two itinerary stops. */
export interface TransportLeg {
  mode: TransportMode;
  vehicle: TransportVehicle;
  durationMinutes: number;
  distanceKm?: number;
  estimatedCost?: Money;
}

/* ---------- Public transport ---------- */

export type PaymentMethod =
  'mobile_app' | 'contactless_card' | 'ticket_machine' | 'travel_card' | 'cash';

export interface TransportPass {
  id: string;
  name: string;
  operatorName: string;
  /** Official city/regional operator vs. a reseller partner. */
  isOfficial: boolean;
  validity: { hours: number };
  zones: string[];
  price: Money;
  paymentMethods: PaymentMethod[];
  purchaseUrl: string;
  partnerId?: string;
}

/* ---------- Taxi / ride-hailing ---------- */

export type RideServiceFeature =
  'app_booking' | 'card_payment' | 'cash_payment' | 'airport_pickup' | 'fixed_price' | 'child_seat';

export interface RideService {
  id: string;
  name: string;
  kind: 'ride_hailing' | 'local_taxi';
  rating?: number;
  baseFare?: Money;
  pricePerKm?: Money;
  features: RideServiceFeature[];
  url: string;
  partnerId?: string;
}

/* ---------- Rental car ---------- */

export type CarCategory = 'mini' | 'economy' | 'compact' | 'suv' | 'van' | 'premium' | 'electric';

export interface CarRentalOffer {
  id: string;
  companyName: string;
  carCategory: CarCategory;
  pricePerDay: Money;
  totalPrice: Money;
  deposit: Money;
  insurance: { included: boolean; excess?: Money };
  pickupLocation: string;
  dropoffLocation: string;
  oneWayAllowed: boolean;
  minDriverAge: number;
  mileage: 'unlimited' | 'limited';
  fuelPolicy: 'full_to_full' | 'prepaid';
  bookingOptions: BookingOption[];
}

/** Costs on top of the rental price that AI Total Cost has to include. */
export interface CarRunningCosts {
  fuel: Money;
  parking: Money;
  tolls: Money;
  extraInsurance?: Money;
}

/**
 * Transport options depend on the destination: Uber or Bolt are not available everywhere,
 * so availability is always looked up per city.
 */
export interface CityTransportInfo {
  cityId: string;
  publicTransport: {
    passes: TransportPass[];
    officialSiteUrl?: string;
  };
  rideServices: RideService[];
  carRentals: CarRentalOffer[];
}
