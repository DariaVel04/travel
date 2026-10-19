import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface TripAddButtonProps {
  added: boolean;
  onAdd: () => void;
}

export function TripAddButton({ added, onAdd }: TripAddButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="button" variant="secondary" fullWidth disabled={added} onClick={onAdd}>
      {added ? t('trip.added') : t('trip.add')}
    </Button>
  );
}
