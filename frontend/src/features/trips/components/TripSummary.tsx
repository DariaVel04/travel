import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { placeLabel } from '@/features/flights/journey';
import { useCurrentTrip } from '@/features/trips/tripContext';
import { isTripStarted, travelerCount, tripItemCount } from '@/features/trips/tripModel';
import { useLocale } from '@/hooks/useLocale';
import { cx } from '@/utils/classNames';
import { formatISODate } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import styles from './TripSummary.module.css';

export function TripSummary() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const {
    trip,
    isOpen,
    statusMessage,
    toggleSummary,
    closeSummary,
    removeTransport,
    removeAccommodation,
    clearTrip,
  } = useCurrentTrip();

  const itemCount = tripItemCount(trip);
  const started = isTripStarted(trip);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeSummary();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeSummary, isOpen]);

  const statusText =
    statusMessage === 'added'
      ? t('trip.added')
      : statusMessage === 'removed'
        ? t('trip.removed')
        : statusMessage === 'cleared'
          ? t('trip.cleared')
          : '';

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls="trip-summary-panel"
        aria-label={t('trip.open')}
        onClick={toggleSummary}
      >
        <span>{t('trip.title')}</span>
        {itemCount > 0 && (
          <span className={styles.badge} aria-label={t('trip.items', { count: itemCount })}>
            {itemCount}
          </span>
        )}
      </button>

      <p className="visually-hidden" role="status" aria-live="polite">
        {statusText}
      </p>

      {isOpen &&
        createPortal(
          <div className={styles.overlay}>
            <button
              type="button"
              className={styles.backdrop}
              tabIndex={-1}
              aria-label={t('trip.close')}
              onClick={closeSummary}
            />
            <aside
              id="trip-summary-panel"
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="trip-summary-title"
            >
              <div className={styles.panelHeader}>
                <h2 id="trip-summary-title" className={styles.panelTitle}>
                  {t('trip.title')}
                </h2>
                <Button type="button" variant="ghost" onClick={closeSummary}>
                  {t('trip.closeAction')}
                </Button>
              </div>

              {!started || !trip ? (
                <p className={styles.empty}>{t('trip.empty')}</p>
              ) : (
                <div className={styles.body}>
                  {trip.warnings.map((warning) => (
                    <p key={warning.code} className={styles.warning} role="status">
                      {warning.code === 'destination_mismatch'
                        ? t('trip.warningDestination')
                        : t('trip.warningDates')}
                    </p>
                  ))}

                  <section className={styles.block}>
                    <h3 className={styles.label}>{t('trip.destination')}</h3>
                    <p className={styles.value}>
                      {trip.destination ? placeLabel(trip.destination) : t('trip.destinationUnset')}
                    </p>
                  </section>

                  <section className={styles.block}>
                    <h3 className={styles.label}>{t('trip.dates')}</h3>
                    <p className={styles.value}>
                      {trip.startDate && trip.endDate
                        ? t('trip.datesRange', {
                            from: formatISODate(trip.startDate, intlLocale),
                            to: formatISODate(trip.endDate, intlLocale),
                          })
                        : t('trip.datesUnset')}
                    </p>
                  </section>

                  <section className={styles.block}>
                    <h3 className={styles.label}>{t('trip.travelers')}</h3>
                    <p className={styles.value}>
                      {t('common.travellers', { count: travelerCount(trip.travelers) })}
                    </p>
                  </section>

                  <section className={styles.block}>
                    <div className={styles.blockHeader}>
                      <h3 className={styles.label}>{t('trip.transport')}</h3>
                    </div>
                    {trip.transport.length === 0 ? (
                      <p className={styles.muted}>{t('trip.transportEmpty')}</p>
                    ) : (
                      <ul className={styles.list}>
                        {trip.transport.map((offer) => (
                          <li key={offer.id} className={styles.item}>
                            <div className={styles.itemMain}>
                              {offer.journeys.map((journey) => {
                                const first = journey.segments[0];
                                const last = journey.segments[journey.segments.length - 1];
                                if (!first || !last) return null;
                                return (
                                  <p key={journey.id} className={styles.route}>
                                    {placeLabel(first.origin)} → {placeLabel(last.destination)}
                                  </p>
                                );
                              })}
                              <p className={styles.itemPrice}>
                                <span>{t('trip.itemPrice')}</span>
                                <strong>{formatMoney(offer.price.total, intlLocale)}</strong>
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeTransport(offer.id)}
                            >
                              {t('trip.removeTransport')}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className={styles.block}>
                    <h3 className={styles.label}>{t('trip.accommodation')}</h3>
                    {!trip.accommodation ? (
                      <p className={styles.muted}>{t('trip.accommodationEmpty')}</p>
                    ) : (
                      <div className={styles.item}>
                        <div className={styles.itemMain}>
                          <p className={styles.route}>{trip.accommodation.name}</p>
                          <p className={styles.itemPrice}>
                            <span>{t('trip.itemPrice')}</span>
                            <strong>
                              {formatMoney(trip.accommodation.totalPrice, intlLocale)}
                            </strong>
                          </p>
                        </div>
                        <Button type="button" variant="ghost" onClick={removeAccommodation}>
                          {t('trip.removeAccommodation')}
                        </Button>
                      </div>
                    )}
                  </section>

                  <section className={cx(styles.block, styles.total)}>
                    <h3 className={styles.label}>{t('trip.estimatedTotal')}</h3>
                    <p className={styles.totalValue}>
                      {formatMoney(trip.estimatedTotal, intlLocale)}
                    </p>
                  </section>

                  <Button type="button" variant="secondary" fullWidth onClick={clearTrip}>
                    {t('trip.clear')}
                  </Button>
                </div>
              )}
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
