import type {
  AccommodationOffer,
  AccommodationSearchParams,
  AccommodationSearchResult,
} from '@/features/hotels/types';
import { stayNights } from '@/features/hotels/searchForm';
import type { PlaceRef } from '@/types/location';
import { money } from '@/utils/money';
import { mockAccommodationProvider } from './mockAccommodationProvider';
import type { AccommodationProvider } from './types';

export type { AccommodationProvider } from './types';

const provider: AccommodationProvider = mockAccommodationProvider;

function matchesDestination(offer: AccommodationOffer, destinations: PlaceRef[]): boolean {
  if (destinations.some((place) => place.type === 'anywhere')) return true;
  return destinations.some((place) => {
    if (place.type === 'city' || place.type === 'airport') {
      return (
        offer.destination.id === place.id ||
        (place.code !== undefined && offer.destination.code === place.code)
      );
    }
    if (place.type === 'country') {
      return offer.countryCode === place.code || `country-${offer.countryCode}` === place.id;
    }
    if (place.type === 'region') {
      return place.id !== undefined && offer.regionIds.includes(place.id);
    }
    return false;
  });
}

function ratingThreshold(value: AccommodationSearchParams['filters']['minRating']): number {
  if (value === 'any') return 0;
  if (value === '4_5') return 4.5;
  return Number(value);
}

function matchesViewFilters(offer: AccommodationOffer, params: AccommodationSearchParams): boolean {
  if (params.type !== 'any' && offer.type !== params.type) return false;

  const { filters } = params;
  if (offer.rating < ratingThreshold(filters.minRating)) return false;
  if (filters.freeCancellation && !offer.freeCancellation) return false;
  if (filters.breakfastIncluded && !offer.breakfastIncluded) return false;
  if (filters.privateBathroom && !offer.privateBathroom) return false;
  if (filters.amenities.some((amenity) => !offer.amenities.includes(amenity))) return false;

  const hasPriceBound =
    filters.minPricePerNight !== undefined || filters.maxPricePerNight !== undefined;
  if (
    hasPriceBound &&
    filters.currency !== 'any' &&
    offer.pricePerNight.currency !== filters.currency
  ) {
    return false;
  }

  const nightly = offer.pricePerNight.amountMinor / 100;
  if (filters.minPricePerNight !== undefined && nightly < filters.minPricePerNight) return false;
  if (filters.maxPricePerNight !== undefined && nightly > filters.maxPricePerNight) return false;

  return true;
}

function sortOffers(
  offers: AccommodationSearchResult[],
  sort: AccommodationSearchParams['sort'],
): AccommodationSearchResult[] {
  const copy = [...offers];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.totalPrice.amountMinor - b.totalPrice.amountMinor);
    case 'price_desc':
      return copy.sort((a, b) => b.totalPrice.amountMinor - a.totalPrice.amountMinor);
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'distance':
      return copy.sort((a, b) => a.distanceFromCenterKm - b.distanceFromCenterKm);
    case 'recommended':
      return copy.sort((a, b) => a.recommendedRank - b.recommendedRank);
  }
}

function toResult(offer: AccommodationOffer, nights: number): AccommodationSearchResult {
  return {
    ...offer,
    nights,
    totalPrice: money(
      (offer.pricePerNight.amountMinor / 100) * nights,
      offer.pricePerNight.currency,
    ),
  };
}

export async function searchAccommodations(
  params: AccommodationSearchParams,
): Promise<AccommodationSearchResult[]> {
  const offers = await provider.search(params);
  const nights = stayNights(params.checkIn, params.checkOut);
  return offers
    .filter(
      (offer) =>
        matchesDestination(offer, params.destinations) && offer.roomsAvailable >= params.rooms,
    )
    .map((offer) => toResult(offer, nights));
}

export function refineAccommodations(
  results: AccommodationSearchResult[],
  params: AccommodationSearchParams,
): AccommodationSearchResult[] {
  return sortOffers(
    results.filter((offer) => matchesViewFilters(offer, params)),
    params.sort,
  );
}

export async function getAccommodationDetails(
  id: string,
): Promise<AccommodationSearchResult | null> {
  const offer = await provider.getById(id);
  return offer ? toResult(offer, 1) : null;
}
