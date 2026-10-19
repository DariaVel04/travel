import { apiRequest } from './apiClient';
import type { CreateTripPayload, TripOptionRecord, TripRecord } from './types';

export function listTrips(): Promise<TripRecord[]> {
  return apiRequest<TripRecord[]>('/api/trips');
}

export function listMyTrips(): Promise<TripRecord[]> {
  return apiRequest<TripRecord[]>('/api/trips/me');
}

export function getTrip(id: string): Promise<TripRecord> {
  return apiRequest<TripRecord>(`/api/trips/${id}`);
}

export function createTrip(body: CreateTripPayload): Promise<TripRecord> {
  return apiRequest<TripRecord>('/api/trips', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateTrip(id: string, body: Partial<CreateTripPayload>): Promise<TripRecord> {
  return apiRequest<TripRecord>(`/api/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteTrip(id: string): Promise<void> {
  return apiRequest<void>(`/api/trips/${id}`, { method: 'DELETE' });
}

export function listTripOptions(tripId: string): Promise<TripOptionRecord[]> {
  return apiRequest<TripOptionRecord[]>(`/api/trips/${tripId}/options`);
}
