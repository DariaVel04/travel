/**
 * Option lists for the travel / transport search UI.
 * Types in ./types.ts are derived from these arrays, so adding an option here
 * automatically updates the types (and TypeScript will ask for a translation key).
 */

export const TRIP_KINDS = ['round_trip', 'one_way', 'multi_city', 'open_jaw'] as const;

export const DATE_MODES = ['exact', 'range', 'flexible', 'months', 'cheapest'] as const;

export const DURATION_PRESETS = [3, 7, 14, 30] as const;

export const CHEAPEST_WITHIN_MONTHS = [3, 6, 12] as const;

export const FLEX_DAYS_OPTIONS = [1, 2, 3, 7] as const;

export const JOURNEY_TRANSPORT_MODES = ['flight', 'train', 'bus', 'car', 'ferry'] as const;

export const TRANSPORT_FILTERS = [...JOURNEY_TRANSPORT_MODES, 'any', 'mixed'] as const;

export const CABIN_CLASSES = ['economy', 'premium_economy', 'business', 'first'] as const;

export const STOPS_PREFERENCES = ['any', 'nonstop', 'one', 'two_plus'] as const;

export const BAGGAGE_PREFERENCES = ['none', 'one', 'two'] as const;

export const DEPARTURE_TIME_WINDOWS = ['any', 'morning', 'afternoon', 'evening', 'night'] as const;

export const OVERNIGHT_PREFERENCES = ['any', 'avoid', 'allowed'] as const;

export const JOURNEY_PREFERENCES = [
  'cheapest',
  'fastest',
  'fewer_transfers',
  'comfortable',
] as const;

export const JOURNEY_TRANSPORT_ICONS: Record<(typeof JOURNEY_TRANSPORT_MODES)[number], string> = {
  flight: '✈️',
  train: '🚆',
  bus: '🚌',
  car: '🚗',
  ferry: '⛴️',
};

/**
 * Where flight-like offers can come from. Tour operators, charters and packages
 * are separate sources on purpose: they often have seats regular flight search doesn't show.
 */
export const OFFER_SOURCE_TYPES = [
  'airline',
  'ota',
  'tour_operator',
  'charter',
  'package',
] as const;
