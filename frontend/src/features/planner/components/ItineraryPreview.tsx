import { useTranslation } from 'react-i18next';
import { buildHotelsUrl } from '@/app/paths';
import { ButtonLink } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { Notice } from '@/components/ui/Notice';
import { HotelCard } from '@/features/hotels/components/HotelCard';
import { TRANSPORT_MODE_ICONS } from '@/features/transportation/options';
import type { TransportLeg, TransportVehicle } from '@/features/transportation/types';
import { useLocale } from '@/hooks/useLocale';
import type { Money } from '@/types/common';
import { cx } from '@/utils/classNames';
import { formatMoney, sumMoney } from '@/utils/money';
import type { Itinerary, ItineraryDay } from '../types';
import styles from './ItineraryPreview.module.css';

const VEHICLE_ICONS: Record<TransportVehicle, string> = {
  metro: '🚇',
  bus: '🚌',
  tram: '🚋',
  train: '🚆',
  ferry: '⛴',
  taxi: '🚕',
  car: '🚗',
  walk: '🚶',
};

export function ItineraryPreview({ itinerary }: { itinerary: Itinerary }) {
  const { t } = useTranslation();

  const destination = itinerary.destinationName ?? t('planner.result.destinationFallback');

  return (
    <section className={styles.preview} aria-labelledby="itinerary-title">
      <h2 id="itinerary-title" className={styles.title}>
        {t('planner.result.title')}
      </h2>
      <Notice>{t('planner.result.demoNotice')}</Notice>

      <div className={cx(card.card, styles.summary)}>
        <h3 className={styles.tripTitle}>{t('planner.result.tripTo', { destination })}</h3>
        <p className={styles.meta}>
          {t('common.days', { count: itinerary.durationDays })} ·{' '}
          {t('common.travellers', { count: itinerary.travellerCount })}
          {itinerary.transportMode && (
            <>
              {' · '}
              {TRANSPORT_MODE_ICONS[itinerary.transportMode]}{' '}
              {t('planner.result.gettingAround', {
                mode: t(`transportation.modes.${itinerary.transportMode}.title`),
              })}
            </>
          )}
        </p>
      </div>

      <section className={styles.stays} aria-labelledby="planner-stays-title">
        <h3 id="planner-stays-title" className={styles.staysTitle}>
          {t('planner.result.staysTitle')}
        </h3>
        {itinerary.stays.length === 0 ? (
          <p className={styles.meta}>{t('planner.result.staysEmpty')}</p>
        ) : (
          <ul className={styles.stayList}>
            {itinerary.stays.map((stay) => (
              <li key={stay.id}>
                <HotelCard stay={stay} />
              </li>
            ))}
          </ul>
        )}
        <div className={styles.stayActions}>
          <ButtonLink to={buildHotelsUrl({ destination: itinerary.destinationIds })} variant="secondary">
            {t('planner.result.compareMore')}
          </ButtonLink>
        </div>
      </section>

      <ol className={styles.days}>
        {itinerary.days.map((day) => (
          <li key={day.dayNumber}>
            <DayCard day={day} />
          </li>
        ))}
      </ol>

      {itinerary.durationDays > itinerary.days.length && (
        <p className={styles.meta}>
          {t('planner.result.previewLimit', {
            shown: itinerary.days.length,
            total: itinerary.durationDays,
          })}
        </p>
      )}
    </section>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  const legCosts = day.stops
    .map((stop) => stop.legFromPrevious?.estimatedCost)
    .filter((cost): cost is Money => cost !== undefined);

  return (
    <article className={cx(card.card, styles.day)}>
      <h3 className={styles.dayTitle}>{t('planner.result.day', { number: day.dayNumber })}</h3>

      <ol className={styles.stops}>
        {day.stops.map((stop) => (
          <li key={stop.id} className={styles.stopItem}>
            {stop.legFromPrevious && <LegInfo leg={stop.legFromPrevious} />}
            <span className={styles.stop}>{stop.name ?? t(`planner.stops.${stop.kind}`)}</span>
          </li>
        ))}
      </ol>

      {legCosts.length > 0 && (
        <p className={styles.dayCost}>
          {t('planner.result.dayTransportCost', {
            amount: formatMoney(sumMoney(legCosts), intlLocale),
          })}
        </p>
      )}
    </article>
  );
}

function LegInfo({ leg }: { leg: TransportLeg }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  return (
    <span className={styles.leg}>
      <span aria-hidden="true">{VEHICLE_ICONS[leg.vehicle]}</span>
      {t(`transportation.vehicle.${leg.vehicle}`)} ·{' '}
      {t('common.minutes', { count: leg.durationMinutes })}
      {leg.estimatedCost && ` · ≈ ${formatMoney(leg.estimatedCost, intlLocale)}`}
    </span>
  );
}
