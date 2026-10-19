import type { Money } from '@/types/common';
import type { IataCode, PlaceRef } from '@/types/location';
import type {
  FlightJourney,
  FlightOffer,
  Journey,
  JourneyDirection,
  JourneyOffer,
  JourneySegment,
} from './types';

function airportRef(code: IataCode): PlaceRef {
  return { type: 'airport', name: code, code };
}

function shareCost(total: Money, parts: number, index: number): Money {
  if (parts <= 0) return { amountMinor: 0, currency: total.currency };
  const base = Math.floor(total.amountMinor / parts);
  const remainder = total.amountMinor - base * parts;
  return { amountMinor: base + (index === parts - 1 ? remainder : 0), currency: total.currency };
}

function toJourney(
  id: string,
  direction: JourneyDirection,
  flight: FlightJourney,
  total: Money,
): Journey {
  const count = flight.segments.length;
  const segments: JourneySegment[] = flight.segments.map((segment, index) => ({
    id: `${id}-${index}`,
    mode: 'flight',
    origin: airportRef(segment.from),
    destination: airportRef(segment.to),
    departure: segment.departureTime,
    arrival: segment.arrivalTime,
    durationMinutes: segment.durationMinutes,
    transfers: 0,
    estimatedCost: shareCost(total, count, index),
    carrier: segment.carrier,
    vehicleCode: segment.flightNumber,
  }));

  return {
    id,
    direction,
    segments,
    totalDurationMinutes: flight.totalDurationMinutes,
    totalTransfers: Math.max(0, count - 1),
    estimatedCost: total,
  };
}

/** Adapts an airline-style offer into the shared journey result shape. */
export function flightOfferToJourneyOffer(offer: FlightOffer): JourneyOffer {
  const outbound = toJourney(`${offer.id}-out`, 'outbound', offer.outbound, offer.price.total);
  const inbound = offer.inbound
    ? toJourney(`${offer.id}-in`, 'inbound', offer.inbound, offer.price.total)
    : undefined;

  return {
    id: offer.id,
    journeys: inbound ? [outbound, inbound] : [outbound],
    modes: ['flight'],
    price: offer.price,
    bookingOptions: offer.bookingOptions,
    inconveniences: offer.inconveniences,
    convenienceScore: offer.convenienceScore,
    tags: offer.tags,
    sourceType: offer.sourceType,
    cabinClass: 'economy',
  };
}

export function placeLabel(place: PlaceRef): string {
  if (place.code && place.name !== place.code) {
    return `${place.name} ${place.code}`;
  }
  return place.name;
}
