import type { JourneyOffer } from '@/features/flights/types';
import type { AccommodationSearchResult } from '@/features/hotels/types';
import type { PlannerRequest } from '@/features/planner/types';
import type { TripOptionDetails, TripPlan } from '@/features/planner/tripPlan';

export interface GenerateTripPlanInput {
  request: PlannerRequest;
  selectedTransport?: JourneyOffer[];
  selectedAccommodation?: AccommodationSearchResult;
  /** Incremented on regenerate so the mock can vary the plan. */
  variant?: number;
  details?: TripOptionDetails;
}

/**
 * Boundary for trip generation. The UI depends on this interface, not on mock data.
 * A later AITripPlanningService can implement the same methods.
 */
export interface TripPlanningService {
  generateTripOptions(input: GenerateTripPlanInput): Promise<TripOptionDetails[]>;
  generateItinerary(input: GenerateTripPlanInput): Promise<TripPlan>;
  generateAccommodationAlternatives(input: GenerateTripPlanInput): Promise<AccommodationSearchResult[]>;
  /** Kept so older callers can still request a full plan in one step. */
  generateTripPlan(input: GenerateTripPlanInput): Promise<TripPlan>;
}
