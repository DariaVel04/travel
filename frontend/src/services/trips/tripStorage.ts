import { parseTrip } from '@/features/trips/tripModel';
import type { Trip } from '@/features/trips/types';

const STORAGE_KEY = 'atp.currentTrip';

export function loadCurrentTrip(): Trip | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const trip = parseTrip(parsed);
    if (!trip) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return trip;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveCurrentTrip(trip: Trip | null): void {
  if (typeof window === 'undefined') return;

  try {
    if (!trip) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  } catch {
    // Storage can be full or blocked; the in-memory trip still works for this session.
  }
}
