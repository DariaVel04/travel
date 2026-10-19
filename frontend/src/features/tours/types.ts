import type { Money } from '@/types/common';
import type { IataCode, PlaceRef } from '@/types/location';
import type { BookingOption } from '@/types/partner';
import type { DateSelection, PassengerCounts, TripDuration } from '@/features/flights/types';
import type { MealPlan } from '@/features/hotels/types';

/**
 * TourSearch: tour operators, package holidays and charter flights.
 * Kept separate from flight search because these products are priced and sold differently.
 */
export type TourProductType =
  | 'flight_only'
  | 'hotel_only'
  | 'flight_hotel'
  | 'package_holiday'
  | 'charter_flight'
  | 'last_minute'
  | 'tour_operator_deal';

export interface TourSearchParams {
  origins: PlaceRef[];
  destination?: PlaceRef;
  dates: DateSelection;
  duration: TripDuration;
  travellers: PassengerCounts;
  productTypes: TourProductType[];
  mealPlan?: MealPlan;
}

export type PackageInclusion = 'flight' | 'hotel' | 'transfer' | 'baggage' | 'insurance' | 'meals';

export interface TourPackage {
  id: string;
  operatorPartnerId: string;
  operatorName: string;
  productType: TourProductType;
  destination: PlaceRef;
  departureAirport: IataCode;
  nights: number;
  accommodationName?: string;
  mealPlan?: MealPlan;
  includes: PackageInclusion[];
  /** Total price for the whole group. */
  price: Money;
  bookingOptions: BookingOption[];
}

/** "Flight + Hotel booked independently" vs "Tour operator package". */
export interface PackageComparison {
  independent: {
    flights: Money;
    accommodation: Money;
    transfers: Money;
    total: Money;
  };
  package: {
    packageId: string;
    total: Money;
  };
  /** Always positive: how much the cheaper option saves. */
  difference: Money;
  cheaperOption: 'independent' | 'package' | 'equal';
}
