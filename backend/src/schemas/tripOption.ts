import { z } from 'zod';
import { currencySchema, isoDateSchema, travelersSchema } from './common.js';

export const createTripOptionSchema = z.object({
  destinationName: z.string().trim().min(1).max(200),
  destinationType: z.string().trim().max(50).optional(),
  destinationCode: z.string().trim().max(8).optional(),
  destinationPlaceId: z.string().trim().max(120).optional(),
  country: z.string().trim().max(100).optional(),
  countryCode: z.string().trim().length(2).optional(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  duration: z.number().int().min(1).max(365),
  travelers: travelersSchema,
  totalPrice: z.number().int().min(0),
  currency: currencySchema,
  transportSummary: z.object({
    type: z.string().trim().min(1).max(40),
    originName: z.string().trim().min(1).max(200),
  }),
  accommodationSummary: z.object({
    name: z.string().trim().min(1).max(200),
    stars: z.number().int().min(0).max(5),
  }),
  highlights: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  imageUrl: z.string().url().optional(),
});

export type CreateTripOptionInput = z.infer<typeof createTripOptionSchema>;
