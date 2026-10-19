import type { Prisma } from '@prisma/client';
import { travelersSchema } from '../schemas/common.js';
import type {
  AccommodationSummaryPayload,
  TransportSummaryPayload,
  TravelersPayload,
} from '../types/api.js';

const DEFAULT_TRAVELERS: TravelersPayload = { adults: 2, children: 0, infants: 0 };

export function asInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function parseTravelers(value: Prisma.JsonValue): TravelersPayload {
  const parsed = travelersSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_TRAVELERS;
}

export function parseStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function parseTransportSummary(value: Prisma.JsonValue): TransportSummaryPayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { type: 'mixed', originName: '' };
  }
  const type = value.type;
  const originName = value.originName;
  return {
    type: typeof type === 'string' ? type : 'mixed',
    originName: typeof originName === 'string' ? originName : '',
  };
}

export function parseAccommodationSummary(value: Prisma.JsonValue): AccommodationSummaryPayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { name: '', stars: 0 };
  }
  const name = value.name;
  const stars = value.stars;
  return {
    name: typeof name === 'string' ? name : '',
    stars: typeof stars === 'number' && Number.isInteger(stars) ? stars : 0,
  };
}
