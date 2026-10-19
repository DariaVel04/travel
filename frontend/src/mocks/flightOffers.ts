import type { FlightOffer } from '@/features/flights/types';
import { money } from '@/utils/money';

/**
 * Demo offers for Helsinki / Tampere / Stockholm → Bangkok.
 * They illustrate why the cheapest option is not automatically the best one.
 */
export const MOCK_FLIGHT_OFFERS: FlightOffer[] = [
  {
    // "Option A": a bit more expensive, 1 stop, reasonable travel time.
    id: 'offer-a',
    sourceType: 'airline',
    outbound: {
      segments: [
        {
          carrier: 'Nordic Air',
          flightNumber: 'NA 101',
          from: 'HEL',
          to: 'DXB',
          departureTime: '2027-01-15T09:30',
          arrivalTime: '2027-01-15T16:05',
          durationMinutes: 395,
        },
        {
          carrier: 'Nordic Air',
          flightNumber: 'NA 377',
          from: 'DXB',
          to: 'BKK',
          departureTime: '2027-01-15T17:50',
          arrivalTime: '2027-01-15T21:30',
          durationMinutes: 280,
        },
      ],
      layovers: [
        {
          arrivalAirport: 'DXB',
          departureAirport: 'DXB',
          durationMinutes: 105,
          overnight: false,
          selfTransfer: false,
        },
      ],
      totalDurationMinutes: 720,
    },
    price: { base: money(360), baggage: money(0), fees: money(40), total: money(400) },
    bookingOptions: [
      {
        partnerId: 'nordic-air',
        partnerName: 'Nordic Air',
        price: money(400),
        deeplink: 'https://example.com/nordic-air/offer-a',
      },
    ],
    inconveniences: [],
    tags: [],
  },
  {
    // "Option B": cheaper, but 2 stops, overnight, 26 h and an airport change.
    id: 'offer-b',
    sourceType: 'ota',
    outbound: {
      segments: [
        {
          carrier: 'Baltic Wings',
          flightNumber: 'BW 812',
          from: 'HEL',
          to: 'LHR',
          departureTime: '2027-01-15T18:40',
          arrivalTime: '2027-01-15T20:10',
          durationMinutes: 210,
        },
        {
          carrier: 'Island Jet',
          flightNumber: 'IJ 219',
          from: 'LGW',
          to: 'IST',
          departureTime: '2027-01-16T06:15',
          arrivalTime: '2027-01-16T12:05',
          durationMinutes: 230,
        },
        {
          carrier: 'Bosporus Air',
          flightNumber: 'BA 064',
          from: 'IST',
          to: 'BKK',
          departureTime: '2027-01-16T15:40',
          arrivalTime: '2027-01-17T05:20',
          durationMinutes: 580,
        },
      ],
      layovers: [
        {
          arrivalAirport: 'LHR',
          departureAirport: 'LGW',
          durationMinutes: 605,
          overnight: true,
          selfTransfer: true,
        },
        {
          arrivalAirport: 'IST',
          departureAirport: 'IST',
          durationMinutes: 215,
          overnight: false,
          selfTransfer: false,
        },
      ],
      totalDurationMinutes: 1560,
    },
    price: {
      base: money(285),
      baggage: money(35),
      fees: money(15),
      transfer: money(15),
      total: money(350),
    },
    bookingOptions: [
      {
        partnerId: 'skyfly',
        partnerName: 'SkyFly',
        price: money(350),
        deeplink: 'https://example.com/skyfly/offer-b',
      },
    ],
    inconveniences: [
      { type: 'multiple_stops', severity: 'medium' },
      { type: 'overnight_layover', severity: 'high' },
      { type: 'airport_change', severity: 'high', details: { from: 'LHR', to: 'LGW' } },
      { type: 'self_transfer', severity: 'high' },
      { type: 'long_total_duration', severity: 'high', details: { minutes: 1560 } },
      { type: 'early_departure', severity: 'medium' },
    ],
    tags: [],
  },
  {
    // Tour operator charter: seats that regular flight search usually doesn't show.
    id: 'offer-c',
    sourceType: 'charter',
    outbound: {
      segments: [
        {
          carrier: 'SunHolidays Charter',
          flightNumber: 'SH 4521',
          from: 'TMP',
          to: 'BKK',
          departureTime: '2027-01-15T22:10',
          arrivalTime: '2027-01-16T08:40',
          durationMinutes: 630,
        },
      ],
      layovers: [],
      totalDurationMinutes: 630,
    },
    price: { base: money(329), baggage: money(0), fees: money(0), total: money(329) },
    bookingOptions: [
      {
        partnerId: 'sunholidays',
        partnerName: 'SunHolidays',
        price: money(329),
        deeplink: 'https://example.com/sunholidays/offer-c',
      },
    ],
    inconveniences: [{ type: 'overnight_flight', severity: 'low' }],
    tags: ['special_offer'],
  },
  {
    id: 'offer-d',
    sourceType: 'tour_operator',
    outbound: {
      segments: [
        {
          carrier: 'SunHolidays Charter',
          flightNumber: 'SH 4610',
          from: 'ARN',
          to: 'BKK',
          departureTime: '2027-01-16T05:50',
          arrivalTime: '2027-01-16T16:30',
          durationMinutes: 640,
        },
      ],
      layovers: [],
      totalDurationMinutes: 640,
    },
    price: { base: money(299), baggage: money(0), fees: money(0), total: money(299) },
    bookingOptions: [
      {
        partnerId: 'sunholidays',
        partnerName: 'SunHolidays',
        price: money(299),
        deeplink: 'https://example.com/sunholidays/offer-d',
      },
    ],
    inconveniences: [{ type: 'early_departure', severity: 'medium' }],
    tags: ['last_minute'],
  },
  {
    id: 'offer-e',
    sourceType: 'airline',
    outbound: {
      segments: [
        {
          carrier: 'Bosporus Air',
          flightNumber: 'BA 1762',
          from: 'HEL',
          to: 'IST',
          departureTime: '2027-01-15T12:20',
          arrivalTime: '2027-01-15T16:25',
          durationMinutes: 245,
        },
        {
          carrier: 'Bosporus Air',
          flightNumber: 'BA 068',
          from: 'IST',
          to: 'BKK',
          departureTime: '2027-01-15T17:10',
          arrivalTime: '2027-01-16T01:45',
          durationMinutes: 575,
        },
      ],
      layovers: [
        {
          arrivalAirport: 'IST',
          departureAirport: 'IST',
          durationMinutes: 45,
          overnight: false,
          selfTransfer: false,
        },
      ],
      totalDurationMinutes: 865,
    },
    price: { base: money(355), baggage: money(30), fees: money(25), total: money(410) },
    bookingOptions: [
      {
        partnerId: 'skyfly',
        partnerName: 'SkyFly',
        price: money(410),
        deeplink: 'https://example.com/skyfly/offer-e',
      },
    ],
    inconveniences: [
      { type: 'short_connection', severity: 'medium', details: { minutes: 45 } },
      { type: 'inconvenient_arrival', severity: 'medium' },
    ],
    tags: [],
  },
];
