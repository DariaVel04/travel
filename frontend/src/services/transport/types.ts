import type {
  FlightSearchParams,
  JourneyOffer,
  JourneyTransportMode,
} from '@/features/flights/types';

/**
 * A long-distance transport source. Real flight, rail, bus, ferry and car
 * providers will each implement this later; the UI stays the same.
 */
export interface TransportSearchProvider {
  id: string;
  modes: readonly JourneyTransportMode[];
  /** True when this provider returns journeys that combine several modes. */
  mixed?: boolean;
  search(params: FlightSearchParams): Promise<JourneyOffer[]>;
}
