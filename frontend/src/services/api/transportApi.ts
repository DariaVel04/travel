import { apiRequest } from './apiClient';
import type { TransportRecord } from './types';

export function listTransport(): Promise<TransportRecord[]> {
  return apiRequest<TransportRecord[]>('/api/transport');
}
