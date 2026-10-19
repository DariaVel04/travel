import type { Request, Response } from 'express';
import { tripIdParamSchema } from '../schemas/common.js';
import { createItinerarySchema } from '../schemas/itinerary.js';
import { authenticatedUser } from '../middleware/requireAuth.js';
import * as itineraryService from '../services/itineraryService.js';
import * as tripService from '../services/tripService.js';

export async function getItinerary(req: Request, res: Response): Promise<void> {
  const { tripId } = tripIdParamSchema.parse(req.params);
  await tripService.assertTripOwned(tripId, authenticatedUser(req).id);
  const data = await itineraryService.getItinerary(tripId);
  res.json({ data });
}

export async function saveItinerary(req: Request, res: Response): Promise<void> {
  const { tripId } = tripIdParamSchema.parse(req.params);
  await tripService.assertTripOwned(tripId, authenticatedUser(req).id);
  const input = createItinerarySchema.parse(req.body);
  const data = await itineraryService.saveItinerary(tripId, input);
  res.status(201).json({ data });
}
