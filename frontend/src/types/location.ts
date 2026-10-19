import type { LanguageCode } from '@/i18n/languages';
import type { GeoPoint } from './common';

/** Three-letter IATA airport or city code, e.g. "HEL". */
export type IataCode = string;

export interface Airport {
  iata: IataCode;
  name: string;
  cityName: string;
  countryCode: string;
  location?: GeoPoint;
}

/** Kinds of places a traveller can pick in a location selector, from narrowest to broadest. */
export type LocationType = 'airport' | 'city' | 'country' | 'region' | 'anywhere';

/** Place names in other languages. English `name` is used when a translation is missing. */
export type LocalizedNames = Partial<Record<LanguageCode, string>>;

export interface LocationName {
  name: string;
  localizedNames?: LocalizedNames;
}

/**
 * A selectable location, as returned by a location/airport search provider.
 * The mock provider and a future real API both return this shape.
 */
export interface TravelLocation extends LocationName {
  /** Stable id used in URLs, e.g. "airport-HEL", "city-BKK", "country-TH", "region-europe". */
  id: string;
  type: LocationType;
  /** IATA code for airports and cities, ISO 3166 code for countries. */
  code?: string;
  countryCode?: string;
  /** Enclosing places for context, nearest first: airport → [city, country]. */
  parents?: LocationName[];
  /** Alternative spellings that should also match, e.g. "Saigon". */
  keywords?: string[];
}

/**
 * A reference to a place the user searched for.
 * `free_text` is used until a real autocomplete/geocoding service resolves
 * the user's input into an airport, city, country or region.
 */
export interface PlaceRef {
  type: LocationType | 'free_text';
  name: string;
  /** Id of the TravelLocation this reference was created from. */
  id?: string;
  /** IATA code for airports/cities, ISO code for countries. */
  code?: string;
}
