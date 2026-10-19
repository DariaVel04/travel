import type { Request, Response } from 'express';
import { createTripSchema, updateTripSchema } from '../schemas/trip.js';
import { idParamSchema } from '../schemas/common.js';
import { authenticatedUser } from '../middleware/requireAuth.js';
import * as tripService from '../services/tripService.js';

export async function listMyTrips(req: Request, res: Response): Promise<void> {
  const data = await tripService.listTripsForUser(authenticatedUser(req).id);
  res.json({ data });
}

export async function getTrip(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const data = await tripService.getTripForUser(id, authenticatedUser(req).id);
  res.json({ data });
}

export async function createTrip(req: Request, res: Response): Promise<void> {
  const input = createTripSchema.parse(req.body);
  const data = await tripService.createTripForUser(authenticatedUser(req).id, input);
  res.status(201).json({ data });
}

export async function updateTrip(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = updateTripSchema.parse(req.body);
  const data = await tripService.updateTripForUser(id, authenticatedUser(req).id, input);
  res.json({ data });
}

export async function removeTrip(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  await tripService.deleteTripForUser(id, authenticatedUser(req).id);
  res.status(204).send();
}
