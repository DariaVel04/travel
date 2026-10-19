import { prisma } from '../config/prisma.js';
import type { CreateTripOptionInput } from '../schemas/tripOption.js';
import type { TripOptionResponse } from '../types/api.js';
import { toDateOnly } from '../utils/dates.js';
import { HttpError } from '../utils/httpError.js';
import { asInputJson } from '../utils/json.js';
import { toTripOptionResponse } from '../utils/mappers.js';

async function assertTripExists(tripId: string): Promise<void> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } });
  if (!trip) throw new HttpError(404, 'NOT_FOUND', 'Trip not found');
}

export async function listTripOptions(tripId: string): Promise<TripOptionResponse[]> {
  await assertTripExists(tripId);
  const options = await prisma.tripOption.findMany({
    where: { tripId },
    orderBy: { createdAt: 'asc' },
  });
  return options.map(toTripOptionResponse);
}

export async function createTripOption(
  tripId: string,
  input: CreateTripOptionInput,
): Promise<TripOptionResponse> {
  await assertTripExists(tripId);

  const count = await prisma.tripOption.count({ where: { tripId } });
  if (count >= 5) {
    throw new HttpError(409, 'LIMIT_REACHED', 'A trip can store at most 5 options');
  }

  const option = await prisma.tripOption.create({
    data: {
      tripId,
      destinationName: input.destinationName,
      destinationType: input.destinationType,
      destinationCode: input.destinationCode,
      destinationPlaceId: input.destinationPlaceId,
      country: input.country,
      countryCode: input.countryCode,
      startDate: toDateOnly(input.startDate),
      endDate: toDateOnly(input.endDate),
      durationDays: input.duration,
      travelers: asInputJson(input.travelers),
      totalPriceMinor: input.totalPrice,
      currency: input.currency,
      transportSummary: asInputJson(input.transportSummary),
      accommodationSummary: asInputJson(input.accommodationSummary),
      highlights: asInputJson(input.highlights),
      imageUrl: input.imageUrl,
    },
  });

  return toTripOptionResponse(option);
}
