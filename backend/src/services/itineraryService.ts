import { prisma } from '../config/prisma.js';
import type { CreateItineraryInput } from '../schemas/itinerary.js';
import type { ItineraryResponse } from '../types/api.js';
import type { PersistableTripPlan, TripPlanPersistence } from '../types/planning.js';
import { toDateOnly } from '../utils/dates.js';
import { HttpError } from '../utils/httpError.js';
import { asInputJson } from '../utils/json.js';
import { toItineraryResponse } from '../utils/mappers.js';

const dayInclude = { days: { include: { activities: true } } } as const;

async function assertTripExists(tripId: string): Promise<void> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } });
  if (!trip) throw new HttpError(404, 'NOT_FOUND', 'Trip not found');
}

export async function getItinerary(tripId: string): Promise<ItineraryResponse | null> {
  await assertTripExists(tripId);
  const itinerary = await prisma.itinerary.findUnique({
    where: { tripId },
    include: dayInclude,
  });
  return itinerary ? toItineraryResponse(itinerary) : null;
}

export async function saveItinerary(
  tripId: string,
  input: CreateItineraryInput,
): Promise<ItineraryResponse> {
  await assertTripExists(tripId);

  const itinerary = await prisma.$transaction(async (tx) => {
    await tx.itinerary.deleteMany({ where: { tripId } });

    return tx.itinerary.create({
      data: {
        tripId,
        title: input.title,
        summary: input.summary,
        days: {
          create: input.days.map((day) => ({
            dayNumber: day.dayNumber,
            date: toDateOnly(day.date),
            title: day.title,
            description: day.description,
            estimatedCostMinor: day.estimatedCost ?? 0,
            currency: day.currency ?? 'EUR',
            activities: {
              create: day.activities.map((activity, index) => ({
                title: activity.title,
                description: activity.description,
                category: activity.category,
                location: activity.location,
                startTime: activity.startTime ? new Date(activity.startTime) : undefined,
                endTime: activity.endTime ? new Date(activity.endTime) : undefined,
                estimatedCostMinor: activity.estimatedCost ?? 0,
                currency: activity.currency ?? day.currency ?? 'EUR',
                sortOrder: index,
              })),
            },
          })),
        },
      },
      include: dayInclude,
    });
  });

  return toItineraryResponse(itinerary);
}

export const tripPlanPersistence: TripPlanPersistence = {
  async persistValidatedPlan(tripId, plan: PersistableTripPlan): Promise<void> {
    await saveItinerary(tripId, {
      title: plan.destinationName,
      days: plan.days.map((day) => ({
        dayNumber: day.dayNumber,
        date: day.date,
        title: day.title,
        description: day.description,
        estimatedCost: day.estimatedCostMinor,
        currency: day.currency,
        activities: day.activities.map((activity) => ({
          title: activity.title,
          description: activity.description,
          category: activity.category,
          location: activity.location,
          startTime: activity.startTime,
          endTime: activity.endTime,
          estimatedCost: activity.estimatedCostMinor,
          currency: activity.currency,
        })),
      })),
    });

    await prisma.$transaction(async (tx) => {
      await tx.tripCost.deleteMany({ where: { tripId } });
      if (plan.costs.length > 0) {
        await tx.tripCost.createMany({
          data: plan.costs.map((cost) => ({
            tripId,
            category: cost.category,
            amountMinor: cost.amountMinor,
            currency: cost.currency,
            description: cost.description,
          })),
        });
      }

      await tx.trip.update({
        where: { id: tripId },
        data: {
          destinationName: plan.destinationName,
          startDate: toDateOnly(plan.startDate),
          endDate: toDateOnly(plan.endDate),
          travelers: asInputJson(plan.travelers),
          currency: plan.currency,
          totalEstimatedCost: plan.totalEstimatedCost,
          status: 'PLANNED',
        },
      });
    });
  },
};
