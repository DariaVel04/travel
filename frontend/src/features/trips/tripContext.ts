import { createContext, useContext } from 'react';
import type { JourneyOffer } from '@/features/flights/types';
import type { AccommodationSearchResult } from '@/features/hotels/types';
import type { TripPlan } from '@/features/planner/tripPlan';
import type { PlannerRequest } from '@/features/planner/types';
import type { ISODate } from '@/types/common';
import type { PlannerTripInput } from './tripModel';
import type { Trip, TripTravelers } from './types';

export interface CurrentTripContextValue {
  trip: Trip | null;
  isOpen: boolean;
  statusMessage: string;
  addTransport: (offer: JourneyOffer, extras?: { travelers?: TripTravelers }) => boolean;
  addAccommodation: (
    stay: AccommodationSearchResult,
    extras?: { startDate?: ISODate; endDate?: ISODate; travelers?: TripTravelers },
  ) => boolean;
  removeTransport: (offerId: string) => void;
  removeAccommodation: () => void;
  applyPlanner: (request: PlannerRequest) => void;
  applyPlannerSelection: (input: PlannerTripInput) => void;
  applyTripPlan: (plan: TripPlan) => void;
  clearTrip: () => void;
  hasTransport: (offerId: string) => boolean;
  hasAccommodation: (stayId: string) => boolean;
  openSummary: () => void;
  closeSummary: () => void;
  toggleSummary: () => void;
}

export const CurrentTripContext = createContext<CurrentTripContextValue | null>(null);

export function useCurrentTrip(): CurrentTripContextValue {
  const context = useContext(CurrentTripContext);
  if (!context) {
    throw new Error('useCurrentTrip must be used inside TripProvider');
  }
  return context;
}
