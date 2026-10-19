import type { ISODate } from '@/types/common';
import type { TravelLocation } from '@/types/location';
import { todayISODate, toISODate } from '@/utils/date';
import { toPlaceRef } from '@/utils/location';
import type {
  AccommodationSearchParams,
  AccommodationSort,
  AccommodationTypeFilter,
  Amenity,
  PriceCurrencyFilter,
  RatingFilter,
} from './types';

export interface HotelSearchFormValues {
  destinations: TravelLocation[];
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  children: number;
  childAges: number[];
  rooms: number;
  type: AccommodationTypeFilter;
  minPrice: string;
  maxPrice: string;
  currency: PriceCurrencyFilter;
  minRating: RatingFilter;
  amenities: Amenity[];
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  privateBathroom: boolean;
  sort: AccommodationSort;
}

function addDays(date: ISODate, days: number): ISODate {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return toISODate(next);
}

function nightsBetween(checkIn: ISODate, checkOut: ISODate): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function stayNights(checkIn: ISODate, checkOut: ISODate): number {
  return Math.max(1, nightsBetween(checkIn, checkOut));
}

export function createInitialHotelFormValues(
  prefill: { destinations?: TravelLocation[] } = {},
): HotelSearchFormValues {
  const checkIn = addDays(todayISODate(), 21);
  return {
    destinations: prefill.destinations ?? [],
    checkIn,
    checkOut: addDays(checkIn, 3),
    adults: 2,
    children: 0,
    childAges: [],
    rooms: 1,
    type: 'any',
    minPrice: '',
    maxPrice: '',
    currency: 'any',
    minRating: 'any',
    amenities: [],
    freeCancellation: false,
    breakfastIncluded: false,
    privateBathroom: false,
    sort: 'recommended',
  };
}

export function withValidDates(
  values: HotelSearchFormValues,
  patch: Partial<Pick<HotelSearchFormValues, 'checkIn' | 'checkOut'>>,
): HotelSearchFormValues {
  const next = { ...values, ...patch };
  if (next.checkIn && next.checkOut && nightsBetween(next.checkIn, next.checkOut) < 1) {
    next.checkOut = addDays(next.checkIn, 1);
  }
  return next;
}

export function withChildCount(
  values: HotelSearchFormValues,
  children: number,
): HotelSearchFormValues {
  const childAges = values.childAges.slice(0, children);
  while (childAges.length < children) childAges.push(8);
  return { ...values, children, childAges };
}

export function resetHotelRefinements(values: HotelSearchFormValues): HotelSearchFormValues {
  return {
    ...values,
    type: 'any',
    minPrice: '',
    maxPrice: '',
    currency: 'any',
    minRating: 'any',
    amenities: [],
    freeCancellation: false,
    breakfastIncluded: false,
    privateBathroom: false,
  };
}

export function isHotelFormValid(values: HotelSearchFormValues): boolean {
  return (
    values.destinations.length > 0 &&
    values.checkIn.length > 0 &&
    values.checkOut.length > 0 &&
    nightsBetween(values.checkIn, values.checkOut) >= 1 &&
    values.adults >= 1 &&
    values.rooms >= 1
  );
}

function parsePrice(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined;
}

export function toAccommodationSearchParams(
  values: HotelSearchFormValues,
): AccommodationSearchParams {
  return {
    destinations: values.destinations.map(toPlaceRef),
    checkIn: values.checkIn,
    checkOut: values.checkOut,
    adults: values.adults,
    children: values.children,
    childAges: values.childAges.slice(0, values.children),
    rooms: values.rooms,
    type: values.type,
    filters: {
      minPricePerNight: parsePrice(values.minPrice),
      maxPricePerNight: parsePrice(values.maxPrice),
      currency: values.currency,
      minRating: values.minRating,
      amenities: values.amenities,
      freeCancellation: values.freeCancellation,
      breakfastIncluded: values.breakfastIncluded,
      privateBathroom: values.privateBathroom,
    },
    sort: values.sort,
  };
}
