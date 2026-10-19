import type { AccommodationOffer, AccommodationSearchParams } from '@/features/hotels/types';

/**
 * A source of stay offers. Real OTAs or hotel APIs will implement this later.
 */
export interface AccommodationProvider {
  id: string;
  search(params: AccommodationSearchParams): Promise<AccommodationOffer[]>;
  getById(id: string): Promise<AccommodationOffer | null>;
}
