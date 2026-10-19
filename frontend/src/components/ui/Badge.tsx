import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  title?: string;
}

export function Badge({ tone = 'neutral', children, title }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone])} title={title}>
      {children}
    </span>
  );
}
