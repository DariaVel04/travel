import type { ReactNode } from 'react';
import { buildPartnerUrl, trackPartnerClick } from '@/services/partners/partnerLinks';
import { getPartner } from '@/services/partners/partnerRegistry';
import type { BookingOption } from '@/types/partner';
import styles from './PartnerLink.module.css';

interface PartnerLinkProps {
  booking: BookingOption;
  offerId: string;
  /** Where the link is shown, used for click analytics, e.g. "flight_results". */
  placement: string;
  children: ReactNode;
}

/**
 * Every outgoing link to a booking partner goes through this component, so affiliate
 * tracking parameters and click tracking are handled in one place.
 */
export function PartnerLink({ booking, offerId, placement, children }: PartnerLinkProps) {
  const partner = getPartner(booking.partnerId);
  const href = buildPartnerUrl(booking.deeplink, partner, placement);

  return (
    <a
      href={href}
      className={styles.link}
      target="_blank"
      // "sponsored" tells search engines this is an affiliate link.
      rel="sponsored noopener noreferrer"
      onClick={() =>
        trackPartnerClick({
          partnerId: booking.partnerId,
          offerId,
          placement,
          timestamp: new Date().toISOString(),
        })
      }
    >
      {children}
    </a>
  );
}
