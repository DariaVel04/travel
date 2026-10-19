export const ACCOMMODATION_TYPES = [
  'hotel',
  'apartment',
  'hostel',
  'guesthouse',
  'resort',
  'villa',
  'aparthotel',
] as const;

export const ACCOMMODATION_TYPE_FILTERS = ['any', ...ACCOMMODATION_TYPES] as const;

export const ACCOMMODATION_AMENITIES = [
  'wifi',
  'breakfast',
  'parking',
  'pool',
  'air_conditioning',
  'spa',
  'gym',
  'pets_allowed',
] as const;

export const RATING_FILTERS = ['any', '3', '4', '4_5'] as const;

export const ACCOMMODATION_SORTS = [
  'recommended',
  'price_asc',
  'price_desc',
  'rating',
  'distance',
] as const;

export const PRICE_CURRENCIES = ['any', 'EUR', 'USD', 'GBP', 'THB'] as const;

export const MEAL_PLANS = [
  'room_only',
  'breakfast',
  'half_board',
  'full_board',
  'all_inclusive',
] as const;
