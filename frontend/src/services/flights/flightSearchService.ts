import type { FlightOffer, FlightSearchParams, OfferSourceType } from '@/features/flights/types';
import { mockAirlineProvider, mockTourOperatorProvider } from './mockFlightProviders';

/**
 * Anything that can return flight offers: an airline API, an OTA/metasearch API,
 * or a tour operator feed. Each real integration will implement this interface.
 */
export interface FlightSearchProvider {
  id: string;
  sourceTypes: readonly OfferSourceType[];
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
}

/** Register new providers here. The UI doesn't need to change. */
const providers: FlightSearchProvider[] = [mockAirlineProvider, mockTourOperatorProvider];

/**
 * Queries every provider that covers at least one of the requested sources, in parallel,
 * and merges the results. A failing provider doesn't break the whole search.
 */
export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const activeProviders = providers.filter((provider) =>
    provider.sourceTypes.some((source) => params.sources.includes(source)),
  );

  const results = await Promise.allSettled(
    activeProviders.map((provider) => provider.search(params)),
  );

  return results
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .sort((a, b) => a.price.total.amountMinor - b.price.total.amountMinor);
}
