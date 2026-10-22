import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buildPlannerUrl } from '@/app/paths';
import { TRIP_DESTINATION_TEMPLATES } from '@/services/planner/tripOptionCatalog';
import { cx } from '@/utils/classNames';
import styles from './DestinationMosaic.module.css';

const FEATURED = ['city-TYO', 'city-LIS', 'city-ROM', 'city-ATH', 'city-BKK'];

export function DestinationMosaic() {
  const { t } = useTranslation();
  const places = FEATURED.flatMap((id) => {
    const item = TRIP_DESTINATION_TEMPLATES.find((entry) => entry.destination.id === id);
    if (!item?.destination.id) return [];
    return [{ id: item.destination.id, name: item.destination.name, country: item.country, imageUrl: item.imageUrl }];
  });

  return (
    <section className={cx('container', styles.section)} aria-labelledby="places-title">
      <div className={styles.heading}>
        <h2 id="places-title" className={styles.title}>
          {t('home.features.placesTitle')}
        </h2>
        <p className={styles.note}>{t('home.features.placesNote')}</p>
        <p className={styles.script} aria-hidden="true">
          {t('home.features.placesScript')}
        </p>
      </div>
      <ul className={styles.mosaic}>
        {places.map((place, index) => (
          <motion.li
            key={place.id}
            className={index === 0 ? styles.lead : undefined}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <Link
              className={styles.tile}
              to={buildPlannerUrl({ destination: [place.id] })}
            >
              <img src={place.imageUrl} alt="" />
              <span className={styles.caption}>
                <strong>{place.name}</strong>
                <span>{place.country}</span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
