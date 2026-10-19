import { TripStatus } from '@prisma/client';
import { z } from 'zod';
import { currencySchema, isoDateSchema, travelersSchema } from './common.js';

export const createTripSchema = z.object({
  title: z.string().trim().min(1).max(200),
  destinationName: z.string().trim().min(1).max(200).optional(),
  destinationType: z.string().trim().max(50).optional(),
  destinationCode: z.string().trim().max(8).optional(),
  destinationPlaceId: z.string().trim().max(120).optional(),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  travelers: travelersSchema.optional(),
  currency: currencySchema.default('EUR'),
  budget: z.number().int().min(0).optional(),
  totalEstimatedCost: z.number().int().min(0).optional(),
  status: z.nativeEnum(TripStatus).optional(),
  transportMode: z.string().trim().max(40).optional(),
  selectedTripOptionId: z.string().min(1).optional(),
});

export const updateTripSchema = createTripSchema.partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
