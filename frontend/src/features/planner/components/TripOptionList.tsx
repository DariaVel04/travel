import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { Notice } from '@/components/ui/Notice';
import { useLocale } from '@/hooks/useLocale';
import { cx } from '@/utils/classNames';
import { formatISODateLong } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import type { TripOptionDetails } from '../tripPlan';
import styles from './TripOptions.module.css';

interface TripOptionListProps {
  options: TripOptionDetails[];
  selectedIds: string[];
  isGenerating: boolean;
  onToggle: (id: string) => void;
  onView: (details: TripOptionDetails) => void;
  onCompare: () => void;
  onGenerateOther: () => void;
  onEdit: () => void;
}

const TRANSPORT_ICONS = {
  flight: '✈️',
  train: '🚆',
  bus: '🚌',
  ferry: '⛴️',
  public_transport: '🚇',
  taxi: '🚕',
  rental_car: '🚗',
  walk: '🚶',
} as const;

export function TripOptionList({
  options,
  selectedIds,
  isGenerating,
  onToggle,
  onView,
  onCompare,
  onGenerateOther,
  onEdit,
}: TripOptionListProps) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const selectedCount = selectedIds.length;

  return (
    <section className={styles.wrap} aria-labelledby="trip-options-title">
      <h2 id="trip-options-title" className={styles.title}>
        {t('planner.options.title')}
      </h2>
      <Notice>{t('planner.options.demoNotice')}</Notice>

      <ul className={styles.grid}>
        {options.map((details) => {
          const option = details.option;
          const checked = selectedIds.includes(option.id);
          return (
            <li key={option.id}>
              <article className={cx(card.card, styles.card, checked && styles.selectedCard)}>
                <div className={styles.media}>
                  <img src={option.imageUrl} alt={option.imageAlt} className={styles.image} />
                </div>
                <div className={styles.body}>
                  <h3 className={styles.destination}>
                    {option.destination.name}, {option.country}
                  </h3>
                  <p className={styles.dates}>
                    {formatISODateLong(option.startDate, intlLocale)}
                    <span aria-hidden="true"> → </span>
                    {formatISODateLong(option.endDate, intlLocale)}
                  </p>
                  <p className={styles.meta}>{t('hotels.form.nights', { count: option.nights })}</p>
                  <p className={styles.meta}>
                    {TRANSPORT_ICONS[option.transportSummary.type]}{' '}
                    {t('planner.options.flightFrom', { origin: option.transportSummary.originName })}
                  </p>
                  <p className={styles.meta}>
                    🏨 {option.accommodationSummary.name} ·{' '}
                    {t('planner.options.stars', { count: option.accommodationSummary.stars })}
                  </p>
                  <ul className={styles.tags}>
                    {option.tagKeys.map((key) => (
                      <li key={key}>{t(key as 'planner.options.tags.food')}</li>
                    ))}
                  </ul>
                  <p className={styles.price}>
                    <span>{t('planner.options.estimatedTotal')}</span>
                    <strong>{formatMoney(option.totalPrice, intlLocale)}</strong>
                  </p>
                  <label className={styles.select}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(option.id)}
                    />
                    {t('planner.options.selectToCompare')}
                  </label>
                  <Button type="button" onClick={() => onView(details)}>
                    {t('planner.options.viewTrip')}
                  </Button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className={styles.bar}>
        <p className={styles.meta}>
          {selectedCount > 0 ? t('planner.options.selectedCount', { count: selectedCount }) : t('planner.options.selectHint')}
        </p>
        <div className={styles.barActions}>
          <Button
            type="button"
            disabled={selectedCount < 2 || selectedCount > 5}
            onClick={onCompare}
          >
            {t('planner.options.compare')}
          </Button>
          <Button type="button" variant="secondary" onClick={onGenerateOther} disabled={isGenerating}>
            {isGenerating ? t('planner.options.finding') : t('planner.options.generateOther')}
          </Button>
          <Button type="button" variant="ghost" onClick={onEdit}>
            {t('planner.plan.edit')}
          </Button>
        </div>
      </div>
    </section>
  );
}
