import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { useLocale } from '@/hooks/useLocale';
import { cx } from '@/utils/classNames';
import { formatISODate } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import type { TripOptionDetails } from '../tripPlan';
import styles from './TripOptions.module.css';

interface TripComparisonProps {
  options: TripOptionDetails[];
  onView: (details: TripOptionDetails) => void;
  onBack: () => void;
}

export function TripComparison({ options, onView, onBack }: TripComparisonProps) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();

  return (
    <section className={styles.wrap} aria-labelledby="trip-compare-title">
      <h2 id="trip-compare-title" className={styles.title}>
        {t('planner.options.compareTitle')}
      </h2>
      <ul className={styles.compareList}>
        {options.map((details) => {
          const option = details.option;
          return (
            <li key={option.id} className={cx(card.card, styles.compareCard)}>
              <h3>
                {option.destination.name}, {option.country}
              </h3>
              <dl className={styles.compareDl}>
                <div>
                  <dt>{t('planner.options.dates')}</dt>
                  <dd>
                    {formatISODate(option.startDate, intlLocale)} –{' '}
                    {formatISODate(option.endDate, intlLocale)}
                  </dd>
                </div>
                <div>
                  <dt>{t('planner.options.duration')}</dt>
                  <dd>{t('hotels.form.nights', { count: option.nights })}</dd>
                </div>
                <div>
                  <dt>{t('planner.plan.sections.transport')}</dt>
                  <dd>{t(`planner.options.modes.${option.transportSummary.type}`)}</dd>
                </div>
                <div>
                  <dt>{t('planner.plan.sections.accommodation')}</dt>
                  <dd>
                    {option.accommodationSummary.name} ·{' '}
                    {t('planner.options.stars', { count: option.accommodationSummary.stars })}
                  </dd>
                </div>
                <div>
                  <dt>{t('planner.options.estimatedTotal')}</dt>
                  <dd>{formatMoney(option.totalPrice, intlLocale)}</dd>
                </div>
                <div>
                  <dt>{t('planner.options.highlightsLabel')}</dt>
                  <dd>{option.highlightKeys.map((key) => t(key as 'planner.options.highlights.food')).join(', ')}</dd>
                </div>
              </dl>
              <Button type="button" onClick={() => onView(details)}>
                {t('planner.options.viewTrip')}
              </Button>
            </li>
          );
        })}
      </ul>
      <Button type="button" variant="secondary" onClick={onBack}>
        {t('planner.options.backToOptions')}
      </Button>
    </section>
  );
}
