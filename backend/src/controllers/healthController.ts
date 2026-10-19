import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { HealthResponse } from '../types/api.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let db: HealthResponse['db'] = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'up';
  } catch {
    db = 'down';
  }

  const body: HealthResponse = { status: 'ok', db };
  res.json(body);
}
