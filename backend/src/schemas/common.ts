import { z } from 'zod';
import { CURRENCIES } from '../types/api.js';

export const currencySchema = z.enum(CURRENCIES);

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const isoDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/, 'Expected ISO date-time');

export const travelersSchema = z.object({
  adults: z.number().int().min(0).max(20),
  children: z.number().int().min(0).max(20),
  infants: z.number().int().min(0).max(10).optional(),
  seniors: z.number().int().min(0).max(20).optional(),
  pets: z.number().int().min(0).max(10).optional(),
  childrenAges: z.array(z.number().int().min(0).max(17)).max(20).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const tripIdParamSchema = z.object({
  tripId: z.string().min(1),
});
