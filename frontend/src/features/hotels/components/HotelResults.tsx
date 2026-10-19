import { useTranslation } from 'react-i18next';
import { Notice } from '@/components/ui/Notice';
import type { TripTravelers } from '@/features/trips/types';
import type { ISODate } from '@/types/common';
import { ACCOMMODATION_SORTS } from '../options';
import type { HotelSearchFormValues } from '../searchForm';
import type { AccommodationSearchResult, AccommodationSearchStatus } from '../types';
import { HotelCard } from './HotelCard';
import styles from './HotelResults.module.css';

interface HotelResultsProps {
  status: AccommodationSearchStatus;
  offers: AccommodationSearchResult[];
  sort: HotelSearchFormValues['sort'];
  onSortChange: (sort: HotelSearchFormValues['sort']) => void;
  stayDates?: { startDate: ISODate; endDate: ISODate };
  travelers?: TripTravelers;
}

export function HotelResults({
  status,
  offers,
  sort,
  onSortChange,
  stayDates,
  travelers,
}: HotelResultsProps) {
  const { t } = useTranslation();

  return (
    <section
      className={styles.results}
      aria-labelledby="hotel-results-title"
      aria-busy={status === 'loading'}
    >
      <div className={styles.header}>
        <div>
          <h2 id="hotel-results-title" className={styles.title}>
            {t('hotels.results.title')}
          </h2>
          {status === 'done' && (
            <p className={styles.count}>{t('hotels.results.count', { count: offers.length })}</p>
          )}
        </div>
        {(status === 'done' || status === 'loading') && (
          <label className={styles.sort}>
            <span>{t('hotels.results.sortLabel')}</span>
            <select
              value={sort}
              onChange={(event) => {
                const selected = ACCOMMODATION_SORTS.find(
                  (option) => option === event.target.value,
                );
                if (selected) onSortChange(selected);
              }}
            >
              {ACCOMMODATION_SORTS.map((option) => (
                <option key={option} value={option}>
                  {t(`hotels.results.sort.${option}`)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {status === 'idle' && <p className={styles.placeholder}>{t('hotels.results.idle')}</p>}

      {status === 'loading' && (
        <div className={styles.skeletons} aria-hidden="true">
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      )}

      {status === 'error' && <Notice>{t('hotels.results.error')}</Notice>}

      {status === 'done' && (
        <>
          <Notice>
            {t('hotels.results.demoNotice')} {t('hotels.results.demoPrice')}
          </Notice>
          {offers.length === 0 ? (
            <p className={styles.placeholder}>{t('hotels.results.empty')}</p>
          ) : (
            <ul className={styles.list}>
              {offers.map((offer) => (
                <li key={offer.id}>
                  <HotelCard
                    stay={offer}
                    allowAddToTrip
                    stayDates={stayDates}
                    travelers={travelers}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
