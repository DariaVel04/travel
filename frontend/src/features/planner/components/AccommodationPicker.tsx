import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { HotelCard } from '@/features/hotels/components/HotelCard';
import type { AccommodationSearchResult } from '@/features/hotels/types';
import styles from './TripOptions.module.css';

interface AccommodationPickerProps {
  stays: AccommodationSearchResult[];
  currentId: string;
  isLoading: boolean;
  onSelect: (stay: AccommodationSearchResult) => void;
  onBack: () => void;
}

export function AccommodationPicker({
  stays,
  currentId,
  isLoading,
  onSelect,
  onBack,
}: AccommodationPickerProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.wrap} aria-labelledby="stay-picker-title">
      <h2 id="stay-picker-title" className={styles.title}>
        {t('planner.options.changeStay')}
      </h2>
      <Notice>{t('planner.options.stayPickerNotice')}</Notice>
      {isLoading && <Notice>{t('planner.options.loadingStays')}</Notice>}
      <ul className={styles.compareList}>
        {stays.map((stay) => (
          <li key={stay.id}>
            <HotelCard stay={stay} />
            <Button
              type="button"
              onClick={() => onSelect(stay)}
              disabled={stay.id === currentId}
            >
              {stay.id === currentId ? t('planner.options.currentStay') : t('planner.options.chooseStay')}
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="secondary" onClick={onBack}>
        {t('planner.options.backToTrip')}
      </Button>
    </section>
  );
}
