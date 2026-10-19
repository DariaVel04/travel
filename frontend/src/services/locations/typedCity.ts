import type { TravelLocation } from '@/types/location';

/** Prefix for a city the traveller typed that is not in the catalog. */
export const TYPED_CITY_ID_PREFIX = 'city-typed:';

export function createTypedCity(name: string): TravelLocation {
  const trimmed = name.trim();
  return {
    id: `${TYPED_CITY_ID_PREFIX}${encodeURIComponent(trimmed)}`,
    type: 'city',
    name: trimmed,
  };
}

export function parseTypedCityId(id: string): TravelLocation | undefined {
  if (!id.startsWith(TYPED_CITY_ID_PREFIX)) return undefined;
  try {
    const name = decodeURIComponent(id.slice(TYPED_CITY_ID_PREFIX.length)).trim();
    return name ? { id, type: 'city', name } : undefined;
  } catch {
    return undefined;
  }
}
