import type { Partner, PartnerClickEvent } from '@/types/partner';

const UTM_SOURCE = 'ai-travel-planner';

/** Adds affiliate tracking and UTM parameters to a partner deeplink. */
export function buildPartnerUrl(deeplink: string, partner: Partner | undefined, placement: string) {
  const url = new URL(deeplink);

  if (partner?.affiliate) {
    url.searchParams.set(partner.affiliate.trackingParam, partner.affiliate.trackingId);
  }
  url.searchParams.set('utm_source', UTM_SOURCE);
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_content', placement);

  return url.toString();
}

/**
 * Placeholder for click tracking. Later this will send the event to our backend
 * (e.g. navigator.sendBeacon) so clicks can be matched with partner conversions.
 */
export function trackPartnerClick(event: PartnerClickEvent): void {
  if (import.meta.env.DEV) {
    console.info('[partner-click]', event);
  }
}
