import type { FlightSearchParams, OfferSourceType } from '@/features/flights/types';
import { delay } from '@/mocks/delay';
import { MOCK_FLIGHT_OFFERS } from '@/mocks/flightOffers';
import type { FlightSearchProvider } from './flightSearchService';

/** Mock providers ignore the route/dates and only filter demo offers by source type. */
function createMockProvider(
  id: string,
  sourceTypes: readonly OfferSourceType[],
): FlightSearchProvider {
  return {
    id,
    sourceTypes,
    async search(params: FlightSearchParams) {
      await delay(600);
      return MOCK_FLIGHT_OFFERS.filter(
        (offer) =>
          sourceTypes.includes(offer.sourceType) && params.sources.includes(offer.sourceType),
      );
    },
  };
}

export const mockAirlineProvider = createMockProvider('mock-airlines', ['airline', 'ota']);

export const mockTourOperatorProvider = createMockProvider('mock-tour-operators', [
  'tour_operator',
  'charter',
  'package',
]);
