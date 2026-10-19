import type { LanguageCode } from '@/i18n/languages';
import type { LocationName, PlaceRef, TravelLocation } from '@/types/location';

export function getLocalizedName(location: LocationName, language: LanguageCode): string {
  return location.localizedNames?.[language] ?? location.name;
}

/** "Helsinki, Finland" style context line for a location. */
export function getLocationContext(location: TravelLocation, language: LanguageCode): string {
  return (location.parents ?? []).map((parent) => getLocalizedName(parent, language)).join(', ');
}

/** "FI" → 🇫🇮 */
export function countryCodeToFlag(countryCode: string): string {
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

export function toPlaceRef(location: TravelLocation): PlaceRef {
  return { type: location.type, id: location.id, name: location.name, code: location.code };
}
