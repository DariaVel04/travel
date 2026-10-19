import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './Field.module.css';

interface FieldProps {
  label: string;
  /** id of the input inside, so clicking the label focuses it. */
  htmlFor: string;
  hint?: string;
  size?: 'default' | 'compact';
  className?: string;
  children: ReactNode;
}

/** Label + single input + optional hint. */
export function Field({
  label,
  htmlFor,
  hint,
  size = 'default',
  className,
  children,
}: FieldProps) {
  return (
    <div className={cx(styles.field, size === 'compact' && styles.compact, className)}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

interface FieldSetProps {
  legend: string;
  hint?: string;
  size?: 'default' | 'compact';
  className?: string;
  children: ReactNode;
}

/** Groups several related controls (radio buttons, checkboxes) under one caption. */
export function FieldSet({
  legend,
  hint,
  size = 'default',
  className,
  children,
}: FieldSetProps) {
  return (
    <fieldset className={cx(styles.field, size === 'compact' && styles.compact, className)}>
      <legend className={styles.label}>{legend}</legend>
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
    </fieldset>
  );
}
