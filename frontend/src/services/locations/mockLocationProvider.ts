import { delay } from '@/mocks/delay';
import { getBrowseLocations, MOCK_LOCATIONS } from '@/mocks/locations';
import type { LocationName, LocationType, TravelLocation } from '@/types/location';
import type { LocationProvider } from './locationService';
import { createTypedCity, parseTypedCityId } from './typedCity';

const SEARCH_LIMIT = 24;

/** Broader places first when two results match equally well. */
const TYPE_ORDER: Record<LocationType, number> = {
  anywhere: 0,
  region: 1,
  country: 2,
  city: 3,
  airport: 4,
};

function matchesType(type: LocationType, allowed?: readonly LocationType[]): boolean {
  return !allowed || allowed.includes(type);
}

/** Lowercase and strip accents so "malaga" matches "Málaga". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function allNames(item: LocationName): string[] {
  return [item.name, ...Object.values(item.localizedNames ?? {})];
}

/** Lower is better; undefined means no match. */
function matchScore(location: TravelLocation, query: string): number | undefined {
  if (location.code && normalize(location.code) === query) return 0;

  const names = [...allNames(location), ...(location.keywords ?? [])].map(normalize);
  if (names.some((name) => name.startsWith(query))) return 1;
  if (names.some((name) => name.split(/[\s\-–(]+/).some((word) => word.startsWith(query)))) {
    return 2;
  }
  if (names.some((name) => name.includes(query))) return 3;

  // "Thailand" also finds Bangkok and Phuket.
  const parentNames = (location.parents ?? []).flatMap(allNames).map(normalize);
  if (parentNames.some((name) => name.startsWith(query))) return 4;

  return undefined;
}

function hasExactNamedPlace(query: string, allowed?: readonly LocationType[]): boolean {
  return MOCK_LOCATIONS.some((location) => {
    if (!matchesType(location.type, allowed)) return false;
    if (location.type === 'airport') return false;
    return allNames(location).some((name) => normalize(name) === query);
  });
}

export const mockLocationProvider: LocationProvider = {
  async search(query, options) {
    await delay(120);
    const allowed = options?.types;
    const trimmedQuery = query.trim();
    const normalizedQuery = normalize(trimmedQuery);

    if (!normalizedQuery) {
      return getBrowseLocations().filter((location) => matchesType(location.type, allowed));
    }

    const limit = options?.limit ?? SEARCH_LIMIT;
    const results = MOCK_LOCATIONS.flatMap((location) => {
      if (!matchesType(location.type, allowed)) return [];
      const score = matchScore(location, normalizedQuery);
      return score === undefined ? [] : [{ location, score }];
    })
      .sort(
        (a, b) => a.score - b.score || TYPE_ORDER[a.location.type] - TYPE_ORDER[b.location.type],
      )
      .slice(0, limit)
      .map(({ location }) => location);

    if (
      matchesType('city', allowed) &&
      trimmedQuery.length >= 2 &&
      !hasExactNamedPlace(normalizedQuery, allowed)
    ) {
      results.push(createTypedCity(trimmedQuery));
    }

    return results;
  },

  async getByIds(ids) {
    return ids.flatMap((id) => {
      const typed = parseTypedCityId(id);
      if (typed) return [typed];
      const location = MOCK_LOCATIONS.find((item) => item.id === id);
      return location ? [location] : [];
    });
  },
};
