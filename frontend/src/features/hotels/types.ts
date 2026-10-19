import type { ISODate, Money } from '@/types/common';
import type { PlaceRef } from '@/types/location';
import type { BookingOption } from '@/types/partner';
import type {
  ACCOMMODATION_AMENITIES,
  ACCOMMODATION_SORTS,
  ACCOMMODATION_TYPE_FILTERS,
  ACCOMMODATION_TYPES,
  MEAL_PLANS,
  PRICE_CURRENCIES,
  RATING_FILTERS,
} from './options';

export type AccommodationType = (typeof ACCOMMODATION_TYPES)[number];
export type AccommodationTypeFilter = (typeof ACCOMMODATION_TYPE_FILTERS)[number];
export type Amenity = (typeof ACCOMMODATION_AMENITIES)[number];
export type MealPlan = (typeof MEAL_PLANS)[number];
export type RatingFilter = (typeof RATING_FILTERS)[number];
export type AccommodationSort = (typeof ACCOMMODATION_SORTS)[number];
export type PriceCurrencyFilter = (typeof PRICE_CURRENCIES)[number];

export interface AccommodationFilters {
  minPricePerNight?: number;
  maxPricePerNight?: number;
  currency: PriceCurrencyFilter;
  minRating: RatingFilter;
  amenities: Amenity[];
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  privateBathroom: boolean;
}

export interface AccommodationSearchParams {
  destinations: PlaceRef[];
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  children: number;
  childAges: number[];
  rooms: number;
  type: AccommodationTypeFilter;
  filters: AccommodationFilters;
  sort: AccommodationSort;
}

export interface AccommodationOffer {
  id: string;
  name: string;
  type: AccommodationType;
  destination: PlaceRef;
  country: string;
  countryCode: string;
  regionIds: string[];
  imageUrl: string;
  imageAlt: string;
  rating: number;
  reviewCount: number;
  pricePerNight: Money;
  amenities: Amenity[];
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  privateBathroom: boolean;
  distanceFromCenterKm: number;
  roomsAvailable: number;
  provider: string;
  mealPlan: MealPlan;
  recommendedRank: number;
  bookingOptions: BookingOption[];
}

export interface AccommodationSearchResult extends AccommodationOffer {
  nights: number;
  totalPrice: Money;
}

export type AccommodationSearchStatus = 'idle' | 'loading' | 'done' | 'error';
