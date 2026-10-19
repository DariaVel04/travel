import type { LocationType, TravelLocation } from '@/types/location';
import { mockLocationProvider } from './mockLocationProvider';
import { createTypedCity, parseTypedCityId, TYPED_CITY_ID_PREFIX } from './typedCity';

export { createTypedCity, parseTypedCityId, TYPED_CITY_ID_PREFIX };

export interface LocationSearchOptions {
  limit?: number;
  types?: readonly LocationType[];
}

/**
 * Anything that can find airports, cities, countries and regions.
 * A real location/airport API will implement this interface and replace the mock.
 */
export interface LocationProvider {
  /** An empty query returns continents and countries (Everywhere is added in the selector). */
  search(query: string, options?: LocationSearchOptions): Promise<TravelLocation[]>;
  getByIds(ids: string[]): Promise<TravelLocation[]>;
}

/** "Everywhere" isn't a real place, so it lives here rather than in provider data. */
export const ANYWHERE_LOCATION: TravelLocation = {
  id: 'anywhere',
  type: 'anywhere',
  name: 'Everywhere',
};

const provider: LocationProvider = mockLocationProvider;

export function searchLocations(
  query: string,
  options?: LocationSearchOptions,
): Promise<TravelLocation[]> {
  return provider.search(query, options);
}

/**
 * Turns URL values back into locations. Each token is a location id ("city-HEL");
 * plain text ("Helsinki") is also accepted and resolved to the best search match.
 */
export async function resolveLocations(tokens: string[]): Promise<TravelLocation[]> {
  const resolved = await Promise.all(
    tokens.map(async (token): Promise<TravelLocation | undefined> => {
      if (token === ANYWHERE_LOCATION.id) return ANYWHERE_LOCATION;
      const [byId] = await provider.getByIds([token]);
      if (byId) return byId;
      const [bestMatch] = await provider.search(token, { limit: 1 });
      return bestMatch;
    }),
  );

  const unique = new Map<string, TravelLocation>();
  resolved.forEach((location) => {
    if (location) unique.set(location.id, location);
  });
  return [...unique.values()];
}
