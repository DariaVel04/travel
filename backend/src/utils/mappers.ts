import type {
  Accommodation,
  Activity,
  Itinerary,
  ItineraryDay,
  Transport,
  Trip,
  TripCost,
  TripOption,
} from '@prisma/client';
import type {
  AccommodationResponse,
  ActivityResponse,
  ItineraryDayResponse,
  ItineraryResponse,
  PlacePayload,
  TransportResponse,
  TripCostResponse,
  TripDetailResponse,
  TripOptionResponse,
  TripResponse,
} from '../types/api.js';
import { requiredIsoDate, toIsoDate, toIsoDateTime } from './dates.js';
import {
  parseAccommodationSummary,
  parseStringArray,
  parseTransportSummary,
  parseTravelers,
} from './json.js';

function placeFromTrip(trip: Trip): PlacePayload | null {
  if (!trip.destinationName && !trip.destinationPlaceId && !trip.destinationCode) {
    return null;
  }
  return {
    name: trip.destinationName ?? undefined,
    type: trip.destinationType ?? undefined,
    code: trip.destinationCode ?? undefined,
    id: trip.destinationPlaceId ?? undefined,
  };
}

export function toTripResponse(trip: Trip): TripResponse {
  return {
    id: trip.id,
    userId: trip.userId,
    title: trip.title,
    destination: placeFromTrip(trip),
    startDate: toIsoDate(trip.startDate),
    endDate: toIsoDate(trip.endDate),
    travelers: parseTravelers(trip.travelers),
    currency: trip.currency,
    budget: trip.budgetMinor,
    totalEstimatedCost: trip.totalEstimatedCost,
    status: trip.status,
    selectedTripOptionId: trip.selectedTripOptionId,
    transportMode: trip.transportMode,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
  };
}

export function toTripOptionResponse(option: TripOption): TripOptionResponse {
  return {
    id: option.id,
    tripId: option.tripId,
    destination: {
      name: option.destinationName,
      type: option.destinationType ?? undefined,
      code: option.destinationCode ?? undefined,
      id: option.destinationPlaceId ?? undefined,
    },
    country: option.country,
    countryCode: option.countryCode,
    startDate: requiredIsoDate(option.startDate),
    endDate: requiredIsoDate(option.endDate),
    duration: option.durationDays,
    travelers: parseTravelers(option.travelers),
    totalPrice: option.totalPriceMinor,
    currency: option.currency,
    transportSummary: parseTransportSummary(option.transportSummary),
    accommodationSummary: parseAccommodationSummary(option.accommodationSummary),
    highlights: parseStringArray(option.highlights),
    createdAt: option.createdAt.toISOString(),
  };
}

export function toTransportResponse(item: Transport): TransportResponse {
  return {
    id: item.id,
    tripId: item.tripId,
    tripOptionId: item.tripOptionId,
    type: item.type,
    provider: item.provider,
    departureLocation: item.departureLocation,
    arrivalLocation: item.arrivalLocation,
    departureTime: toIsoDateTime(item.departureTime),
    arrivalTime: toIsoDateTime(item.arrivalTime),
    duration: item.durationMinutes,
    price: item.priceMinor,
    currency: item.currency,
    stops: item.stops,
    baggage: item.baggage,
    cabinClass: item.cabinClass,
    overnight: item.overnight,
    segments: item.segments,
  };
}

export function toAccommodationResponse(item: Accommodation): AccommodationResponse {
  return {
    id: item.id,
    tripId: item.tripId,
    tripOptionId: item.tripOptionId,
    name: item.name,
    destination: item.destination,
    address: item.address,
    type: item.type,
    rating: Number(item.rating),
    pricePerNight: item.pricePerNightMinor,
    totalPrice: item.totalPriceMinor,
    currency: item.currency,
    amenities: parseStringArray(item.amenities),
    checkIn: toIsoDate(item.checkIn),
    checkOut: toIsoDate(item.checkOut),
    guests: item.guests,
  };
}

export function toActivityResponse(item: Activity): ActivityResponse {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.location,
    startTime: toIsoDateTime(item.startTime),
    endTime: toIsoDateTime(item.endTime),
    estimatedCost: item.estimatedCostMinor,
    currency: item.currency,
  };
}

export function toItineraryDayResponse(
  day: ItineraryDay & { activities: Activity[] },
): ItineraryDayResponse {
  return {
    id: day.id,
    dayNumber: day.dayNumber,
    date: requiredIsoDate(day.date),
    title: day.title,
    description: day.description,
    estimatedCost: day.estimatedCostMinor,
    currency: day.currency,
    activities: [...day.activities]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toActivityResponse),
  };
}

export function toItineraryResponse(
  itinerary: Itinerary & { days: Array<ItineraryDay & { activities: Activity[] }> },
): ItineraryResponse {
  return {
    id: itinerary.id,
    tripId: itinerary.tripId,
    title: itinerary.title,
    summary: itinerary.summary,
    days: [...itinerary.days]
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(toItineraryDayResponse),
  };
}

export function toTripCostResponse(item: TripCost): TripCostResponse {
  return {
    id: item.id,
    category: item.category,
    amount: item.amountMinor,
    currency: item.currency,
    description: item.description,
  };
}

export function toTripDetailResponse(
  trip: Trip & {
    options: TripOption[];
    transports: Transport[];
    accommodations: Accommodation[];
    itinerary:
      | (Itinerary & { days: Array<ItineraryDay & { activities: Activity[] }> })
      | null;
    costs: TripCost[];
  },
): TripDetailResponse {
  return {
    ...toTripResponse(trip),
    options: trip.options.map(toTripOptionResponse),
    transports: trip.transports.map(toTransportResponse),
    accommodations: trip.accommodations.map(toAccommodationResponse),
    itinerary: trip.itinerary ? toItineraryResponse(trip.itinerary) : null,
    costs: trip.costs.map(toTripCostResponse),
  };
}
