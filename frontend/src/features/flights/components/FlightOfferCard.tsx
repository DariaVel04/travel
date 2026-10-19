import { useTranslation } from 'react-i18next';
import { PartnerLink } from '@/components/PartnerLink/PartnerLink';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import card from '@/components/ui/Card.module.css';
import { TripAddButton } from '@/features/trips/components/TripAddButton';
import { useCurrentTrip } from '@/features/trips/tripContext';
import type { TripTravelers } from '@/features/trips/types';
import { useLocale } from '@/hooks/useLocale';
import type { Severity } from '@/types/common';
import { cx } from '@/utils/classNames';
import { calendarDaysBetween, formatTime, splitMinutes } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { placeLabel } from '../journey';
import { JOURNEY_TRANSPORT_ICONS } from '../options';
import type { FlightPriceBreakdown, Journey, JourneyOffer, JourneySegment } from '../types';
import styles from './FlightOfferCard.module.css';

const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
};

const BREAKDOWN_KEYS = ['base', 'baggage', 'fees', 'transfer'] as const satisfies ReadonlyArray<
  keyof FlightPriceBreakdown
>;

export function FlightOfferCard({
  offer,
  travelers,
}: {
  offer: JourneyOffer;
  travelers?: TripTravelers;
}) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const { addTransport, hasTransport } = useCurrentTrip();
  const booking = offer.bookingOptions[0];
  const mixed = offer.modes.length > 1;
  const added = hasTransport(offer.id);

  return (
    <article className={cx(card.card, styles.card)}>
      <div className={styles.main}>
        <div className={styles.badges}>
          <Badge>{t('flights.results.demoBadge')}</Badge>
          {mixed && <Badge tone="accent">{t('flights.results.mixed')}</Badge>}
          {offer.modes.map((mode) => (
            <Badge key={mode} tone="info">
              {JOURNEY_TRANSPORT_ICONS[mode]} {t(`flights.form.transport.${mode}`)}
            </Badge>
          ))}
          {offer.sourceType && (
            <Badge tone="info">{t(`flights.sourceType.${offer.sourceType}`)}</Badge>
          )}
          {offer.tags.map((tag) => (
            <Badge key={tag} tone="accent">
              {t(`flights.tags.${tag}`)}
            </Badge>
          ))}
        </div>

        {offer.journeys.map((item) => (
          <JourneyBlock key={item.id} journey={item} />
        ))}

        <div className={styles.inconveniences}>
          <span className="visually-hidden">{t('flights.results.inconveniencesLabel')}</span>
          {offer.inconveniences.length === 0 ? (
            <Badge tone="success">{t('flights.results.noInconveniences')}</Badge>
          ) : (
            offer.inconveniences.map((factor) => (
              <Badge key={factor.type} tone={SEVERITY_TONE[factor.severity]}>
                {t(`inconvenience.${factor.type}`)}
                <span className="visually-hidden">
                  {` (${t(`common.severity.${factor.severity}`)})`}
                </span>
              </Badge>
            ))
          )}
        </div>

        <p className={styles.score}>
          {t('flights.results.convenienceScore')}: <Badge>{t('common.comingSoon')}</Badge>
        </p>
      </div>

      <div className={styles.side}>
        <div>
          <p className={styles.priceLabel}>{t('flights.results.totalPrice')}</p>
          <p className={styles.price}>{formatMoney(offer.price.total, intlLocale)}</p>
        </div>

        <details className={styles.breakdown}>
          <summary>{t('flights.results.priceBreakdown')}</summary>
          <dl>
            {BREAKDOWN_KEYS.map((key) => {
              const amount = offer.price[key];
              if (!amount) return null;
              return (
                <div key={key} className={styles.breakdownRow}>
                  <dt>{t(`flights.results.breakdown.${key}`)}</dt>
                  <dd>{formatMoney(amount, intlLocale)}</dd>
                </div>
              );
            })}
          </dl>
        </details>

        {booking && (
          <>
            <PartnerLink booking={booking} offerId={offer.id} placement="journey_results">
              {t('flights.results.viewDeal', { partner: booking.partnerName })}
            </PartnerLink>
            <p className={styles.disclosure}>{t('flights.results.partnerDisclosure')}</p>
          </>
        )}
        <TripAddButton added={added} onAdd={() => addTransport(offer, { travelers })} />
      </div>
    </article>
  );
}

function JourneyBlock({ journey }: { journey: Journey }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const labelKey =
    journey.direction === 'inbound'
      ? 'flights.results.inbound'
      : journey.direction === 'outbound'
        ? 'flights.results.outbound'
        : 'flights.results.leg';

  return (
    <div className={styles.journey}>
      <p className={styles.journeyLabel}>{t(labelKey)}</p>
      <div className={styles.segments}>
        {journey.segments.map((item) => (
          <SegmentRow key={item.id} segment={item} />
        ))}
      </div>
      <p className={styles.journeyMeta}>
        {t('common.duration', splitMinutes(journey.totalDurationMinutes))}
        {' · '}
        {journey.totalTransfers === 0
          ? t('flights.results.direct')
          : t('flights.results.transfers', { count: journey.totalTransfers })}
        {' · '}
        {formatMoney(journey.estimatedCost, intlLocale)}
      </p>
    </div>
  );
}

function SegmentRow({ segment }: { segment: JourneySegment }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const extraDays = calendarDaysBetween(segment.departure, segment.arrival);

  return (
    <div className={styles.segment}>
      <div className={styles.endpoint}>
        <span className={styles.time}>{formatTime(segment.departure, intlLocale)}</span>
        <span className={styles.place}>{placeLabel(segment.origin)}</span>
      </div>

      <div className={styles.path}>
        <span className={styles.mode}>
          {JOURNEY_TRANSPORT_ICONS[segment.mode]} {t(`flights.form.transport.${segment.mode}`)}
        </span>
        <span className={styles.line} aria-hidden="true" />
        <span className={styles.stops}>
          {t('common.duration', splitMinutes(segment.durationMinutes))}
          {segment.carrier && ` · ${segment.carrier}`}
          {segment.vehicleCode && ` ${segment.vehicleCode}`}
          {segment.transfers > 0 &&
            ` · ${t('flights.results.transfers', { count: segment.transfers })}`}
        </span>
      </div>

      <div className={cx(styles.endpoint, styles.arrival)}>
        <span className={styles.time}>
          {formatTime(segment.arrival, intlLocale)}
          {extraDays > 0 && (
            <sup className={styles.nextDay}>
              {t('flights.results.nextDay', { count: extraDays })}
            </sup>
          )}
        </span>
        <span className={styles.place}>{placeLabel(segment.destination)}</span>
      </div>
    </div>
  );
}
