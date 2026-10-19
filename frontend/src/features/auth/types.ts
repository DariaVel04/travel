import type { CurrencyCode, ISODateTime } from '@/types/common';
import type { PlaceRef } from '@/types/location';
import type { LanguageCode } from '@/i18n/languages';
import type { FlightSearchParams } from '@/features/flights/types';
import type { AccommodationSearchParams } from '@/features/hotels/types';
import type { PlannerRequest, TravelGroup, TravelPreferences } from '@/features/planner/types';
import type { UserSubscription } from '@/features/subscription/types';
import type { PublicUser, SubscriptionPlan, UserStatus } from '@/services/api/types';

export type { PublicUser, SubscriptionPlan, UserStatus };

/** Authenticated account returned by the backend. Distinct from the future-oriented User below. */
export type CurrentUser = PublicUser;

export type AuthProvider = 'email' | 'google' | 'apple';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  authProviders: AuthProvider[];
  preferredLanguage: LanguageCode;
  preferredCurrency: CurrencyCode;
  subscription: UserSubscription;
  createdAt: ISODateTime;
}

/** A reusable group, e.g. "Family (2 adults, 2 kids)". */
export interface GroupPreset {
  id: string;
  name: string;
  group: TravelGroup;
}

export type SavedSearch =
  | { id: string; type: 'flight'; params: FlightSearchParams; createdAt: ISODateTime }
  | { id: string; type: 'accommodation'; params: AccommodationSearchParams; createdAt: ISODateTime }
  | { id: string; type: 'planner'; params: PlannerRequest; createdAt: ISODateTime };

/** Everything a signed-in user can save. */
export interface UserLibrary {
  preferences?: TravelPreferences;
  groupPresets: GroupPreset[];
  favouriteDestinations: PlaceRef[];
  favouriteAccommodationIds: string[];
  savedSearches: SavedSearch[];
  tripIds: string[];
}
