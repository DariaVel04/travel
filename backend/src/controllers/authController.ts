import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../schemas/auth.js';
import * as authService from '../services/authService.js';
import { authenticatedUser, readSessionToken } from '../middleware/requireAuth.js';

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const data = await authService.register(input, res);
  res.status(201).json({ data });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const data = await authService.login(input, res);
  res.json({ data });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await authService.logout(readSessionToken(req), res);
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ data: authenticatedUser(req) });
}
