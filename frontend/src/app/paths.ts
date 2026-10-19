import type { TripType } from '@/features/planner/types';

/**
 * All URLs live here. Components never hardcode paths, so adding a language prefix
 * later (/fi/flights, /de/planner) only requires changes in this file and the router.
 */
export const paths = {
  home: '/',
  flights: '/flights',
  hotels: '/hotels',
  planner: '/planner',
  login: '/login',
  register: '/register',
  account: '/account',
} as const;

/** Query parameters passed from the home page search into the feature pages. */
export const searchParamKeys = {
  from: 'from',
  to: 'to',
  destination: 'destination',
  tripType: 'tripType',
} as const;

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/** Multiple locations are passed as comma-separated location ids: ?from=city-HEL,city-TMP */
const LIST_SEPARATOR = ',';

export function buildFlightsUrl(params: { from?: string[]; to?: string[] }): string {
  return withQuery(paths.flights, {
    [searchParamKeys.from]: params.from?.join(LIST_SEPARATOR),
    [searchParamKeys.to]: params.to?.join(LIST_SEPARATOR),
  });
}

export function parseListParam(value: string | null): string[] {
  return (value ?? '')
    .split(LIST_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildHotelsUrl(params: { destination?: string[] }): string {
  return withQuery(paths.hotels, {
    [searchParamKeys.destination]: params.destination?.join(LIST_SEPARATOR),
  });
}

export function buildPlannerUrl(params: {
  from?: string[];
  destination?: string[];
  tripType?: TripType;
}): string {
  return withQuery(paths.planner, {
    [searchParamKeys.from]: params.from?.join(LIST_SEPARATOR),
    [searchParamKeys.destination]: params.destination?.join(LIST_SEPARATOR),
    [searchParamKeys.tripType]: params.tripType,
  });
}
