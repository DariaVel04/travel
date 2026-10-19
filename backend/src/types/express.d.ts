import type { PublicUser } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      authUser?: PublicUser;
    }
  }
}

export {};
