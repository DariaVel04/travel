import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import type { CreateTripInput, UpdateTripInput } from '../schemas/trip.js';
import type { TripDetailResponse, TripResponse } from '../types/api.js';
import { toDateOnly } from '../utils/dates.js';
import { HttpError } from '../utils/httpError.js';
import { asInputJson } from '../utils/json.js';
import { toTripDetailResponse, toTripResponse } from '../utils/mappers.js';

const tripInclude = {
  options: true,
  transports: true,
  accommodations: true,
  itinerary: { include: { days: { include: { activities: true } } } },
  costs: true,
} satisfies Prisma.TripInclude;

const DEFAULT_TRAVELERS = { adults: 2, children: 0, infants: 0 };

export async function listTripsForUser(userId: string): Promise<TripResponse[]> {
  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return trips.map(toTripResponse);
}

export async function getTripForUser(id: string, userId: string): Promise<TripDetailResponse> {
  const trip = await prisma.trip.findUnique({ where: { id }, include: tripInclude });
  if (!trip || trip.userId !== userId) {
    throw new HttpError(404, 'NOT_FOUND', 'Trip not found');
  }
  return toTripDetailResponse(trip);
}

export async function createTripForUser(
  userId: string,
  input: CreateTripInput,
): Promise<TripDetailResponse> {
  const trip = await prisma.trip.create({
    data: {
      userId,
      title: input.title,
      destinationName: input.destinationName,
      destinationType: input.destinationType,
      destinationCode: input.destinationCode,
      destinationPlaceId: input.destinationPlaceId,
      startDate: input.startDate ? toDateOnly(input.startDate) : undefined,
      endDate: input.endDate ? toDateOnly(input.endDate) : undefined,
      travelers: asInputJson(input.travelers ?? DEFAULT_TRAVELERS),
      currency: input.currency,
      budgetMinor: input.budget,
      totalEstimatedCost: input.totalEstimatedCost ?? 0,
      status: input.status,
      transportMode: input.transportMode,
      selectedTripOptionId: input.selectedTripOptionId,
    },
    include: tripInclude,
  });

  return toTripDetailResponse(trip);
}

export async function updateTripForUser(
  id: string,
  userId: string,
  input: UpdateTripInput,
): Promise<TripDetailResponse> {
  await getTripForUser(id, userId);

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      title: input.title,
      destinationName: input.destinationName,
      destinationType: input.destinationType,
      destinationCode: input.destinationCode,
      destinationPlaceId: input.destinationPlaceId,
      startDate: input.startDate ? toDateOnly(input.startDate) : undefined,
      endDate: input.endDate ? toDateOnly(input.endDate) : undefined,
      travelers: input.travelers ? asInputJson(input.travelers) : undefined,
      currency: input.currency,
      budgetMinor: input.budget,
      totalEstimatedCost: input.totalEstimatedCost,
      status: input.status,
      transportMode: input.transportMode,
      selectedTripOptionId: input.selectedTripOptionId,
    },
    include: tripInclude,
  });

  return toTripDetailResponse(trip);
}

export async function deleteTripForUser(id: string, userId: string): Promise<void> {
  await getTripForUser(id, userId);
  await prisma.trip.delete({ where: { id } });
}

export async function assertTripOwned(tripId: string, userId: string): Promise<void> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { userId: true } });
  if (!trip || trip.userId !== userId) {
    throw new HttpError(404, 'NOT_FOUND', 'Trip not found');
  }
}
