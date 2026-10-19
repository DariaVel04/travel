import type { JourneyOffer, JourneyTransportMode } from '@/features/flights/types';
import type { AccommodationSearchResult } from '@/features/hotels/types';
import { resolvePlannerDates, shiftISODate, travellerCount } from '@/features/planner/plannerDates';
import {
  calculateTripCost,
  costPartsFromDraft,
  dayEstimatedCost,
  estimateOptionCost,
  MOCK_TRIP_COST_ASSUMPTIONS,
  type TripCostAssumptions,
} from '@/features/planner/tripCost';
import type {
  AccommodationRecommendation,
  DayPlan,
  DaySlot,
  PlannedActivity,
  PlannedMeal,
  TransportationStep,
  TransportStepType,
  TripOptionDetails,
  TripPlan,
} from '@/features/planner/tripPlan';
import type { Interest, PlannerRequest } from '@/features/planner/types';
import { delay } from '@/mocks/delay';
import type { CurrencyCode, ISODate, Money } from '@/types/common';
import type { PlaceRef } from '@/types/location';
import { money } from '@/utils/money';
import { refineAccommodations, searchAccommodations } from '@/services/accommodation/accommodationService';
import { suggestPlannerStays, toPlannerAccommodationParams } from './plannerStays';
import {
  TRIP_DESTINATION_TEMPLATES,
  type TripDestinationTemplate,
} from './tripOptionCatalog';
import type { GenerateTripPlanInput, TripPlanningService } from './tripPlanningService';

const FALLBACK_ORIGIN: PlaceRef = { type: 'city', id: 'city-HEL', name: 'Helsinki', code: 'HEL' };
const FALLBACK_DESTINATION: PlaceRef = {
  type: 'city',
  id: 'city-BKK',
  name: 'Bangkok',
  code: 'BKK',
};

const VISA_MINOR_BY_CODE: Record<string, number> = {
  TH: 4000,
  US: 18500,
  GB: 0,
};

const ACTIVITY_POOL: Array<{
  titleKey: string;
  descriptionKey: string;
  slot: DaySlot;
  costMajor: number;
  durationMinutes: number;
  interests: Interest[];
}> = [
  {
    titleKey: 'planner.plan.activities.cityWalk',
    descriptionKey: 'planner.plan.activityDetails.cityWalk',
    slot: 'morning',
    costMajor: 0,
    durationMinutes: 120,
    interests: [],
  },
  {
    titleKey: 'planner.plan.activities.museum',
    descriptionKey: 'planner.plan.activityDetails.museum',
    slot: 'morning',
    costMajor: 18,
    durationMinutes: 150,
    interests: ['museums', 'history', 'architecture'],
  },
  {
    titleKey: 'planner.plan.activities.market',
    descriptionKey: 'planner.plan.activityDetails.market',
    slot: 'afternoon',
    costMajor: 12,
    durationMinutes: 90,
    interests: ['local_food', 'shopping', 'photography'],
  },
  {
    titleKey: 'planner.plan.activities.viewpoint',
    descriptionKey: 'planner.plan.activityDetails.viewpoint',
    slot: 'afternoon',
    costMajor: 8,
    durationMinutes: 75,
    interests: ['photography', 'architecture'],
  },
  {
    titleKey: 'planner.plan.activities.beach',
    descriptionKey: 'planner.plan.activityDetails.beach',
    slot: 'afternoon',
    costMajor: 0,
    durationMinutes: 180,
    interests: ['beaches', 'water_sports'],
  },
  {
    titleKey: 'planner.plan.activities.nature',
    descriptionKey: 'planner.plan.activityDetails.nature',
    slot: 'morning',
    costMajor: 25,
    durationMinutes: 210,
    interests: ['hiking'],
  },
  {
    titleKey: 'planner.plan.activities.spa',
    descriptionKey: 'planner.plan.activityDetails.spa',
    slot: 'afternoon',
    costMajor: 45,
    durationMinutes: 120,
    interests: ['spa'],
  },
  {
    titleKey: 'planner.plan.activities.shopping',
    descriptionKey: 'planner.plan.activityDetails.shopping',
    slot: 'afternoon',
    costMajor: 20,
    durationMinutes: 120,
    interests: ['shopping'],
  },
  {
    titleKey: 'planner.plan.activities.photoWalk',
    descriptionKey: 'planner.plan.activityDetails.photoWalk',
    slot: 'morning',
    costMajor: 0,
    durationMinutes: 90,
    interests: ['photography'],
  },
  {
    titleKey: 'planner.plan.activities.nightlife',
    descriptionKey: 'planner.plan.activityDetails.nightlife',
    slot: 'evening',
    costMajor: 30,
    durationMinutes: 150,
    interests: ['nightlife'],
  },
  {
    titleKey: 'planner.plan.activities.localFood',
    descriptionKey: 'planner.plan.activityDetails.localFood',
    slot: 'evening',
    costMajor: 22,
    durationMinutes: 90,
    interests: ['local_food'],
  },
  {
    titleKey: 'planner.plan.activities.evening',
    descriptionKey: 'planner.plan.activityDetails.evening',
    slot: 'evening',
    costMajor: 15,
    durationMinutes: 90,
    interests: [],
  },
];

const MODE_TO_STEP: Record<JourneyTransportMode, TransportStepType> = {
  flight: 'flight',
  train: 'train',
  bus: 'bus',
  car: 'rental_car',
  ferry: 'ferry',
};

export const mockTripPlanningService: TripPlanningService = {
  async generateTripOptions(input) {
    if (input.request.durationDays < 1) {
      throw new Error('Invalid trip length');
    }
    await delay(900);
    const templates = pickTemplates(input.request, input.variant ?? 0);
    const details = await Promise.all(
      templates.map((template, index) => buildOptionDetails(input, template, index)),
    );
    return details;
  },

  async generateItinerary(input) {
    const variant = input.variant ?? 0;
    if (input.details) {
      await delay(700);
      return buildTripPlanFromDetails(input, input.details, variant);
    }
    const options = await this.generateTripOptions(input);
    const first = options[0];
    if (!first) throw new Error('No trip options');
    return buildTripPlanFromDetails(input, first, variant);
  },

  async generateAccommodationAlternatives(input) {
    const details = input.details;
    if (!details) return [];
    await delay(500);
    const params = toPlannerAccommodationParams(input.request, []);
    params.destinations = [details.option.destination];
    params.checkIn = details.option.startDate;
    params.checkOut = details.option.endDate;
    const matches = await searchAccommodations(params);
    const refined = refineAccommodations(matches, params);
    const pool = (refined.length > 0 ? refined : matches).slice(0, 5);
    if (pool.length > 0) return pool;
    return [details.stay];
  },

  async generateTripPlan(input) {
    return this.generateItinerary(input);
  },
};

function pickTemplates(request: PlannerRequest, variant: number): TripDestinationTemplate[] {
  const selected = request.destinations?.filter((place) => place.type !== 'anywhere') ?? [];
  const climate = request.preferences.climate;
  const scored = TRIP_DESTINATION_TEMPLATES.map((template) => {
    let score = 0;
    if (selected.some((place) => matchesTemplate(place, template))) score += 8;
    if (climate === 'any' || template.climates.includes(climate)) score += 3;
    if (request.tripTypes.some((type) => template.tripTypes.includes(type))) score += 4;
    return { template, score };
  }).sort((left, right) => right.score - left.score || left.template.destination.name.localeCompare(right.template.destination.name));

  const rotated = [...scored.slice(variant % scored.length), ...scored.slice(0, variant % scored.length)];
  const unique: TripDestinationTemplate[] = [];
  for (const item of rotated) {
    if (unique.some((existing) => existing.destination.id === item.template.destination.id)) continue;
    unique.push(item.template);
    if (unique.length === 5) break;
  }
  return unique.length > 0 ? unique : TRIP_DESTINATION_TEMPLATES.slice(0, 5);
}

function matchesTemplate(place: PlaceRef, template: TripDestinationTemplate): boolean {
  if (place.id && template.destination.id === place.id) return true;
  if (place.code && template.destination.code === place.code) return true;
  if (place.type === 'country' && place.code === template.countryCode) return true;
  return place.name.trim().toLowerCase() === template.destination.name.toLowerCase();
}

async function buildOptionDetails(
  input: GenerateTripPlanInput,
  template: TripDestinationTemplate,
  index: number,
): Promise<TripOptionDetails> {
  const { request } = input;
  const currency = request.preferences.currency ?? request.preferences.budget?.currency ?? 'EUR';
  const baseDates = resolvePlannerDates(request);
  const startDate = shiftISODate(baseDates.startDate, index % 3);
  const endDate = shiftISODate(baseDates.endDate, index % 3);
  const nights = Math.max(1, request.durationDays - 1);
  const people = Math.max(1, travellerCount(request.group));
  const origin = pickPlace(request.origins, FALLBACK_ORIGIN);
  const destination = template.destination;

  const suggestions = await suggestPlannerStays({
    ...request,
    destinations: [destination],
  });
  const stayResult =
    input.selectedAccommodation && index === 0
      ? input.selectedAccommodation
      : suggestions.stays[0] ?? mockStayResult(template, nights, currency, request.preferences.comfort);

  const selectedOffers = input.selectedTransport ?? [];
  const longHaul = selectedOffers.length > 0 && index === 0 ? stepsFromOffers(selectedOffers) : [];
  const transport =
    longHaul.length > 0
      ? longHaul
      : mockLongHaul(origin, destination, startDate, endDate, currency, people, template.destination.code ?? String(index));

  const stayRec = stayRecommendation(
    stayResult,
    stayResult,
    destination,
    nights,
    currency,
    request.preferences.comfort,
  );
  const cost = estimateOptionCost({
    transport: transport
      .map((step) => step.estimatedCost)
      .filter((value): value is NonNullable<typeof value> => value !== undefined),
    accommodation: stayRec.estimatedCost,
    travelers: request.group,
    nights,
    currency,
    assumptions: assumptionsFor({ type: 'country', name: template.country, code: template.countryCode }),
  });

  return {
    option: {
      id: `option-${template.destination.id}-${index}-${input.variant ?? 0}`,
      destination,
      country: template.country,
      countryCode: template.countryCode,
      startDate,
      endDate,
      nights,
      travelers: request.group,
      totalPrice: cost.total,
      transportSummary: {
        type: transport[0]?.type ?? 'flight',
        originName: origin.name,
      },
      accommodationSummary: {
        name: stayResult.name,
        stars: Math.max(3, Math.min(5, Math.round(stayResult.rating))),
      },
      highlightKeys: template.highlightKeys,
      tagKeys: template.tagKeys,
      imageUrl: template.imageUrl,
      imageAlt: `${template.destination.name}, ${template.country}`,
    },
    transport,
    stay: stayResult,
    cost,
    budget: request.preferences.budget,
  };
}

function mockStayResult(
  template: TripDestinationTemplate,
  nights: number,
  currency: CurrencyCode,
  comfort: PlannerRequest['preferences']['comfort'],
): AccommodationSearchResult {
  const perNight = comfort === 'luxury' ? 220 : comfort === 'premium' ? 140 : comfort === 'budget' ? 45 : 85;
  return {
    id: `stay-mock-${template.destination.id}`,
    name: `${template.destination.name} Central Hotel`,
    type: 'hotel',
    destination: template.destination,
    country: template.country,
    countryCode: template.countryCode,
    regionIds: [],
    imageUrl: template.imageUrl,
    imageAlt: template.destination.name,
    rating: comfort === 'luxury' ? 4.8 : comfort === 'budget' ? 3.7 : 4.3,
    reviewCount: 420,
    pricePerNight: money(perNight, currency),
    amenities: ['wifi', 'breakfast'],
    breakfastIncluded: true,
    freeCancellation: true,
    privateBathroom: true,
    distanceFromCenterKm: 1.2,
    roomsAvailable: 4,
    provider: 'Demo Stays',
    mealPlan: 'breakfast',
    recommendedRank: 1,
    bookingOptions: [],
    nights,
    totalPrice: money(perNight * nights, currency),
  };
}

function buildTripPlanFromDetails(
  input: GenerateTripPlanInput,
  details: TripOptionDetails,
  variant: number,
): TripPlan {
  const { request } = input;
  const currency = details.cost.currency;
  const stay = stayRecommendation(
    details.stay,
    details.stay,
    details.option.destination,
    details.option.nights,
    currency,
    request.preferences.comfort,
  );
  return buildTripPlan(input, details.stay, variant, {
    destination: details.option.destination,
    startDate: details.option.startDate,
    transport: details.transport,
    stay,
  });
}

function buildTripPlan(
  input: GenerateTripPlanInput,
  suggestedStay: AccommodationSearchResult | undefined,
  variant: number,
  overrides?: {
    destination: PlaceRef;
    startDate: ISODate;
    transport: TransportationStep[];
    stay: AccommodationRecommendation;
  },
): TripPlan {
  const { request } = input;
  const currency = request.preferences.currency ?? request.preferences.budget?.currency ?? 'EUR';
  const dates = resolvePlannerDates(request);
  const destination = overrides?.destination ?? pickPlace(request.destinations, FALLBACK_DESTINATION);
  const origin = pickPlace(request.origins, FALLBACK_ORIGIN);
  const nights = Math.max(1, request.durationDays - 1);
  const people = Math.max(1, travellerCount(request.group));
  const startDate = overrides?.startDate ?? dates.startDate;

  const selectedOffers = input.selectedTransport ?? [];
  const longHaul = stepsFromOffers(selectedOffers);
  const transport =
    overrides?.transport ??
    (longHaul.length > 0
      ? longHaul
      : mockLongHaul(origin, destination, startDate, dates.endDate, currency, people, destination.code ?? 'x'));

  const stay =
    overrides?.stay ??
    stayRecommendation(
    input.selectedAccommodation,
    suggestedStay,
    destination,
    nights,
    currency,
    request.preferences.comfort,
  );

  const days = Array.from({ length: request.durationDays }, (_, index) =>
    buildDay({
      index,
      total: request.durationDays,
      startDate: dates.startDate,
      destination,
      origin,
      request,
      currency,
      people,
      stay,
      transport,
      variant,
    }),
  );

  const draft = {
    days,
    transport,
    accommodation: [stay],
    travelers: request.group,
    convenience: convenienceFrom(transport),
  };

  const assumptions = assumptionsFor(destination);
  const cost = calculateTripCost(costPartsFromDraft(draft, currency, assumptions));

  return {
    id: `plan-${Date.now().toString(36)}-${variant}`,
    destination,
    origins: request.origins?.length ? request.origins : [origin],
    startDate,
    endDate: shiftISODate(startDate, Math.max(0, request.durationDays - 1)),
    travelers: request.group,
    summaryKey: 'planner.plan.summary',
    days,
    transport,
    accommodation: [stay],
    cost,
    budget: request.preferences.budget,
    convenience: draft.convenience,
    selectedTransportOfferIds: selectedOffers.map((offer) => offer.id),
    selectedAccommodationId: input.selectedAccommodation?.id,
  };
}

function buildDay(args: {
  index: number;
  total: number;
  startDate: ISODate;
  destination: PlaceRef;
  origin: PlaceRef;
  request: PlannerRequest;
  currency: CurrencyCode;
  people: number;
  stay: AccommodationRecommendation;
  transport: TransportationStep[];
  variant: number;
}): DayPlan {
  const date = shiftISODate(args.startDate, args.index);
  const first = args.index === 0;
  const last = args.index === args.total - 1;
  const titleKey = first
    ? 'planner.plan.dayTitles.arrival'
    : last
      ? 'planner.plan.dayTitles.departure'
      : dayTitleKey(args.request, args.index);

  const activities = dayActivities(args, first, last);
  const meals = dayMeals(args.request, args.currency, args.people, first, last, args.index);
  const transportation = dayTransport(args, first, last);
  const accommodation = last ? undefined : args.stay;

  const day: DayPlan = {
    dayNumber: args.index + 1,
    date,
    titleKey,
    activities,
    meals,
    transportation,
    accommodation,
    estimatedCost: money(0, args.currency),
  };
  return { ...day, estimatedCost: dayEstimatedCost(day, args.currency) };
}

function dayActivities(
  args: {
    index: number;
    destination: PlaceRef;
    request: PlannerRequest;
    currency: CurrencyCode;
    people: number;
    variant: number;
  },
  first: boolean,
  last: boolean,
): PlannedActivity[] {
  const place = args.destination.name;
  const items: PlannedActivity[] = [];

  if (first) {
    items.push({
      id: `act-${args.index}-arrive`,
      titleKey: 'planner.plan.activities.arrival',
      descriptionKey: 'planner.plan.activityDetails.arrival',
      locationName: place,
      durationMinutes: 60,
      slot: 'morning',
    });
    items.push({
      id: `act-${args.index}-checkin`,
      titleKey: 'planner.plan.activities.checkIn',
      descriptionKey: 'planner.plan.activityDetails.checkIn',
      locationName: place,
      durationMinutes: 30,
      slot: 'afternoon',
    });
  }

  if (last) {
    items.push({
      id: `act-${args.index}-depart`,
      titleKey: 'planner.plan.activities.departure',
      descriptionKey: 'planner.plan.activityDetails.departure',
      locationName: place,
      durationMinutes: 90,
      slot: 'morning',
    });
    return items;
  }

  const pool = ACTIVITY_POOL.filter(
    (item) =>
      item.interests.length === 0 ||
      args.request.preferences.interests.some((interest) => item.interests.includes(interest)) ||
      args.request.tripTypes.some((type) => interestMatchesTrip(type, item.interests)),
  );
  const source = pool.length > 0 ? pool : ACTIVITY_POOL;
  const offset = args.index + args.variant;
  const firstPick = source[offset % source.length];
  const secondPick = source[(offset + 2) % source.length];

  if (firstPick && !first) {
    items.push(toActivity(`act-${args.index}-a`, firstPick, place, args.currency, args.people));
  }
  if (secondPick && secondPick.titleKey !== firstPick?.titleKey) {
    items.push(toActivity(`act-${args.index}-b`, secondPick, place, args.currency, args.people));
  }

  return items;
}

function toActivity(
  id: string,
  template: (typeof ACTIVITY_POOL)[number],
  place: string,
  currency: CurrencyCode,
  people: number,
): PlannedActivity {
  return {
    id,
    titleKey: template.titleKey,
    descriptionKey: template.descriptionKey,
    locationName: place,
    estimatedCost:
      template.costMajor > 0 ? money(template.costMajor * people, currency) : undefined,
    durationMinutes: template.durationMinutes,
    slot: template.slot,
  };
}

function dayMeals(
  request: PlannerRequest,
  currency: CurrencyCode,
  people: number,
  first: boolean,
  last: boolean,
  dayIndex: number,
): PlannedMeal[] {
  const meals: PlannedMeal[] = [];
  const food = request.preferences.food;
  const lunchKey = food.includes('street_food')
    ? 'planner.plan.meals.streetFood'
    : food.includes('fine_dining')
      ? 'planner.plan.meals.fineDining'
      : 'planner.plan.meals.lunch';
  const dinnerKey = food.includes('fine_dining')
    ? 'planner.plan.meals.fineDining'
    : 'planner.plan.meals.dinner';
  const lunchCost = food.includes('fine_dining') ? 35 : food.includes('street_food') ? 10 : 18;
  const dinnerCost = food.includes('fine_dining') ? 55 : 28;

  if (!first && request.stay.breakfastIncluded) {
    meals.push({
      id: `meal-${dayIndex}-breakfast`,
      slot: 'breakfast',
      titleKey: 'planner.plan.meals.breakfast',
    });
  }

  if (!last) {
    meals.push({
      id: `meal-${dayIndex}-lunch`,
      slot: 'lunch',
      titleKey: lunchKey,
      estimatedCost: money(lunchCost * people, currency),
    });
  }

  meals.push({
    id: `meal-${dayIndex}-dinner`,
    slot: 'dinner',
    titleKey: dinnerKey,
    estimatedCost: money(dinnerCost * people, currency),
  });

  return meals;
}

function dayTransport(
  args: {
    transport: TransportationStep[];
    request: PlannerRequest;
    destination: PlaceRef;
    currency: CurrencyCode;
    people: number;
    index: number;
  },
  first: boolean,
  last: boolean,
): TransportationStep[] {
  const steps: TransportationStep[] = [];
  if (first) {
    steps.push(...args.transport.filter((step) => !isReturnStep(step, args.destination)));
  }
  if (last) {
    const returns = args.transport.filter((step) => isReturnStep(step, args.destination));
    steps.push(...(returns.length > 0 ? returns : []));
  }

  if (!last) {
    steps.push(localStep(args.request, args.destination, args.currency, args.people, args.index));
  }
  return steps;
}

function isReturnStep(step: TransportationStep, destination: PlaceRef): boolean {
  return samePlace(step.origin, destination);
}

function localStep(
  request: PlannerRequest,
  destination: PlaceRef,
  currency: CurrencyCode,
  people: number,
  index: number,
): TransportationStep {
  const mode = request.transportMode ?? 'public_transport';
  const type: TransportStepType =
    mode === 'taxi' ? 'taxi' : mode === 'rental_car' ? 'rental_car' : 'public_transport';
  const costMajor = type === 'taxi' ? 14 : type === 'rental_car' ? 9 : 4;

  return {
    id: `local-${index}`,
    type,
    origin: destination,
    destination,
    durationMinutes: type === 'rental_car' ? 40 : 25,
    estimatedCost: money(costMajor * people, currency),
  };
}

function stayRecommendation(
  selected: AccommodationSearchResult | undefined,
  suggested: AccommodationSearchResult | undefined,
  destination: PlaceRef,
  nights: number,
  currency: CurrencyCode,
  comfort: PlannerRequest['preferences']['comfort'],
): AccommodationRecommendation {
  const source = selected ?? suggested;
  if (source) {
    return {
      id: source.id,
      name: source.name,
      destination: source.destination,
      nights: source.nights || nights,
      estimatedCost: alignCurrency(source.totalPrice, currency),
      fromSelection: Boolean(selected),
    };
  }

  const perNight = comfort === 'luxury' ? 220 : comfort === 'premium' ? 140 : comfort === 'budget' ? 45 : 85;
  return {
    id: `stay-mock-${destination.id ?? destination.name}`,
    nameKey: 'planner.plan.stayFallback',
    destination,
    nights,
    estimatedCost: money(perNight * nights, currency),
    fromSelection: false,
  };
}

function stepsFromOffers(offers: JourneyOffer[]): TransportationStep[] {
  return offers.flatMap((offer) =>
    offer.journeys.flatMap((journey) =>
      journey.segments.map((segment) => ({
        id: segment.id,
        type: MODE_TO_STEP[segment.mode],
        origin: segment.origin,
        destination: segment.destination,
        departure: segment.departure,
        arrival: segment.arrival,
        durationMinutes: segment.durationMinutes,
        estimatedCost: segment.estimatedCost,
        sourceOfferId: offer.id,
      })),
    ),
  );
}

function mockLongHaul(
  origin: PlaceRef,
  destination: PlaceRef,
  startDate: ISODate,
  endDate: ISODate,
  currency: CurrencyCode,
  people: number,
  key: string,
): TransportationStep[] {
  const outboundCost = money(280 * people, currency);
  const returnCost = money(260 * people, currency);
  return [
    {
      id: `mock-outbound-${key}`,
      type: 'flight',
      origin,
      destination,
      departure: `${startDate}T08:20`,
      arrival: `${startDate}T11:05`,
      durationMinutes: 165,
      estimatedCost: outboundCost,
    },
    {
      id: `mock-return-${key}`,
      type: 'flight',
      origin: destination,
      destination: origin,
      departure: `${endDate}T18:30`,
      arrival: `${endDate}T23:05`,
      durationMinutes: 215,
      estimatedCost: returnCost,
    },
  ];
}

function convenienceFrom(transport: TransportationStep[]): TripPlan['convenience'] {
  return {
    transferCount: Math.max(0, transport.length - 1),
    overnightTravel: transport.some((step) => {
      if (!step.departure || !step.arrival) return false;
      return step.departure.slice(0, 10) !== step.arrival.slice(0, 10);
    }),
    airportChanges: transport.filter((step) => step.type === 'flight').length > 2 ? 1 : 0,
    totalTravelMinutes: transport.reduce((sum, step) => sum + step.durationMinutes, 0),
    visaMayBeRequired: false,
    longLayovers: transport.some((step) => step.durationMinutes >= 180),
  };
}

function assumptionsFor(destination: PlaceRef): TripCostAssumptions {
  const code = destination.type === 'country' ? destination.code : undefined;
  return {
    ...MOCK_TRIP_COST_ASSUMPTIONS,
    visaPerTravellerMinor: code ? (VISA_MINOR_BY_CODE[code] ?? 0) : 0,
  };
}

function pickPlace(places: PlaceRef[] | undefined, fallback: PlaceRef): PlaceRef {
  return places?.find((place) => place.type !== 'anywhere') ?? fallback;
}

function samePlace(left: PlaceRef, right: PlaceRef): boolean {
  if (left.id && right.id) return left.id === right.id;
  if (left.code && right.code) return left.code === right.code;
  return left.name.trim().toLowerCase() === right.name.trim().toLowerCase();
}

function alignCurrency(value: Money, currency: CurrencyCode): Money {
  return value.currency === currency ? value : { amountMinor: value.amountMinor, currency };
}

function dayTitleKey(request: PlannerRequest, index: number): string {
  if (request.tripTypes.includes('beach') || request.preferences.interests.includes('beaches')) {
    return 'planner.plan.dayTitles.beach';
  }
  if (request.tripTypes.includes('nature') || request.preferences.interests.includes('hiking')) {
    return 'planner.plan.dayTitles.nature';
  }
  if (request.tripTypes.includes('cultural') || request.preferences.interests.includes('museums')) {
    return 'planner.plan.dayTitles.culture';
  }
  if (request.tripTypes.includes('gastronomic') || request.preferences.interests.includes('local_food')) {
    return 'planner.plan.dayTitles.food';
  }
  return index % 2 === 0 ? 'planner.plan.dayTitles.explore' : 'planner.plan.dayTitles.city';
}

function interestMatchesTrip(tripType: PlannerRequest['tripTypes'][number], interests: Interest[]): boolean {
  if (tripType === 'beach') return interests.includes('beaches') || interests.includes('water_sports');
  if (tripType === 'cultural') return interests.includes('museums') || interests.includes('history');
  if (tripType === 'nature') return interests.includes('hiking');
  if (tripType === 'gastronomic') return interests.includes('local_food');
  if (tripType === 'nightlife') return interests.includes('nightlife');
  if (tripType === 'wellness') return interests.includes('spa');
  return false;
}
