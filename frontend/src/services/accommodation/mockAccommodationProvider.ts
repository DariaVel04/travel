import { delay } from '@/mocks/delay';
import { MOCK_ACCOMMODATIONS } from '@/mocks/accommodations';
import type { AccommodationProvider } from './types';

export const mockAccommodationProvider: AccommodationProvider = {
  id: 'mock-stays',
  async search() {
    await delay(450);
    return MOCK_ACCOMMODATIONS;
  },
  async getById(id: string) {
    await delay(200);
    return MOCK_ACCOMMODATIONS.find((offer) => offer.id === id) ?? null;
  },
};
