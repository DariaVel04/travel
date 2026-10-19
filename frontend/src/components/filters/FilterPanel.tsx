import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './FilterPanel.module.css';

interface FilterToggleProps {
  open: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
  activeCount?: number;
}

export function FilterToggle({
  open,
  onToggle,
  showLabel,
  hideLabel,
  activeCount = 0,
}: FilterToggleProps) {
  return (
    <Button type="button" variant="secondary" onClick={onToggle} aria-expanded={open}>
      {open ? hideLabel : showLabel}
      {activeCount > 0 && <span className={styles.count}>{activeCount}</span>}
    </Button>
  );
}

export function FilterMore({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return <div className={styles.more}>{children}</div>;
}
