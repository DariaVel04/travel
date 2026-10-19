import { useTranslation } from 'react-i18next';
import { paths } from '@/app/paths';
import { ButtonLink } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cx } from '@/utils/classNames';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('notFound.title'));

  return (
    <div className={cx('container', styles.page)}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>{t('notFound.title')}</h1>
      <p className={styles.description}>{t('notFound.description')}</p>
      <ButtonLink to={paths.home} size="lg">
        {t('notFound.backHome')}
      </ButtonLink>
    </div>
  );
}
