import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { Notice } from '@/components/ui/Notice';
import { useLocale } from '@/hooks/useLocale';
import type { Money } from '@/types/common';
import { cx } from '@/utils/classNames';
import { formatISODateLong, formatTime, splitMinutes } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { travellerCount } from '../plannerDates';
import { TRIP_COST_KEYS, type TransportationStep, type TripOptionDetails } from '../tripPlan';
import styles from './TripPlanResult.module.css';

interface TripOverviewProps {
  details: TripOptionDetails;
  isLoading: boolean;
  onChangeStay: () => void;
  onShowItinerary: () => void;
  onBack: () => void;
}

export function TripOverview({
  details,
  isLoading,
  onChangeStay,
  onShowItinerary,
  onBack,
}: TripOverviewProps) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const option = details.option;
  const people = travellerCount(option.travelers);
  const stay = details.stay;
  const outbound = details.transport.filter((step) => step.destination.id === option.destination.id);
  const inbound = details.transport.filter((step) => step.origin.id === option.destination.id);
  const legs = outbound.length + inbound.length > 0 ? { outbound, inbound } : { outbound: details.transport, inbound: [] };

  return (
    <section className={styles.result} aria-labelledby="trip-overview-title">
      <h2 id="trip-overview-title" className={styles.title}>
        {option.destination.name}, {option.country}
      </h2>
      <p className={styles.meta}>
        {formatISODateLong(option.startDate, intlLocale)} – {formatISODateLong(option.endDate, intlLocale)}
      </p>
      <p className={styles.meta}>
        {t('hotels.form.nights', { count: option.nights })} · {t('common.travellers', { count: people })}
      </p>
      <Notice>{t('planner.plan.demoNotice')}</Notice>

      <div className={cx(card.card, styles.overview)}>
        <h3 className={styles.costTitle}>{t('planner.options.estimatedTotal')}</h3>
        <p className={styles.tripTitle}>{formatMoney(details.cost.total, intlLocale)}</p>
      </div>

      <section className={cx(card.card, styles.overview)}>
        <h3 className={styles.costTitle}>{t('planner.plan.sections.transport')}</h3>
        <LegBlock title={t('planner.options.outbound')} steps={legs.outbound} />
        {legs.inbound.length > 0 && (
          <LegBlock title={t('planner.options.return')} steps={legs.inbound} />
        )}
      </section>

      <section className={cx(card.card, styles.overview)}>
        <h3 className={styles.costTitle}>{t('planner.plan.sections.accommodation')}</h3>
        <p className={styles.tripTitle}>{stay.name}</p>
        <p className={styles.meta}>
          {t('planner.options.stars', { count: Math.max(3, Math.min(5, Math.round(stay.rating))) })} ·{' '}
          {stay.destination.name}
        </p>
        <p className={styles.meta}>
          {t('hotels.form.nights', { count: stay.nights })} · {formatMoney(stay.totalPrice, intlLocale)}
        </p>
        <ul className={styles.summary}>
          {stay.breakfastIncluded && <li>{t('planner.stays.breakfastIncluded')}</li>}
          {stay.freeCancellation && <li>{t('planner.stays.freeCancellation')}</li>}
          {stay.amenities.slice(0, 4).map((amenity) => (
            <li key={amenity}>{t(`hotels.amenities.${amenity}`)}</li>
          ))}
        </ul>
        <Button type="button" variant="secondary" onClick={onChangeStay} disabled={isLoading}>
          {t('planner.options.changeStay')}
        </Button>
      </section>

      <CostBlock cost={details.cost} />
      <BudgetBlock budget={details.budget} total={details.cost.total} />

      <div className={styles.actions}>
        <Button type="button" size="lg" onClick={onShowItinerary} disabled={isLoading}>
          {isLoading ? t('planner.plan.creating') : t('planner.options.showByDay')}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>
          {t('planner.options.backToOptions')}
        </Button>
      </div>
    </section>
  );
}

function LegBlock({ title, steps }: { title: string; steps: TransportationStep[] }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  if (steps.length === 0) return null;

  return (
    <div>
      <h4 className={styles.dayTitle}>{title}</h4>
      {steps.map((step) => {
        const duration = splitMinutes(step.durationMinutes);
        return (
          <div key={step.id} className={styles.summary}>
            <p>
              {step.origin.name} → {step.destination.name}
            </p>
            {step.departure && (
              <p className={styles.meta}>{formatISODateLong(step.departure.slice(0, 10), intlLocale)}</p>
            )}
            {step.departure && step.arrival && (
              <p className={styles.meta}>
                {t('planner.options.departureTime')} {formatTime(step.departure, intlLocale)} ·{' '}
                {t('planner.options.arrivalTime')} {formatTime(step.arrival, intlLocale)}
              </p>
            )}
            <p className={styles.meta}>
              {t('planner.options.direct')} · {t('common.duration', duration)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CostBlock({ cost }: { cost: TripOptionDetails['cost'] }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  return (
    <section className={cx(card.card, styles.cost)}>
      <h3 className={styles.costTitle}>{t('planner.plan.cost.title')}</h3>
      <dl className={styles.costList}>
        {TRIP_COST_KEYS.map((key) => (
          <div key={key} className={styles.costRow}>
            <dt>{t(`planner.plan.cost.${key}`)}</dt>
            <dd>{formatMoney(cost[key], intlLocale)}</dd>
          </div>
        ))}
        <div className={cx(styles.costRow, styles.costTotal)}>
          <dt>{t('planner.plan.cost.total')}</dt>
          <dd>{formatMoney(cost.total, intlLocale)}</dd>
        </div>
      </dl>
    </section>
  );
}

function BudgetBlock({ budget, total }: { budget?: Money; total: Money }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  if (!budget || budget.currency !== total.currency) return null;
  const remainingMinor = budget.amountMinor - total.amountMinor;
  const remaining: Money = { amountMinor: Math.abs(remainingMinor), currency: budget.currency };
  const over = remainingMinor < 0;

  return (
    <section className={cx(card.card, styles.budget)}>
      <h3 className={styles.costTitle}>{t('planner.plan.budget.title')}</h3>
      <dl className={styles.costList}>
        <div className={styles.costRow}>
          <dt>{t('planner.plan.budget.yourBudget')}</dt>
          <dd>{formatMoney(budget, intlLocale)}</dd>
        </div>
        <div className={styles.costRow}>
          <dt>{t('planner.plan.budget.estimated')}</dt>
          <dd>{formatMoney(total, intlLocale)}</dd>
        </div>
        {!over && (
          <div className={styles.costRow}>
            <dt>{t('planner.plan.budget.remaining')}</dt>
            <dd>{formatMoney(remaining, intlLocale)}</dd>
          </div>
        )}
      </dl>
      {over && (
        <Notice tone="warning">
          {t('planner.plan.budget.over', { amount: formatMoney(remaining, intlLocale) })}
        </Notice>
      )}
    </section>
  );
}
