import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { Badge } from '@/components/ui/Badge';
import card from '@/components/ui/Card.module.css';
import { useLocale } from '@/hooks/useLocale';
import { cx } from '@/utils/classNames';
import { formatMoney, money } from '@/utils/money';
import styles from './FeaturesPreview.module.css';

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  example?: string;
  /** Features that already have a page link to it; others show "Coming soon". */
  to?: string;
}

export function FeaturesPreview() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const format = (amount: number) => formatMoney(money(amount), intlLocale);

  const features: FeatureItem[] = [
    {
      id: 'smartFlights',
      icon: '✈️',
      title: t('home.features.smartFlights.title'),
      description: t('home.features.smartFlights.description'),
      to: paths.flights,
    },
    {
      id: 'vacationPlanner',
      icon: '🧭',
      title: t('home.features.vacationPlanner.title'),
      description: t('home.features.vacationPlanner.description'),
      to: paths.planner,
    },
    {
      id: 'totalCost',
      icon: '🧾',
      title: t('home.features.totalCost.title'),
      description: t('home.features.totalCost.description'),
      example: t('home.features.totalCost.example', {
        flights: format(820),
        stay: format(700),
        transport: format(180),
      }),
    },
    {
      id: 'climate',
      icon: '🌦️',
      title: t('home.features.climate.title'),
      description: t('home.features.climate.description'),
    },
    {
      id: 'pricePrediction',
      icon: '📉',
      title: t('home.features.pricePrediction.title'),
      description: t('home.features.pricePrediction.description'),
      example: t('home.features.pricePrediction.example', {
        current: format(420),
        average: format(510),
      }),
    },
    {
      id: 'tourDeals',
      icon: '🏝️',
      title: t('home.features.tourDeals.title'),
      description: t('home.features.tourDeals.description'),
      example: t('home.features.tourDeals.example', { amount: format(160) }),
    },
  ];

  return (
    <section className={cx('container', styles.section)} aria-labelledby="features-title">
      <div className={styles.header}>
        <h2 id="features-title" className={styles.title}>
          {t('home.features.title')}
        </h2>
        <p className={styles.subtitle}>{t('home.features.subtitle')}</p>
      </div>

      <ul className={styles.grid}>
        {features.map((feature) => (
          <li key={feature.id} className={cx(card.card, styles.card)}>
            <span className={styles.icon} aria-hidden="true">
              {feature.icon}
            </span>
            <h3 className={styles.cardTitle}>
              {feature.to ? (
                <Link to={feature.to} className={styles.cardLink}>
                  {feature.title}
                </Link>
              ) : (
                feature.title
              )}
            </h3>
            <p className={styles.description}>{feature.description}</p>
            {feature.example && <p className={styles.example}>{feature.example}</p>}
            {!feature.to && (
              <div className={styles.footer}>
                <Badge>{t('common.comingSoon')}</Badge>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
