import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import styles from './ActiveFilterChips.module.css';

export interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onClearAll?: () => void;
}

export function ActiveFilterChips({ chips, onClearAll }: ActiveFilterChipsProps) {
  const { t } = useTranslation();
  if (chips.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {chips.map((chip) => (
          <li key={chip.id}>
            <span className={styles.chip}>
              {chip.label}
              <button
                type="button"
                className={styles.remove}
                aria-label={t('filters.remove', { label: chip.label })}
                onClick={chip.onRemove}
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>
      {onClearAll && (
        <Button type="button" variant="ghost" onClick={onClearAll}>
          {t('filters.clearAll')}
        </Button>
      )}
    </div>
  );
}
