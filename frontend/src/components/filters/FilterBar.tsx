import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './FilterBar.module.css';

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.bar, className)}>{children}</div>;
}

export function FilterRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
