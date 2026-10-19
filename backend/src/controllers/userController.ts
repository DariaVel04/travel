import type { Request, Response } from 'express';
import { changePasswordSchema, updateProfileSchema } from '../schemas/auth.js';
import { authenticatedUser } from '../middleware/requireAuth.js';
import * as authService from '../services/authService.js';

export async function getProfile(req: Request, res: Response): Promise<void> {
  res.json({ data: authenticatedUser(req) });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const input = updateProfileSchema.parse(req.body);
  const data = await authService.updateProfile(authenticatedUser(req).id, input);
  res.json({ data });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const input = changePasswordSchema.parse(req.body);
  await authService.changePassword(authenticatedUser(req).id, input);
  res.status(204).send();
}
