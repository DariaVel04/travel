import type { Request, Response } from 'express';
import * as catalogService from '../services/catalogService.js';

export async function listAccommodations(_req: Request, res: Response): Promise<void> {
  const data = await catalogService.listAccommodations();
  res.json({ data });
}

export async function listTransport(_req: Request, res: Response): Promise<void> {
  const data = await catalogService.listTransport();
  res.json({ data });
}
