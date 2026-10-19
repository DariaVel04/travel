import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { buildFlightsUrl, buildPlannerUrl } from '@/app/paths';
import { LocationSelector } from '@/components/LocationSelector/LocationSelector';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { TRIP_TYPES } from '@/features/planner/options';
import { PLANNER_LOCATION_TYPES } from '@/features/planner/plannerForm';
import type { TripType } from '@/features/planner/types';
import type { TravelLocation } from '@/types/location';
import { cx } from '@/utils/classNames';
import styles from './MainSearch.module.css';

type SearchTab = 'flights' | 'planner';

const TABS: SearchTab[] = ['flights', 'planner'];

/**
 * Quick search on the home page. It only collects the basics and hands them over
 * to the full Flights / Planner pages through URL query parameters.
 */
export function MainSearch() {
  const { t } = useTranslation();
  const id = useId();
  const [activeTab, setActiveTab] = useState<SearchTab>('flights');

  const tabLabels: Record<SearchTab, string> = {
    flights: t('home.search.flightsTab'),
    planner: t('home.search.plannerTab'),
  };

  return (
    <div className={styles.search}>
      <div className={styles.tabs} role="tablist" aria-label={t('home.search.tabsLabel')}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`${id}-tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`${id}-panel-${tab}`}
            className={cx(styles.tab, activeTab === tab && styles.activeTab)}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel-${activeTab}`}
        aria-labelledby={`${id}-tab-${activeTab}`}
        className={styles.panel}
      >
        {activeTab === 'flights' ? <FlightsQuickSearch /> : <PlannerQuickSearch />}
      </div>
    </div>
  );
}

function FlightsQuickSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = useId();
  const [from, setFrom] = useState<TravelLocation[]>([]);
  const [to, setTo] = useState<TravelLocation[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate(
      buildFlightsUrl({
        from: from.map((location) => location.id),
        to: to.map((location) => location.id),
      }),
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field label={t('home.search.fromLabel')} htmlFor={`${id}-from`}>
        <LocationSelector
          id={`${id}-from`}
          value={from}
          placeholder={t('home.search.fromPlaceholder')}
          onChange={setFrom}
        />
      </Field>
      <Field label={t('home.search.toLabel')} htmlFor={`${id}-to`}>
        <LocationSelector
          id={`${id}-to`}
          value={to}
          placeholder={t('home.search.toPlaceholder')}
          onChange={setTo}
        />
      </Field>
      <Button type="submit" size="lg" className={styles.submit}>
        {t('home.search.searchFlights')}
      </Button>
    </form>
  );
}

function PlannerQuickSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = useId();
  const [from, setFrom] = useState<TravelLocation[]>([]);
  const [destination, setDestination] = useState<TravelLocation[]>([]);
  const [tripType, setTripType] = useState<TripType | ''>('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate(
      buildPlannerUrl({
        from: from.map((location) => location.id),
        destination: destination.map((location) => location.id),
        tripType: tripType || undefined,
      }),
    );
  }

  return (
    <form className={cx(styles.form, styles.plannerForm)} onSubmit={handleSubmit}>
      <Field label={t('planner.destination.originLabel')} htmlFor={`${id}-from`}>
        <LocationSelector
          id={`${id}-from`}
          value={from}
          placeholder={t('planner.destination.originPlaceholder')}
          allowedTypes={PLANNER_LOCATION_TYPES}
          onChange={setFrom}
        />
      </Field>
      <Field label={t('home.search.destinationLabel')} htmlFor={`${id}-destination`}>
        <LocationSelector
          id={`${id}-destination`}
          value={destination}
          placeholder={t('planner.destination.destinationPlaceholder')}
          allowedTypes={PLANNER_LOCATION_TYPES}
          onChange={setDestination}
        />
      </Field>
      <Field label={t('home.search.tripTypeLabel')} htmlFor={`${id}-trip-type`}>
        <select
          id={`${id}-trip-type`}
          value={tripType}
          onChange={(event) =>
            setTripType(TRIP_TYPES.find((type) => type === event.target.value) ?? '')
          }
        >
          <option value="">—</option>
          {TRIP_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`planner.tripTypes.options.${type}`)}
            </option>
          ))}
        </select>
      </Field>
      <Button type="submit" size="lg" className={styles.submit}>
        {t('home.search.startPlanning')}
      </Button>
    </form>
  );
}
