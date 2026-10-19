import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/paths';
import styles from './Logo.module.css';

export function Logo() {
  const { t } = useTranslation();

  return (
    <Link to={paths.home} className={styles.logo}>
      <span className={styles.mark} aria-hidden="true">
        ✈
      </span>
      <span className={styles.name}>{t('app.name')}</span>
    </Link>
  );
}
