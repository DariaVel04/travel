import type { ClimatePreference, TripType } from '@/features/planner/types';
import type { PlaceRef } from '@/types/location';

export interface TripDestinationTemplate {
  destination: PlaceRef;
  country: string;
  countryCode: string;
  climates: ClimatePreference[];
  tripTypes: TripType[];
  highlightKeys: string[];
  tagKeys: string[];
  imageUrl: string;
}

export const TRIP_DESTINATION_TEMPLATES: TripDestinationTemplate[] = [
  {
    destination: { type: 'city', id: 'city-BCN', name: 'Barcelona', code: 'BCN' },
    country: 'Spain',
    countryCode: 'ES',
    climates: ['any', 'hot', 'warm', 'mild'],
    tripTypes: ['beach', 'cultural', 'gastronomic', 'nightlife', 'family', 'romantic'],
    highlightKeys: ['planner.options.highlights.beach', 'planner.options.highlights.culture', 'planner.options.highlights.food'],
    tagKeys: ['planner.options.tags.beach', 'planner.options.tags.culture', 'planner.options.tags.food'],
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-ROM', name: 'Rome', code: 'ROM' },
    country: 'Italy',
    countryCode: 'IT',
    climates: ['any', 'warm', 'mild', 'hot'],
    tripTypes: ['cultural', 'gastronomic', 'romantic', 'family', 'luxury'],
    highlightKeys: ['planner.options.highlights.history', 'planner.options.highlights.food', 'planner.options.highlights.culture'],
    tagKeys: ['planner.options.tags.history', 'planner.options.tags.food', 'planner.options.tags.culture'],
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-PAR', name: 'Paris', code: 'PAR' },
    country: 'France',
    countryCode: 'FR',
    climates: ['any', 'mild', 'cool', 'warm'],
    tripTypes: ['cultural', 'romantic', 'gastronomic', 'luxury', 'family'],
    highlightKeys: ['planner.options.highlights.culture', 'planner.options.highlights.food', 'planner.options.highlights.city'],
    tagKeys: ['planner.options.tags.culture', 'planner.options.tags.food', 'planner.options.tags.city'],
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-BKK', name: 'Bangkok', code: 'BKK' },
    country: 'Thailand',
    countryCode: 'TH',
    climates: ['any', 'hot', 'warm'],
    tripTypes: ['gastronomic', 'nightlife', 'cultural', 'budget', 'adventure'],
    highlightKeys: ['planner.options.highlights.food', 'planner.options.highlights.city', 'planner.options.highlights.culture'],
    tagKeys: ['planner.options.tags.food', 'planner.options.tags.city', 'planner.options.tags.culture'],
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-HEL', name: 'Helsinki', code: 'HEL' },
    country: 'Finland',
    countryCode: 'FI',
    climates: ['any', 'cool', 'mild', 'snow'],
    tripTypes: ['nature', 'cultural', 'family', 'wellness'],
    highlightKeys: ['planner.options.highlights.nature', 'planner.options.highlights.city', 'planner.options.highlights.relaxation'],
    tagKeys: ['planner.options.tags.nature', 'planner.options.tags.city', 'planner.options.tags.relaxation'],
    imageUrl: 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-STO', name: 'Stockholm', code: 'STO' },
    country: 'Sweden',
    countryCode: 'SE',
    climates: ['any', 'cool', 'mild', 'snow'],
    tripTypes: ['cultural', 'nature', 'family', 'luxury'],
    highlightKeys: ['planner.options.highlights.city', 'planner.options.highlights.culture', 'planner.options.highlights.nature'],
    tagKeys: ['planner.options.tags.city', 'planner.options.tags.culture', 'planner.options.tags.nature'],
    imageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-TYO', name: 'Tokyo', code: 'TYO' },
    country: 'Japan',
    countryCode: 'JP',
    climates: ['any', 'mild', 'warm', 'cool'],
    tripTypes: ['cultural', 'gastronomic', 'nightlife', 'luxury', 'family'],
    highlightKeys: ['planner.options.highlights.culture', 'planner.options.highlights.food', 'planner.options.highlights.city'],
    tagKeys: ['planner.options.tags.culture', 'planner.options.tags.food', 'planner.options.tags.city'],
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-NYC', name: 'New York', code: 'NYC' },
    country: 'United States',
    countryCode: 'US',
    climates: ['any', 'mild', 'cool', 'warm'],
    tripTypes: ['cultural', 'nightlife', 'gastronomic', 'luxury', 'family'],
    highlightKeys: ['planner.options.highlights.city', 'planner.options.highlights.culture', 'planner.options.highlights.food'],
    tagKeys: ['planner.options.tags.city', 'planner.options.tags.culture', 'planner.options.tags.food'],
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-LIS', name: 'Lisbon', code: 'LIS' },
    country: 'Portugal',
    countryCode: 'PT',
    climates: ['any', 'warm', 'mild', 'hot'],
    tripTypes: ['beach', 'gastronomic', 'cultural', 'romantic', 'budget'],
    highlightKeys: ['planner.options.highlights.ocean', 'planner.options.highlights.food', 'planner.options.highlights.city'],
    tagKeys: ['planner.options.tags.ocean', 'planner.options.tags.food', 'planner.options.tags.city'],
    imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-ATH', name: 'Athens', code: 'ATH' },
    country: 'Greece',
    countryCode: 'GR',
    climates: ['any', 'hot', 'warm', 'mild'],
    tripTypes: ['cultural', 'beach', 'gastronomic', 'family', 'budget'],
    highlightKeys: ['planner.options.highlights.history', 'planner.options.highlights.beach', 'planner.options.highlights.food'],
    tagKeys: ['planner.options.tags.history', 'planner.options.tags.beach', 'planner.options.tags.food'],
    imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=960&auto=format&fit=crop',
  },
  {
    destination: { type: 'city', id: 'city-VAL', name: 'Valencia', code: 'VAL' },
    country: 'Spain',
    countryCode: 'ES',
    climates: ['any', 'hot', 'warm', 'mild'],
    tripTypes: ['beach', 'gastronomic', 'family', 'wellness', 'budget'],
    highlightKeys: ['planner.options.highlights.beach', 'planner.options.highlights.relaxation', 'planner.options.highlights.food'],
    tagKeys: ['planner.options.tags.beach', 'planner.options.tags.relaxation', 'planner.options.tags.food'],
    imageUrl: 'https://images.unsplash.com/photo-1593278144743-0b8094c43b36?w=960&auto=format&fit=crop',
  },
];
