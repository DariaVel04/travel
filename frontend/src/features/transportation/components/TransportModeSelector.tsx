import { useTranslation } from 'react-i18next';
import { cx } from '@/utils/classNames';
import { TRANSPORT_MODE_ICONS, TRANSPORT_MODES } from '../options';
import type { TransportMode } from '../types';
import styles from './TransportModeSelector.module.css';

/** What the platform will show for each mode once transport data is connected. */
const MODE_DETAILS = {
  public_transport: [
    'transportation.modes.public_transport.details.passes',
    'transportation.modes.public_transport.details.official',
    'transportation.modes.public_transport.details.payment',
    'transportation.modes.public_transport.details.validity',
    'transportation.modes.public_transport.details.link',
  ],
  taxi: [
    'transportation.modes.taxi.details.availability',
    'transportation.modes.taxi.details.price',
    'transportation.modes.taxi.details.rating',
    'transportation.modes.taxi.details.link',
  ],
  rental_car: [
    'transportation.modes.rental_car.details.companies',
    'transportation.modes.rental_car.details.deposit',
    'transportation.modes.rental_car.details.carType',
    'transportation.modes.rental_car.details.oneWay',
    'transportation.modes.rental_car.details.runningCosts',
  ],
} as const satisfies Record<TransportMode, readonly string[]>;

interface TransportModeSelectorProps {
  name: string;
  value: TransportMode | null;
  onChange: (mode: TransportMode) => void;
  compact?: boolean;
}

export function TransportModeSelector({
  name,
  value,
  onChange,
  compact = false,
}: TransportModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <fieldset className={cx(styles.fieldset, compact && styles.compact)}>
      <legend className={styles.question}>{t('transportation.question')}</legend>
      <p className={styles.hint}>{t('transportation.hint')}</p>

      <div className={styles.options}>
        {TRANSPORT_MODES.map((mode) => (
          <label key={mode} className={cx(styles.option, value === mode && styles.selected)}>
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={mode}
              checked={value === mode}
              onChange={() => onChange(mode)}
            />
            <span className={styles.icon} aria-hidden="true">
              {TRANSPORT_MODE_ICONS[mode]}
            </span>
            <span className={styles.title}>{t(`transportation.modes.${mode}.title`)}</span>
            <span className={styles.description}>
              {t(`transportation.modes.${mode}.description`)}
            </span>
          </label>
        ))}
      </div>

      {value && (
        <div className={styles.details} aria-live="polite">
          <p className={styles.detailsTitle}>{t('transportation.willShow')}</p>
          <ul className={styles.detailsList}>
            {MODE_DETAILS[value].map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      )}
    </fieldset>
  );
}
