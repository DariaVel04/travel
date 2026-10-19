import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { Notice } from '@/components/ui/Notice';
import { useLocale } from '@/hooks/useLocale';
import type { Money } from '@/types/common';
import { cx } from '@/utils/classNames';
import { formatISODate } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { travellerCount } from '../plannerDates';
import { TRIP_COST_KEYS, type DayPlan, type TripPlan } from '../tripPlan';
import styles from './TripPlanResult.module.css';

interface TripPlanResultProps {
  plan: TripPlan;
  isGenerating: boolean;
  onBack: () => void;
}

const STEP_ICONS: Record<TripPlan['transport'][number]['type'], string> = {
  flight: '✈️',
  train: '🚆',
  bus: '🚌',
  ferry: '⛴️',
  public_transport: '🚇',
  taxi: '🚕',
  rental_car: '🚗',
  walk: '🚶',
};

const MEAL_ICONS = { breakfast: '🥐', lunch: '🍜', dinner: '🍽️' } as const;

export function TripPlanResult({ plan, isGenerating, onBack }: TripPlanResultProps) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const people = travellerCount(plan.travelers);
  const destination = plan.destination.name;

  return (
    <section className={styles.result} aria-labelledby="trip-plan-title">
      <h2 id="trip-plan-title" className={styles.title}>
        {t('planner.plan.title')}
      </h2>
      <Notice>{t('planner.plan.demoNotice')}</Notice>

      <div className={cx(card.card, styles.overview)}>
        <h3 className={styles.tripTitle}>{t('planner.result.tripTo', { destination })}</h3>
        <p className={styles.meta}>
          {formatISODate(plan.startDate, intlLocale)} – {formatISODate(plan.endDate, intlLocale)}
        </p>
        <p className={styles.meta}>
          {t('common.travellers', { count: people })} · {t('common.days', { count: plan.days.length })}
        </p>
        <p className={styles.summary}>
          {tx(t, plan.summaryKey, { destination, count: people, days: plan.days.length })}
        </p>
      </div>

      <ol className={styles.days}>
        {plan.days.map((day) => (
          <li key={`${day.dayNumber}-${day.date}`}>
            <DayPlanCard day={day} />
          </li>
        ))}
      </ol>

      <CostBreakdown plan={plan} />
      <BudgetComparison plan={plan} />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" size="lg" onClick={onBack} disabled={isGenerating}>
          {t('planner.options.backToTrip')}
        </Button>
      </div>
    </section>
  );
}

function tx(
  t: TFunction,
  key: string,
  options?: Record<string, string | number>,
): string {
  return t(key as 'planner.plan.summary', options);
}

function DayPlanCard({ day }: { day: DayPlan }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const slots = (['morning', 'afternoon', 'evening'] as const).filter((slot) =>
    day.activities.some((activity) => activity.slot === slot),
  );

  return (
    <article className={cx(card.card, styles.day)}>
      <header className={styles.dayHeader}>
        <h3 className={styles.dayTitle}>
          {t('planner.result.day', { number: day.dayNumber })} — {tx(t, day.titleKey)}
        </h3>
        <p className={styles.meta}>{formatISODate(day.date, intlLocale)}</p>
      </header>

      {slots.map((slot) => (
        <div key={slot} className={styles.block}>
          <h4 className={styles.blockTitle}>{t(`planner.plan.slots.${slot}`)}</h4>
          <ul className={styles.list}>
            {day.activities
              .filter((activity) => activity.slot === slot)
              .map((activity) => (
                <li key={activity.id}>
                    <span>📍 {tx(t, activity.titleKey)}</span>
                  {activity.estimatedCost && (
                    <span className={styles.itemCost}>
                      {formatMoney(activity.estimatedCost, intlLocale)}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}

      {day.activities.some((activity) => !activity.slot) && (
        <div className={styles.block}>
          <ul className={styles.list}>
            {day.activities
              .filter((activity) => !activity.slot)
              .map((activity) => (
                <li key={activity.id}>📍 {tx(t, activity.titleKey)}</li>
              ))}
          </ul>
        </div>
      )}

      {day.meals.length > 0 && (
        <div className={styles.block}>
          <h4 className={styles.blockTitle}>{t('planner.plan.sections.meals')}</h4>
          <ul className={styles.list}>
            {day.meals.map((meal) => (
              <li key={meal.id}>
                <span>
                  {MEAL_ICONS[meal.slot]} {tx(t, meal.titleKey)}
                </span>
                {meal.estimatedCost && (
                  <span className={styles.itemCost}>{formatMoney(meal.estimatedCost, intlLocale)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {day.transportation.length > 0 && (
        <div className={styles.block}>
          <h4 className={styles.blockTitle}>{t('planner.plan.sections.transport')}</h4>
          <ul className={styles.list}>
            {day.transportation.map((step) => (
              <li key={step.id}>
                <span>
                  {STEP_ICONS[step.type]} {step.origin.name}
                  {step.origin.name !== step.destination.name && ` → ${step.destination.name}`}
                </span>
                {step.estimatedCost && (
                  <span className={styles.itemCost}>{formatMoney(step.estimatedCost, intlLocale)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {day.accommodation && (
        <div className={styles.block}>
          <h4 className={styles.blockTitle}>{t('planner.plan.sections.accommodation')}</h4>
          <p>
            🏨{' '}
            {day.accommodation.name ??
              tx(t, day.accommodation.nameKey ?? 'planner.plan.stayFallback', {
                place: day.accommodation.destination.name,
              })}
          </p>
        </div>
      )}

      <p className={styles.dayCost}>
        {t('planner.plan.sections.dailyCost')} {formatMoney(day.estimatedCost, intlLocale)}
      </p>
    </article>
  );
}

function CostBreakdown({ plan }: { plan: TripPlan }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  return (
    <section className={cx(card.card, styles.cost)} aria-labelledby="trip-cost-title">
      <h3 id="trip-cost-title" className={styles.costTitle}>
        {t('planner.plan.cost.title')}
      </h3>
      <Notice>{t('planner.plan.cost.demoNote')}</Notice>
      <dl className={styles.costList}>
        {TRIP_COST_KEYS.map((key) => (
          <div key={key} className={styles.costRow}>
            <dt>{t(`planner.plan.cost.${key}`)}</dt>
            <dd>{formatMoney(plan.cost[key], intlLocale)}</dd>
          </div>
        ))}
        <div className={cx(styles.costRow, styles.costTotal)}>
          <dt>{t('planner.plan.cost.total')}</dt>
          <dd>{formatMoney(plan.cost.total, intlLocale)}</dd>
        </div>
      </dl>
    </section>
  );
}

function BudgetComparison({ plan }: { plan: TripPlan }) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const budget = plan.budget;
  if (!budget || budget.currency !== plan.cost.currency) return null;

  const remainingMinor = budget.amountMinor - plan.cost.total.amountMinor;
  const remaining: Money = { amountMinor: Math.abs(remainingMinor), currency: budget.currency };
  const over = remainingMinor < 0;

  return (
    <section className={cx(card.card, styles.budget)} aria-labelledby="trip-budget-title">
      <h3 id="trip-budget-title" className={styles.costTitle}>
        {t('planner.plan.budget.title')}
      </h3>
      <dl className={styles.costList}>
        <div className={styles.costRow}>
          <dt>{t('planner.plan.budget.yourBudget')}</dt>
          <dd>{formatMoney(budget, intlLocale)}</dd>
        </div>
        <div className={styles.costRow}>
          <dt>{t('planner.plan.budget.estimated')}</dt>
          <dd>{formatMoney(plan.cost.total, intlLocale)}</dd>
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
