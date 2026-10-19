import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './Notice.module.css';

/** Small info banner, e.g. "These are demo results". */
export function Notice({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'warning';
}) {
  return (
    <p className={cx(styles.notice, tone === 'warning' && styles.warning)} role="note">
      {children}
    </p>
  );
}
