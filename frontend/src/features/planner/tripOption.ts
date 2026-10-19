import type { AccommodationSearchResult } from '@/features/hotels/types';
import { estimateOptionCost } from './tripCost';
import type { TripOptionDetails } from './tripPlan';
import type { TravelGroup } from './types';

export function withOptionStay(
  details: TripOptionDetails,
  stay: AccommodationSearchResult,
  travelers: TravelGroup,
): TripOptionDetails {
  const transportCosts = details.transport
    .map((step) => step.estimatedCost)
    .filter((value): value is NonNullable<typeof value> => value !== undefined);
  const cost = estimateOptionCost({
    transport: transportCosts,
    accommodation: stay.totalPrice,
    travelers,
    nights: stay.nights || details.option.nights,
    currency: details.cost.currency,
  });

  return {
    ...details,
    stay,
    cost,
    option: {
      ...details.option,
      totalPrice: cost.total,
      accommodationSummary: {
        name: stay.name,
        stars: Math.max(3, Math.min(5, Math.round(stay.rating))),
      },
    },
  };
}
