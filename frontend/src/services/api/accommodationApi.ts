import { apiRequest } from './apiClient';
import type { AccommodationRecord } from './types';

export function listAccommodations(): Promise<AccommodationRecord[]> {
  return apiRequest<AccommodationRecord[]>('/api/accommodations');
}
