import type { Itinerary, PlannerRequest } from '@/features/planner/types';
import { tripPlanToItinerary } from '@/features/planner/mapItinerary';
import { mockTripPlanningService } from './mockTripPlanningService';
import type { TripPlanningService } from './tripPlanningService';

/** Swap this export for an AI-backed implementation later. */
export const tripPlanningService: TripPlanningService = mockTripPlanningService;

/**
 * Entry point for the AI Vacation Planner.
 * Today it returns a demo itinerary; later it will call our backend, which talks to the AI model
 * (API keys must never live in the frontend).
 */
export async function generateItinerary(request: PlannerRequest): Promise<Itinerary> {
  const plan = await tripPlanningService.generateTripPlan({ request });
  return tripPlanToItinerary(plan);
}
