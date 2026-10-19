import type { ISODateTime, Money } from './common';

/**
 * The platform never sells anything itself. Every bookable offer points to a Partner,
 * and the user books on the partner's site through an affiliate/referral link.
 */
export type PartnerType =
  'flight' | 'hotel' | 'tour_operator' | 'rental_car' | 'taxi' | 'transport' | 'activities';

export type AffiliateNetwork = 'direct' | 'travelpayouts' | 'awin' | 'cj' | 'impact' | 'other';

export type CommissionModel = 'cpa' | 'cpc' | 'revenue_share';

export interface AffiliateConfig {
  network: AffiliateNetwork;
  /** Query parameter name the partner uses for tracking, e.g. "marker" or "aid". */
  trackingParam: string;
  trackingId: string;
  commissionModel?: CommissionModel;
}

export interface Partner {
  id: string;
  name: string;
  types: PartnerType[];
  websiteUrl: string;
  logoUrl?: string;
  affiliate?: AffiliateConfig;
  isActive: boolean;
}

/**
 * One way to book an offer. The same flight or hotel can often be booked
 * through several partners at different prices, so offers hold a list of these.
 */
export interface BookingOption {
  partnerId: string;
  partnerName: string;
  price: Money;
  /** Direct link to the offer on the partner's site (before tracking params are added). */
  deeplink: string;
}

/** Recorded when a user clicks through to a partner. */
export interface PartnerClickEvent {
  partnerId: string;
  offerId: string;
  /** Where on the site the click happened, e.g. "flight_results". */
  placement: string;
  timestamp: ISODateTime;
}

/** Reported back by the partner/affiliate network when a booking happens. */
export interface PartnerConversion {
  clickId: string;
  partnerId: string;
  status: 'pending' | 'confirmed' | 'rejected';
  commission?: Money;
}
