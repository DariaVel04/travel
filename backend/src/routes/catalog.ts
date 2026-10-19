import { Router } from 'express';
import { listAccommodations, listTransport } from '../controllers/catalogController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const accommodationsRouter = Router();
accommodationsRouter.get('/', asyncHandler(listAccommodations));

export const transportRouter = Router();
transportRouter.get('/', asyncHandler(listTransport));
