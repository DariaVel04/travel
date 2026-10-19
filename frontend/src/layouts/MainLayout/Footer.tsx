import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { Logo } from '@/components/Logo/Logo';
import { cx } from '@/utils/classNames';
import styles from './Footer.module.css';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={cx('container', styles.grid)}>
        <div className={styles.about}>
          <Logo />
          <p className={styles.muted}>{t('footer.description')}</p>
        </div>

        <nav aria-labelledby="footer-product">
          <h2 id="footer-product" className={styles.heading}>
            {t('footer.productTitle')}
          </h2>
          <ul className={styles.links}>
            <li>
              <Link to={paths.home}>{t('nav.home')}</Link>
            </li>
            <li>
              <Link to={paths.flights}>{t('nav.flights')}</Link>
            </li>
            <li>
              <Link to={paths.hotels}>{t('nav.hotels')}</Link>
            </li>
            <li>
              <Link to={paths.planner}>{t('nav.planner')}</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={cx('container', styles.bottom)}>
        <p className={styles.disclosure}>{t('footer.affiliateDisclosure')}</p>
        <p className={styles.muted}>{t('footer.rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
