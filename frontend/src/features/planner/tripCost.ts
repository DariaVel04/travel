import type { CurrencyCode, Money } from '@/types/common';
import { sumMoney } from '@/utils/money';
import type { DayPlan, TripCostBreakdown, TripCostLineKey, TripPlan } from './tripPlan';

/** Mock pricing assumptions. Replace with real quotes when APIs are connected. */
export interface TripCostAssumptions {
  insurancePerTravellerPerDayMinor: number;
  baggagePerLongHaulTravellerMinor: number;
  visaPerTravellerMinor: number;
}

export const MOCK_TRIP_COST_ASSUMPTIONS: TripCostAssumptions = {
  insurancePerTravellerPerDayMinor: 500,
  baggagePerLongHaulTravellerMinor: 4000,
  visaPerTravellerMinor: 0,
};

export interface TripCostParts {
  transport: Money[];
  accommodation: Money[];
  baggage: Money[];
  food: Money[];
  localTransport: Money[];
  activities: Money[];
  insurance: Money[];
  visa: Money[];
  other: Money[];
  currency: CurrencyCode;
}

export function calculateTripCost(parts: TripCostParts): TripCostBreakdown {
  const { currency } = parts;
  const lines: Record<TripCostLineKey, Money> = {
    transport: sumMoney(parts.transport, currency),
    accommodation: sumMoney(parts.accommodation, currency),
    baggage: sumMoney(parts.baggage, currency),
    food: sumMoney(parts.food, currency),
    localTransport: sumMoney(parts.localTransport, currency),
    activities: sumMoney(parts.activities, currency),
    insurance: sumMoney(parts.insurance, currency),
    visa: sumMoney(parts.visa, currency),
    other: sumMoney(parts.other, currency),
  };

  return {
    ...lines,
    total: sumMoney(Object.values(lines), currency),
    currency,
  };
}

const LONG_HAUL: ReadonlyArray<DayPlan['transportation'][number]['type']> = [
  'flight',
  'train',
  'bus',
  'ferry',
];

export function costPartsFromDraft(
  draft: Pick<TripPlan, 'days' | 'transport' | 'accommodation' | 'travelers'> & {
    convenience?: TripPlan['convenience'];
  },
  currency: CurrencyCode,
  assumptions: TripCostAssumptions = MOCK_TRIP_COST_ASSUMPTIONS,
): TripCostParts {
  const travellers = Math.max(1, draft.travelers.adults + draft.travelers.children + draft.travelers.seniors);
  const dayCount = Math.max(1, draft.days.length);
  const hasLongHaul = draft.transport.some((step) => LONG_HAUL.includes(step.type));

  const transport = draft.transport
    .filter((step) => LONG_HAUL.includes(step.type) && step.estimatedCost)
    .map((step) => step.estimatedCost)
    .filter((value): value is Money => value !== undefined);

  const localTransport = draft.days.flatMap((day) =>
    day.transportation
      .filter((step) => !LONG_HAUL.includes(step.type) && step.estimatedCost)
      .map((step) => step.estimatedCost)
      .filter((value): value is Money => value !== undefined),
  );

  const activities = draft.days.flatMap((day) =>
    day.activities
      .map((item) => item.estimatedCost)
      .filter((value): value is Money => value !== undefined),
  );

  const food = draft.days.flatMap((day) =>
    day.meals.map((item) => item.estimatedCost).filter((value): value is Money => value !== undefined),
  );

  return {
    transport,
    accommodation: draft.accommodation.map((stay) => stay.estimatedCost),
    baggage: hasLongHaul
      ? [{ amountMinor: assumptions.baggagePerLongHaulTravellerMinor * travellers, currency }]
      : [],
    food,
    localTransport,
    activities,
    insurance: [
      {
        amountMinor: assumptions.insurancePerTravellerPerDayMinor * travellers * dayCount,
        currency,
      },
    ],
    visa: assumptions.visaPerTravellerMinor
      ? [{ amountMinor: assumptions.visaPerTravellerMinor * draft.travelers.adults, currency }]
      : [],
    other: [],
    currency,
  };
}

/** High-level estimate used for trip options before a day-by-day plan exists. */
export function estimateOptionCost(args: {
  transport: Money[];
  accommodation: Money;
  travelers: { adults: number; children: number; seniors: number };
  nights: number;
  currency: CurrencyCode;
  assumptions?: TripCostAssumptions;
}): TripCostBreakdown {
  const assumptions = args.assumptions ?? MOCK_TRIP_COST_ASSUMPTIONS;
  const travellers = Math.max(1, args.travelers.adults + args.travelers.children + args.travelers.seniors);
  const nights = Math.max(1, args.nights);
  const { currency } = args;
  const hasLongHaul = args.transport.length > 0;

  return calculateTripCost({
    transport: args.transport,
    accommodation: [args.accommodation],
    baggage: hasLongHaul
      ? [{ amountMinor: assumptions.baggagePerLongHaulTravellerMinor * travellers, currency }]
      : [],
    food: [{ amountMinor: 2800 * travellers * nights, currency }],
    localTransport: [{ amountMinor: 800 * travellers * nights, currency }],
    activities: [{ amountMinor: 1500 * travellers * nights, currency }],
    insurance: [
      { amountMinor: assumptions.insurancePerTravellerPerDayMinor * travellers * (nights + 1), currency },
    ],
    visa: assumptions.visaPerTravellerMinor
      ? [{ amountMinor: assumptions.visaPerTravellerMinor * args.travelers.adults, currency }]
      : [],
    other: [],
    currency,
  });
}

export function dayEstimatedCost(day: DayPlan, currency: CurrencyCode): Money {
  const amounts = [
    ...day.activities.map((item) => item.estimatedCost),
    ...day.meals.map((item) => item.estimatedCost),
    ...day.transportation.map((item) => item.estimatedCost),
  ].filter((value): value is Money => value !== undefined);
  return sumMoney(amounts, currency);
}
