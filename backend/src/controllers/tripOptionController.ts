import type { Request, Response } from 'express';
import { tripIdParamSchema } from '../schemas/common.js';
import { createTripOptionSchema } from '../schemas/tripOption.js';
import { authenticatedUser } from '../middleware/requireAuth.js';
import * as tripOptionService from '../services/tripOptionService.js';
import * as tripService from '../services/tripService.js';

export async function listOptions(req: Request, res: Response): Promise<void> {
  const { tripId } = tripIdParamSchema.parse(req.params);
  await tripService.assertTripOwned(tripId, authenticatedUser(req).id);
  const data = await tripOptionService.listTripOptions(tripId);
  res.json({ data });
}

export async function createOption(req: Request, res: Response): Promise<void> {
  const { tripId } = tripIdParamSchema.parse(req.params);
  await tripService.assertTripOwned(tripId, authenticatedUser(req).id);
  const input = createTripOptionSchema.parse(req.body);
  const data = await tripOptionService.createTripOption(tripId, input);
  res.status(201).json({ data });
}
