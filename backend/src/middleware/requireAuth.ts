import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE, userFromSessionToken } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';

export function readSessionToken(req: Request): string | undefined {
  const signed = req.signedCookies?.[SESSION_COOKIE];
  return typeof signed === 'string' && signed.length > 0 ? signed : undefined;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    req.authUser = await userFromSessionToken(readSessionToken(req));
    if (!req.authUser) {
      next(new HttpError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function authenticatedUser(req: Request) {
  if (!req.authUser) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  return req.authUser;
}
