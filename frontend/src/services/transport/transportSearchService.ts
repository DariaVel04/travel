import type { FlightSearchParams, JourneyOffer } from '@/features/flights/types';
import { flightOfferToJourneyOffer } from '@/features/flights/journey';
import type { FlightSearchProvider } from '@/services/flights/flightSearchService';
import {
  mockAirlineProvider,
  mockTourOperatorProvider,
} from '@/services/flights/mockFlightProviders';
import {
  mockBusProvider,
  mockCarProvider,
  mockExtraFlightProvider,
  mockFerryProvider,
  mockMixedProvider,
  mockTrainProvider,
} from './mockTransportProviders';
import type { TransportSearchProvider } from './types';

export type { TransportSearchProvider } from './types';

function wrapFlightProvider(provider: FlightSearchProvider): TransportSearchProvider {
  return {
    id: provider.id,
    modes: ['flight'],
    async search(params) {
      const offers = await provider.search(params);
      return offers.map(flightOfferToJourneyOffer);
    },
  };
}

/** Register new providers here. The search form does not need to change. */
const providers: TransportSearchProvider[] = [
  wrapFlightProvider(mockAirlineProvider),
  wrapFlightProvider(mockTourOperatorProvider),
  mockExtraFlightProvider,
  mockTrainProvider,
  mockBusProvider,
  mockFerryProvider,
  mockCarProvider,
  mockMixedProvider,
];

function providerMatches(provider: TransportSearchProvider, params: FlightSearchParams): boolean {
  if (params.transport === 'any') return true;
  if (params.transport === 'mixed') return provider.mixed === true;
  return provider.mixed !== true && provider.modes.includes(params.transport);
}

/**
 * Queries every provider that can serve the requested transport filter.
 * A failing provider does not break the whole search.
 * `params.preference` is stored for a future ranking step and is not applied here.
 */
export async function searchJourneys(params: FlightSearchParams): Promise<JourneyOffer[]> {
  const active = providers.filter((provider) => providerMatches(provider, params));
  const results = await Promise.allSettled(active.map((provider) => provider.search(params)));

  return results
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .sort((a, b) => a.price.total.amountMinor - b.price.total.amountMinor);
}
