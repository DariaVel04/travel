import type {
  FlightSearchParams,
  JourneyOffer,
  JourneyTransportMode,
} from '@/features/flights/types';
import { delay } from '@/mocks/delay';
import { MOCK_JOURNEY_OFFERS } from '@/mocks/journeyOffers';
import type { TransportSearchProvider } from './types';

function isMixedOffer(offer: JourneyOffer): boolean {
  return offer.modes.length > 1;
}

function modesMatchFilter(offer: JourneyOffer, allowed: readonly JourneyTransportMode[]): boolean {
  return offer.modes.every((mode) => allowed.includes(mode));
}

function createModeProvider(id: string, mode: JourneyTransportMode): TransportSearchProvider {
  return {
    id,
    modes: [mode],
    async search() {
      await delay(450);
      return MOCK_JOURNEY_OFFERS.filter(
        (offer) => !isMixedOffer(offer) && offer.modes.length === 1 && offer.modes[0] === mode,
      );
    },
  };
}

export const mockTrainProvider = createModeProvider('mock-trains', 'train');
export const mockBusProvider = createModeProvider('mock-buses', 'bus');
export const mockFerryProvider = createModeProvider('mock-ferries', 'ferry');
export const mockCarProvider = createModeProvider('mock-cars', 'car');

const ALL_MODES: readonly JourneyTransportMode[] = ['flight', 'train', 'bus', 'car', 'ferry'];

export const mockExtraFlightProvider: TransportSearchProvider = {
  id: 'mock-flight-journeys',
  modes: ['flight'],
  async search(params: FlightSearchParams) {
    await delay(350);
    return MOCK_JOURNEY_OFFERS.filter((offer) => {
      if (isMixedOffer(offer) || offer.modes[0] !== 'flight') return false;
      if (
        params.sources.length > 0 &&
        offer.sourceType &&
        !params.sources.includes(offer.sourceType)
      ) {
        return false;
      }
      return true;
    });
  },
};

export const mockMixedProvider: TransportSearchProvider = {
  id: 'mock-mixed',
  modes: ALL_MODES,
  mixed: true,
  async search(params: FlightSearchParams) {
    await delay(450);
    const allowed = params.mixedModes.length > 0 ? params.mixedModes : ALL_MODES;
    return MOCK_JOURNEY_OFFERS.filter(
      (offer) => isMixedOffer(offer) && modesMatchFilter(offer, allowed),
    );
  },
};
