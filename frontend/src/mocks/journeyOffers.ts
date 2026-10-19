import type {
  Journey,
  JourneyOffer,
  JourneySegment,
  JourneyTransportMode,
} from '@/features/flights/types';
import type { PlaceRef } from '@/types/location';
import { money } from '@/utils/money';

function city(name: string, code: string): PlaceRef {
  return { type: 'city', name, code, id: `city-${code}` };
}

function airport(name: string, code: string): PlaceRef {
  return { type: 'airport', name, code, id: `airport-${code}` };
}

interface SegmentDraft {
  mode: JourneyTransportMode;
  origin: PlaceRef;
  destination: PlaceRef;
  departure: string;
  arrival: string;
  durationMinutes: number;
  transfers?: number;
  estimatedCost: number;
  carrier?: string;
  vehicleCode?: string;
}

function segment(id: string, draft: SegmentDraft): JourneySegment {
  return {
    id,
    mode: draft.mode,
    origin: draft.origin,
    destination: draft.destination,
    departure: draft.departure,
    arrival: draft.arrival,
    durationMinutes: draft.durationMinutes,
    transfers: draft.transfers ?? 0,
    estimatedCost: money(draft.estimatedCost),
    carrier: draft.carrier,
    vehicleCode: draft.vehicleCode,
  };
}

function journey(id: string, direction: Journey['direction'], drafts: SegmentDraft[]): Journey {
  const segments = drafts.map((draft, index) => segment(`${id}-${index}`, draft));
  const transferBetween = Math.max(0, segments.length - 1);
  const extraStops = segments.reduce((sum, item) => sum + item.transfers, 0);

  return {
    id,
    direction,
    segments,
    totalDurationMinutes: segments.reduce((sum, item) => sum + item.durationMinutes, 0),
    totalTransfers: transferBetween + extraStops,
    estimatedCost: money(
      segments.reduce((sum, item) => sum + item.estimatedCost.amountMinor, 0) / 100,
    ),
  };
}

function offer(
  id: string,
  journeys: Journey[],
  extras: Omit<JourneyOffer, 'id' | 'journeys' | 'modes'> & { modes?: JourneyTransportMode[] },
): JourneyOffer {
  const modes = extras.modes ?? [
    ...new Set(journeys.flatMap((item) => item.segments.map((entry) => entry.mode))),
  ];
  return { id, journeys, modes, ...extras };
}

const TMP = city('Tampere', 'TMP');
const HEL = city('Helsinki', 'HEL');
const TLL = city('Tallinn', 'TLL');
const RIX = city('Riga', 'RIX');
const STO = city('Stockholm', 'STO');
const CPH = city('Copenhagen', 'CPH');
const HEL_AIR = airport('Helsinki Airport', 'HEL');
const BKK_AIR = airport('Bangkok Suvarnabhumi', 'BKK');
const HKT_AIR = airport('Phuket Airport', 'HKT');

/**
 * Demo journeys across flights, trains, buses, ferries, cars and mixed transport.
 * They are not real availability.
 */
export const MOCK_JOURNEY_OFFERS: JourneyOffer[] = [
  offer(
    'mixed-tmp-hel-bkk',
    [
      journey('mixed-tmp-hel-bkk-out', 'outbound', [
        {
          mode: 'train',
          origin: TMP,
          destination: HEL,
          departure: '2027-01-15T06:12',
          arrival: '2027-01-15T07:48',
          durationMinutes: 96,
          estimatedCost: 18,
          carrier: 'Nordic Rail',
          vehicleCode: 'VR 42',
        },
        {
          mode: 'flight',
          origin: HEL_AIR,
          destination: BKK_AIR,
          departure: '2027-01-15T11:30',
          arrival: '2027-01-15T23:55',
          durationMinutes: 625,
          transfers: 0,
          estimatedCost: 400,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 310',
        },
      ]),
      journey('mixed-tmp-hel-bkk-in', 'inbound', [
        {
          mode: 'flight',
          origin: BKK_AIR,
          destination: airport('Stockholm Arlanda', 'ARN'),
          departure: '2027-01-22T09:15',
          arrival: '2027-01-22T15:40',
          durationMinutes: 685,
          estimatedCost: 310,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 881',
        },
        {
          mode: 'flight',
          origin: airport('Stockholm Arlanda', 'ARN'),
          destination: HEL_AIR,
          departure: '2027-01-22T17:10',
          arrival: '2027-01-22T18:25',
          durationMinutes: 75,
          estimatedCost: 95,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 112',
        },
      ]),
    ],
    {
      price: { base: money(780), baggage: money(25), fees: money(18), total: money(823) },
      bookingOptions: [
        {
          partnerId: 'skyfly',
          partnerName: 'SkyFly',
          price: money(823),
          deeplink: 'https://example.com/skyfly/mixed-tmp-hel-bkk',
        },
      ],
      inconveniences: [
        { type: 'long_total_duration', severity: 'medium', details: { minutes: 1481 } },
      ],
      tags: [],
    },
  ),
  offer(
    'mixed-hel-tll-rix',
    [
      journey('mixed-hel-tll-rix-out', 'outbound', [
        {
          mode: 'ferry',
          origin: HEL,
          destination: TLL,
          departure: '2027-01-15T08:30',
          arrival: '2027-01-15T10:30',
          durationMinutes: 120,
          estimatedCost: 32,
          carrier: 'Baltic Ferries',
          vehicleCode: 'BF 7',
        },
        {
          mode: 'bus',
          origin: TLL,
          destination: RIX,
          departure: '2027-01-15T12:00',
          arrival: '2027-01-15T16:20',
          durationMinutes: 260,
          estimatedCost: 24,
          carrier: 'Baltic Bus',
          vehicleCode: 'BB 220',
        },
      ]),
    ],
    {
      price: { base: money(56), fees: money(0), total: money(56) },
      bookingOptions: [
        {
          partnerId: 'baltic-lines',
          partnerName: 'Baltic Lines',
          price: money(56),
          deeplink: 'https://example.com/baltic-lines/hel-tll-rix',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'mixed-hel-sto-cph',
    [
      journey('mixed-hel-sto-cph-out', 'outbound', [
        {
          mode: 'flight',
          origin: HEL_AIR,
          destination: airport('Stockholm Arlanda', 'ARN'),
          departure: '2027-01-15T07:05',
          arrival: '2027-01-15T07:20',
          durationMinutes: 75,
          estimatedCost: 89,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 104',
        },
        {
          mode: 'train',
          origin: STO,
          destination: CPH,
          departure: '2027-01-15T09:42',
          arrival: '2027-01-15T14:55',
          durationMinutes: 313,
          estimatedCost: 62,
          carrier: 'Nordic Rail',
          vehicleCode: 'X 532',
        },
      ]),
    ],
    {
      price: { base: money(141), fees: money(10), total: money(151) },
      bookingOptions: [
        {
          partnerId: 'nordic-rail',
          partnerName: 'Nordic Rail',
          price: money(151),
          deeplink: 'https://example.com/nordic-rail/hel-sto-cph',
        },
      ],
      inconveniences: [{ type: 'early_departure', severity: 'medium' }],
      tags: [],
    },
  ),
  offer(
    'mixed-car-ferry-train',
    [
      journey('mixed-car-ferry-train-out', 'outbound', [
        {
          mode: 'car',
          origin: HEL,
          destination: city('Helsinki West Harbour', 'HEL'),
          departure: '2027-01-15T06:40',
          arrival: '2027-01-15T07:10',
          durationMinutes: 30,
          estimatedCost: 18,
          carrier: 'Nordic Drive',
        },
        {
          mode: 'ferry',
          origin: HEL,
          destination: TLL,
          departure: '2027-01-15T07:30',
          arrival: '2027-01-15T09:30',
          durationMinutes: 120,
          estimatedCost: 78,
          carrier: 'Baltic Ferries',
          vehicleCode: 'BF Star',
        },
        {
          mode: 'train',
          origin: TLL,
          destination: RIX,
          departure: '2027-01-15T11:15',
          arrival: '2027-01-15T15:05',
          durationMinutes: 230,
          estimatedCost: 29,
          carrier: 'Baltic Lines',
          vehicleCode: 'EL 18',
        },
      ]),
    ],
    {
      price: { base: money(115), fees: money(10), total: money(125) },
      bookingOptions: [
        {
          partnerId: 'nordic-drive',
          partnerName: 'Nordic Drive',
          price: money(125),
          deeplink: 'https://example.com/nordic-drive/car-ferry-train',
        },
      ],
      inconveniences: [{ type: 'complex_route', severity: 'low' }],
      tags: [],
    },
  ),
  offer(
    'mixed-flight-train-bus',
    [
      journey('mixed-flight-train-bus-out', 'outbound', [
        {
          mode: 'flight',
          origin: HEL_AIR,
          destination: airport('Stockholm Arlanda', 'ARN'),
          departure: '2027-01-15T10:15',
          arrival: '2027-01-15T10:30',
          durationMinutes: 75,
          estimatedCost: 79,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 108',
        },
        {
          mode: 'train',
          origin: STO,
          destination: CPH,
          departure: '2027-01-15T12:20',
          arrival: '2027-01-15T17:30',
          durationMinutes: 310,
          estimatedCost: 58,
          carrier: 'Nordic Rail',
          vehicleCode: 'X 548',
        },
        {
          mode: 'bus',
          origin: CPH,
          destination: city('Malmö', 'MMA'),
          departure: '2027-01-15T18:10',
          arrival: '2027-01-15T19:00',
          durationMinutes: 50,
          estimatedCost: 9,
          carrier: 'Baltic Bus',
          vehicleCode: 'BB 9',
        },
      ]),
    ],
    {
      price: { base: money(146), fees: money(0), total: money(146) },
      bookingOptions: [
        {
          partnerId: 'skyfly',
          partnerName: 'SkyFly',
          price: money(146),
          deeplink: 'https://example.com/skyfly/flight-train-bus',
        },
      ],
      inconveniences: [{ type: 'complex_route', severity: 'medium' }],
      tags: [],
    },
  ),
  offer(
    'open-jaw-hel-bkk-hkt',
    [
      journey('open-jaw-hel-bkk-hkt-out', 'outbound', [
        {
          mode: 'flight',
          origin: HEL_AIR,
          destination: BKK_AIR,
          departure: '2027-01-15T09:30',
          arrival: '2027-01-15T23:10',
          durationMinutes: 700,
          transfers: 1,
          estimatedCost: 390,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 301',
        },
      ]),
      journey('open-jaw-hel-bkk-hkt-in', 'inbound', [
        {
          mode: 'flight',
          origin: HKT_AIR,
          destination: HEL_AIR,
          departure: '2027-01-22T11:05',
          arrival: '2027-01-22T22:40',
          durationMinutes: 695,
          transfers: 1,
          estimatedCost: 410,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 904',
        },
      ]),
    ],
    {
      modes: ['flight'],
      sourceType: 'airline',
      cabinClass: 'economy',
      price: { base: money(760), baggage: money(40), fees: money(20), total: money(820) },
      bookingOptions: [
        {
          partnerId: 'nordic-air',
          partnerName: 'Nordic Air',
          price: money(820),
          deeplink: 'https://example.com/nordic-air/open-jaw',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'multi-hel-bkk-han',
    [
      journey('multi-hel-bkk-han-1', 'leg', [
        {
          mode: 'flight',
          origin: HEL_AIR,
          destination: BKK_AIR,
          departure: '2027-01-15T09:30',
          arrival: '2027-01-15T23:10',
          durationMinutes: 700,
          estimatedCost: 380,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 301',
        },
      ]),
      journey('multi-hel-bkk-han-2', 'leg', [
        {
          mode: 'flight',
          origin: BKK_AIR,
          destination: airport('Hanoi Noi Bai', 'HAN'),
          departure: '2027-01-20T08:10',
          arrival: '2027-01-20T10:05',
          durationMinutes: 115,
          estimatedCost: 96,
          carrier: 'SunHolidays Charter',
          vehicleCode: 'SH 88',
        },
      ]),
      journey('multi-hel-bkk-han-3', 'leg', [
        {
          mode: 'flight',
          origin: airport('Hanoi Noi Bai', 'HAN'),
          destination: HEL_AIR,
          departure: '2027-01-27T21:40',
          arrival: '2027-01-28T08:15',
          durationMinutes: 755,
          estimatedCost: 410,
          carrier: 'Nordic Air',
          vehicleCode: 'NA 772',
        },
      ]),
    ],
    {
      modes: ['flight'],
      sourceType: 'airline',
      cabinClass: 'economy',
      price: { base: money(860), baggage: money(26), fees: money(0), total: money(886) },
      bookingOptions: [
        {
          partnerId: 'nordic-air',
          partnerName: 'Nordic Air',
          price: money(886),
          deeplink: 'https://example.com/nordic-air/multi-city',
        },
      ],
      inconveniences: [{ type: 'overnight_flight', severity: 'low' }],
      tags: [],
    },
  ),
  offer(
    'train-tmp-hel',
    [
      journey('train-tmp-hel-out', 'outbound', [
        {
          mode: 'train',
          origin: TMP,
          destination: HEL,
          departure: '2027-01-15T07:02',
          arrival: '2027-01-15T08:36',
          durationMinutes: 94,
          estimatedCost: 16,
          carrier: 'Nordic Rail',
          vehicleCode: 'VR 50',
        },
      ]),
    ],
    {
      price: { base: money(16), total: money(16) },
      bookingOptions: [
        {
          partnerId: 'nordic-rail',
          partnerName: 'Nordic Rail',
          price: money(16),
          deeplink: 'https://example.com/nordic-rail/tmp-hel',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'train-sto-cph',
    [
      journey('train-sto-cph-out', 'outbound', [
        {
          mode: 'train',
          origin: STO,
          destination: CPH,
          departure: '2027-01-15T08:18',
          arrival: '2027-01-15T13:28',
          durationMinutes: 310,
          transfers: 0,
          estimatedCost: 68,
          carrier: 'Nordic Rail',
          vehicleCode: 'X 520',
        },
      ]),
    ],
    {
      price: { base: money(68), total: money(68) },
      bookingOptions: [
        {
          partnerId: 'nordic-rail',
          partnerName: 'Nordic Rail',
          price: money(68),
          deeplink: 'https://example.com/nordic-rail/sto-cph',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'bus-tll-rix',
    [
      journey('bus-tll-rix-out', 'outbound', [
        {
          mode: 'bus',
          origin: TLL,
          destination: RIX,
          departure: '2027-01-15T09:00',
          arrival: '2027-01-15T13:15',
          durationMinutes: 255,
          estimatedCost: 22,
          carrier: 'Baltic Bus',
          vehicleCode: 'BB 110',
        },
      ]),
    ],
    {
      price: { base: money(22), total: money(22) },
      bookingOptions: [
        {
          partnerId: 'baltic-bus',
          partnerName: 'Baltic Bus',
          price: money(22),
          deeplink: 'https://example.com/baltic-bus/tll-rix',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'bus-hel-tmp',
    [
      journey('bus-hel-tmp-out', 'outbound', [
        {
          mode: 'bus',
          origin: HEL,
          destination: TMP,
          departure: '2027-01-15T12:30',
          arrival: '2027-01-15T14:40',
          durationMinutes: 130,
          estimatedCost: 12,
          carrier: 'Baltic Bus',
          vehicleCode: 'BB 3',
        },
      ]),
    ],
    {
      price: { base: money(12), total: money(12) },
      bookingOptions: [
        {
          partnerId: 'baltic-bus',
          partnerName: 'Baltic Bus',
          price: money(12),
          deeplink: 'https://example.com/baltic-bus/hel-tmp',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'ferry-hel-tll',
    [
      journey('ferry-hel-tll-out', 'outbound', [
        {
          mode: 'ferry',
          origin: HEL,
          destination: TLL,
          departure: '2027-01-15T10:30',
          arrival: '2027-01-15T12:30',
          durationMinutes: 120,
          estimatedCost: 29,
          carrier: 'Baltic Ferries',
          vehicleCode: 'BF 3',
        },
      ]),
    ],
    {
      price: { base: money(29), total: money(29) },
      bookingOptions: [
        {
          partnerId: 'baltic-ferries',
          partnerName: 'Baltic Ferries',
          price: money(29),
          deeplink: 'https://example.com/baltic-ferries/hel-tll',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'ferry-hel-sto',
    [
      journey('ferry-hel-sto-out', 'outbound', [
        {
          mode: 'ferry',
          origin: HEL,
          destination: STO,
          departure: '2027-01-15T17:30',
          arrival: '2027-01-16T10:00',
          durationMinutes: 990,
          estimatedCost: 79,
          carrier: 'Baltic Ferries',
          vehicleCode: 'BF Silja',
        },
      ]),
    ],
    {
      price: { base: money(79), total: money(79) },
      bookingOptions: [
        {
          partnerId: 'baltic-ferries',
          partnerName: 'Baltic Ferries',
          price: money(79),
          deeplink: 'https://example.com/baltic-ferries/hel-sto',
        },
      ],
      inconveniences: [{ type: 'overnight_flight', severity: 'low' }],
      tags: [],
    },
  ),
  offer(
    'car-hel-tmp',
    [
      journey('car-hel-tmp-out', 'outbound', [
        {
          mode: 'car',
          origin: HEL,
          destination: TMP,
          departure: '2027-01-15T09:00',
          arrival: '2027-01-15T10:45',
          durationMinutes: 105,
          estimatedCost: 48,
          carrier: 'Nordic Drive',
        },
      ]),
    ],
    {
      price: { base: money(42), fees: money(6), total: money(48) },
      bookingOptions: [
        {
          partnerId: 'nordic-drive',
          partnerName: 'Nordic Drive',
          price: money(48),
          deeplink: 'https://example.com/nordic-drive/hel-tmp',
        },
      ],
      inconveniences: [],
      tags: [],
    },
  ),
  offer(
    'car-hel-tll-rental',
    [
      journey('car-hel-tll-rental-out', 'outbound', [
        {
          mode: 'car',
          origin: HEL,
          destination: TLL,
          departure: '2027-01-15T08:00',
          arrival: '2027-01-15T12:30',
          durationMinutes: 270,
          estimatedCost: 95,
          carrier: 'Nordic Drive',
        },
      ]),
    ],
    {
      price: { base: money(88), fees: money(7), total: money(95) },
      bookingOptions: [
        {
          partnerId: 'nordic-drive',
          partnerName: 'Nordic Drive',
          price: money(95),
          deeplink: 'https://example.com/nordic-drive/hel-tll',
        },
      ],
      inconveniences: [{ type: 'complex_route', severity: 'low' }],
      tags: [],
    },
  ),
];
