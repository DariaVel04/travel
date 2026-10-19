import { ActivityCategory } from '@prisma/client';
import { z } from 'zod';
import { currencySchema, isoDateSchema, isoDateTimeSchema } from './common.js';

export const activitySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.nativeEnum(ActivityCategory).default(ActivityCategory.OTHER),
  location: z.string().trim().max(200).optional(),
  startTime: isoDateTimeSchema.optional(),
  endTime: isoDateTimeSchema.optional(),
  estimatedCost: z.number().int().min(0).optional(),
  currency: currencySchema.optional(),
});

export const itineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(365),
  date: isoDateSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  estimatedCost: z.number().int().min(0).optional(),
  currency: currencySchema.optional(),
  activities: z.array(activitySchema).max(50).default([]),
});

export const createItinerarySchema = z.object({
  title: z.string().trim().max(200).optional(),
  summary: z.string().trim().max(4000).optional(),
  days: z.array(itineraryDaySchema).min(1).max(365),
});

export type CreateItineraryInput = z.infer<typeof createItinerarySchema>;
