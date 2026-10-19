import { useTranslation } from 'react-i18next';
import { cx } from '@/utils/classNames';
import styles from './Hero.module.css';
import { MainSearch } from './MainSearch';

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={cx('container', styles.inner)}>
        <div className={styles.text}>
          <span className={styles.badge}>{t('home.hero.badge')}</span>
          <h1 className={styles.title}>{t('home.hero.title')}</h1>
          <p className={styles.subtitle}>{t('home.hero.subtitle')}</p>
        </div>
        <MainSearch />
      </div>
    </section>
  );
}
