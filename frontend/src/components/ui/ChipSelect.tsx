import { cx } from '@/utils/classNames';
import styles from './ChipSelect.module.css';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipSelectProps<T extends string> {
  values: readonly T[];
  options: readonly ChipOption<T>[];
  onChange: (values: T[]) => void;
  compact?: boolean;
}

/** Multiple choice shown as toggleable chips, built on native checkboxes. */
export function ChipSelect<T extends string>({
  values,
  options,
  onChange,
  compact = false,
}: ChipSelectProps<T>) {
  function toggle(value: T) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }

  return (
    <div className={cx(styles.chips, compact && styles.compact)}>
      {options.map((option) => (
        <label key={option.value} className={styles.chip}>
          <input
            type="checkbox"
            className="visually-hidden"
            checked={values.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
          <span className={styles.chipLabel}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
