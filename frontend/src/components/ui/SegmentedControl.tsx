import { cx } from '@/utils/classNames';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  /** Radio group name, must be unique on the page. */
  name: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  /** Needed when the control is not inside a FieldSet with a visible legend. */
  ariaLabel?: string;
  compact?: boolean;
}

/** Single choice from a few options, built on native radio buttons for accessibility. */
export function SegmentedControl<T extends string | number>({
  name,
  value,
  options,
  onChange,
  ariaLabel,
  compact = false,
}: SegmentedControlProps<T>) {
  return (
    <div className={cx(styles.group, compact && styles.compact)} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <label key={option.value} className={styles.segment}>
          <input
            type="radio"
            className="visually-hidden"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span className={styles.segmentLabel}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
