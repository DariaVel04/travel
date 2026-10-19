import { useTranslation } from 'react-i18next';
import { Notice } from '@/components/ui/Notice';
import type { TripTravelers } from '@/features/trips/types';
import type { JourneyOffer } from '../types';
import { FlightOfferCard } from './FlightOfferCard';
import styles from './FlightResults.module.css';

export type SearchStatus = 'idle' | 'loading' | 'done';

interface FlightResultsProps {
  status: SearchStatus;
  offers: JourneyOffer[];
  travelers?: TripTravelers;
}

export function FlightResults({ status, offers, travelers }: FlightResultsProps) {
  const { t } = useTranslation();

  return (
    <section
      className={styles.results}
      aria-labelledby="flight-results-title"
      aria-busy={status === 'loading'}
    >
      <div className={styles.header}>
        <h2 id="flight-results-title" className={styles.title}>
          {t('flights.results.title')}
        </h2>
        {status === 'done' && (
          <p className={styles.count}>{t('flights.results.count', { count: offers.length })}</p>
        )}
      </div>

      {status === 'idle' && <p className={styles.placeholder}>{t('flights.results.idle')}</p>}

      {status === 'loading' && (
        <div className={styles.skeletons} aria-hidden="true">
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      )}

      {status === 'done' && (
        <>
          <Notice>
            {t('flights.results.demoNotice')} {t('flights.results.notCheapestOnly')}
          </Notice>
          {offers.length === 0 ? (
            <p className={styles.placeholder}>{t('flights.results.empty')}</p>
          ) : (
            <ul className={styles.list}>
              {offers.map((offer) => (
                <li key={offer.id}>
                  <FlightOfferCard offer={offer} travelers={travelers} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
