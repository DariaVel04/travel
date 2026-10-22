import { useTranslation } from 'react-i18next';
import { cx } from '@/utils/classNames';
import styles from './Hero.module.css';
import { MainSearch } from './MainSearch';

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=2000&auto=format&fit=crop&q=75';

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.scene} aria-hidden="true">
        <img className={styles.photo} src={HERO_PHOTO} alt="" />
        <svg className={styles.route} viewBox="0 0 640 360" fill="none">
          <path
            className={styles.routePath}
            d="M40 250 C 160 230, 180 120, 300 140 S 470 210, 600 70"
          />
          <circle className={styles.marker} cx="40" cy="250" r="5" />
          <circle className={styles.marker} cx="300" cy="140" r="5" />
          <circle className={styles.markerEnd} cx="600" cy="70" r="7" />
        </svg>
        <span className={styles.floatPlane}>✈</span>
      </div>

      <div className={cx('container', styles.inner)}>
        <div className={styles.copy}>
          <span className={styles.badge}>{t('home.hero.badge')}</span>
          <h1 className={styles.title}>
            {t('home.hero.title')}
            <span className={styles.script}>{t('home.hero.script')}</span>
          </h1>
          <p className={styles.subtitle}>{t('home.hero.subtitle')}</p>
        </div>
        <MainSearch />
      </div>
    </section>
  );
}
