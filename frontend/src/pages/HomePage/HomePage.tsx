import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DestinationMosaic } from './DestinationMosaic';
import { FeaturesPreview } from './FeaturesPreview';
import { Hero } from './Hero';

export function HomePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('app.homeTitle'));

  return (
    <>
      <Hero />
      <FeaturesPreview />
      <DestinationMosaic />
    </>
  );
}
