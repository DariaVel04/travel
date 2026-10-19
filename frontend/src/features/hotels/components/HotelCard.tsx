import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerLink } from '@/components/PartnerLink/PartnerLink';
import { Badge } from '@/components/ui/Badge';
import card from '@/components/ui/Card.module.css';
import { TripAddButton } from '@/features/trips/components/TripAddButton';
import { useCurrentTrip } from '@/features/trips/tripContext';
import type { TripTravelers } from '@/features/trips/types';
import { useLocale } from '@/hooks/useLocale';
import type { ISODate } from '@/types/common';
import { cx } from '@/utils/classNames';
import { formatMoney } from '@/utils/money';
import type { AccommodationSearchResult } from '../types';
import styles from './HotelCard.module.css';

export function HotelCard({
  stay,
  allowAddToTrip = false,
  stayDates,
  travelers,
}: {
  stay: AccommodationSearchResult;
  allowAddToTrip?: boolean;
  stayDates?: { startDate: ISODate; endDate: ISODate };
  travelers?: TripTravelers;
}) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const { addAccommodation, hasAccommodation } = useCurrentTrip();
  const [imageFailed, setImageFailed] = useState(false);
  const booking = stay.bookingOptions[0];
  const visibleAmenities = stay.amenities.slice(0, 4);
  const added = hasAccommodation(stay.id);

  return (
    <article className={cx(card.card, styles.card)}>
      <div className={styles.media}>
        {imageFailed ? (
          <div className={styles.fallback} role="img" aria-label={stay.name} />
        ) : (
          <img
            src={stay.imageUrl}
            alt={stay.imageAlt}
            className={styles.image}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <div className={styles.badges}>
            <Badge tone="info">{t(`hotels.types.${stay.type}`)}</Badge>
            {stay.freeCancellation && (
              <Badge tone="success">{t('hotels.card.freeCancellation')}</Badge>
            )}
            {stay.breakfastIncluded && <Badge>{t('hotels.card.breakfastIncluded')}</Badge>}
          </div>
          <h3 className={styles.name}>{stay.name}</h3>
          <p className={styles.location}>
            {stay.destination.name}, {stay.country}
            {' · '}
            {t('hotels.card.distance', { distance: stay.distanceFromCenterKm })}
          </p>
        </div>

        <p className={styles.rating}>
          <strong>{stay.rating.toFixed(1)}</strong>
          <span>{t('hotels.card.reviews', { count: stay.reviewCount })}</span>
        </p>

        <ul className={styles.amenities}>
          {visibleAmenities.map((amenity) => (
            <li key={amenity}>{t(`hotels.amenities.${amenity}`)}</li>
          ))}
          {!stay.privateBathroom && <li>{t('hotels.card.sharedBathroom')}</li>}
        </ul>
      </div>

      <div className={styles.side}>
        <p className={styles.provider}>{t('hotels.card.provider', { name: stay.provider })}</p>
        <div>
          <p className={styles.nightlyLabel}>{t('hotels.card.perNight')}</p>
          <p className={styles.nightly}>{formatMoney(stay.pricePerNight, intlLocale)}</p>
          <p className={styles.total}>
            {t('hotels.card.total', {
              amount: formatMoney(stay.totalPrice, intlLocale),
              count: stay.nights,
            })}
          </p>
        </div>
        {booking && (
          <PartnerLink booking={booking} offerId={stay.id} placement="hotel_results">
            {t('hotels.card.viewDeal')}
          </PartnerLink>
        )}
        {allowAddToTrip && (
          <TripAddButton
            added={added}
            onAdd={() =>
              addAccommodation(stay, {
                startDate: stayDates?.startDate,
                endDate: stayDates?.endDate,
                travelers,
              })
            }
          />
        )}
        <p className={styles.disclosure}>{t('hotels.results.demoPrice')}</p>
      </div>
    </article>
  );
}
