import type { TFunction } from 'i18next';
import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationSelector } from '@/components/LocationSelector/LocationSelector';
import { Button } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Field, FieldSet } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useLocale } from '@/hooks/useLocale';
import { cx } from '@/utils/classNames';
import { formatYearMonth, getUpcomingMonths, todayISODate } from '@/utils/date';
import { clampInt } from '@/utils/number';
import {
  BAGGAGE_PREFERENCES,
  CABIN_CLASSES,
  CHEAPEST_WITHIN_MONTHS,
  DATE_MODES,
  DEPARTURE_TIME_WINDOWS,
  DURATION_PRESETS,
  FLEX_DAYS_OPTIONS,
  JOURNEY_PREFERENCES,
  JOURNEY_TRANSPORT_MODES,
  OFFER_SOURCE_TYPES,
  OVERNIGHT_PREFERENCES,
  STOPS_PREFERENCES,
  TRANSPORT_FILTERS,
  TRIP_KINDS,
} from '../options';
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips';
import { FilterBar, FilterRow } from '@/components/filters/FilterBar';
import { FilterMore, FilterToggle } from '@/components/filters/FilterPanel';
import {
  createSearchLeg,
  type FlightSearchFormValues,
  isFlightRelevant,
  isReturnTrip,
  legsForTripKind,
  MAX_JOURNEY_LEGS,
  needsDuration,
  passengerTotal,
  resetFlightPreferences,
  type SearchLegValues,
  toFlightSearchParams,
} from '../searchForm';
import type { FlightSearchParams, TripKind } from '../types';
import styles from './FlightSearchForm.module.css';

interface FlightSearchFormProps {
  initialValues: FlightSearchFormValues;
  isSearching: boolean;
  onSearch: (params: FlightSearchParams) => void;
}

const UPCOMING_MONTHS = getUpcomingMonths(12);
const MAX_PASSENGERS = 9;
const MAX_TRIP_DAYS = 90;

export function FlightSearchForm({ initialValues, isSearching, onSearch }: FlightSearchFormProps) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const id = useId();
  const [values, setValues] = useState(initialValues);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const today = todayISODate();

  function update<K extends keyof FlightSearchFormValues>(
    key: K,
    value: FlightSearchFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  function setTripKind(tripKind: TripKind) {
    setValues((previous) => ({
      ...previous,
      tripKind,
      legs: legsForTripKind(tripKind, previous.legs),
    }));
  }

  function updateLeg(index: number, patch: Partial<SearchLegValues>) {
    setValues((previous) => ({
      ...previous,
      legs: previous.legs.map((leg, legIndex) => (legIndex === index ? { ...leg, ...patch } : leg)),
    }));
  }

  function addLeg() {
    setValues((previous) => {
      if (previous.legs.length >= MAX_JOURNEY_LEGS) return previous;
      const last = previous.legs[previous.legs.length - 1];
      return {
        ...previous,
        legs: [...previous.legs, createSearchLeg(last?.destinations ?? [], [])],
      };
    });
  }

  function removeLeg(index: number) {
    setValues((previous) => {
      if (previous.legs.length <= 2) return previous;
      return { ...previous, legs: previous.legs.filter((_, legIndex) => legIndex !== index) };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(toFlightSearchParams(values));
  }

  const showCabin = isFlightRelevant(values);
  const showReturnDate = isReturnTrip(values.tripKind);
  const totalTravellers = passengerTotal(values);
  const mixedReady = values.transport !== 'mixed' || values.mixedModes.length >= 2;
  const legsReady = values.legs.every(
    (leg) => leg.origins.length > 0 && leg.destinations.length > 0,
  );
  const sourcesReady = !showCabin || values.sources.length > 0;
  const canSubmit =
    legsReady &&
    mixedReady &&
    sourcesReady &&
    (values.dateMode !== 'months' || values.months.length > 0);

  return (
    <form className={cx(card.card, styles.form)} onSubmit={handleSubmit}>
      <FieldSet legend={t('flights.form.tripKindLabel')}>
        <SegmentedControl
          name={`${id}-trip-kind`}
          ariaLabel={t('flights.form.tripKindLabel')}
          value={values.tripKind}
          options={TRIP_KINDS.map((kind) => ({
            value: kind,
            label: t(`flights.form.tripKind.${kind}`),
          }))}
          onChange={setTripKind}
        />
      </FieldSet>

      <FieldSet legend={t('flights.form.transportLabel')} hint={t('flights.form.transportHint')}>
        <SegmentedControl
          name={`${id}-transport`}
          ariaLabel={t('flights.form.transportLabel')}
          value={values.transport}
          options={TRANSPORT_FILTERS.map((filter) => ({
            value: filter,
            label: t(`flights.form.transport.${filter}`),
          }))}
          onChange={(transport) => update('transport', transport)}
        />
        {values.transport === 'mixed' && (
          <FieldSet
            legend={t('flights.form.mixedModesLabel')}
            hint={t('flights.form.mixedModesHint')}
          >
            <ChipSelect
              compact
              values={values.mixedModes}
              options={JOURNEY_TRANSPORT_MODES.map((mode) => ({
                value: mode,
                label: t(`flights.form.transport.${mode}`),
              }))}
              onChange={(modes) => update('mixedModes', modes)}
            />
          </FieldSet>
        )}
      </FieldSet>

      <div className={styles.legs}>
        {values.tripKind === 'open_jaw' && (
          <p className={styles.legHint}>{t('flights.form.openJawHint')}</p>
        )}
        {values.tripKind === 'round_trip' && (
          <p className={styles.legHint}>{t('flights.form.differentCitiesHint')}</p>
        )}
        {values.tripKind === 'multi_city' && (
          <p className={styles.legHint}>{t('flights.form.multiCityHint')}</p>
        )}

        {values.legs.map((leg, index) => (
          <div key={`leg-${index}`} className={styles.leg}>
            <div className={styles.legHeader}>
              <h3 className={styles.legTitle}>
                {legTitle(values.tripKind, index, values.legs.length, t)}
              </h3>
              {values.tripKind === 'multi_city' && values.legs.length > 2 && (
                <Button type="button" variant="ghost" onClick={() => removeLeg(index)}>
                  {t('flights.form.removeLeg')}
                </Button>
              )}
            </div>
            <div className={styles.row}>
              <Field
                label={t('flights.form.originsLabel')}
                htmlFor={`${id}-leg-${index}-from`}
                hint={index === 0 ? t('flights.form.originsHint') : undefined}
              >
                <LocationSelector
                  id={`${id}-leg-${index}-from`}
                  value={leg.origins}
                  placeholder={t('home.search.fromPlaceholder')}
                  onChange={(origins) => updateLeg(index, { origins })}
                />
              </Field>
              <Field
                label={t('flights.form.destinationsLabel')}
                htmlFor={`${id}-leg-${index}-to`}
                hint={index === 0 ? t('flights.form.destinationsHint') : undefined}
              >
                <LocationSelector
                  id={`${id}-leg-${index}-to`}
                  value={leg.destinations}
                  placeholder={t('home.search.toPlaceholder')}
                  onChange={(destinations) => updateLeg(index, { destinations })}
                />
              </Field>
            </div>
          </div>
        ))}

        {values.tripKind === 'multi_city' && values.legs.length < MAX_JOURNEY_LEGS && (
          <Button type="button" variant="secondary" onClick={addLeg}>
            {t('flights.form.addLeg')}
          </Button>
        )}
      </div>

      <FieldSet legend={t('flights.form.dateModeLabel')}>
        <SegmentedControl
          name={`${id}-date-mode`}
          value={values.dateMode}
          options={DATE_MODES.map((mode) => ({
            value: mode,
            label: t(`flights.form.dateMode.${mode}`),
          }))}
          onChange={(mode) => update('dateMode', mode)}
        />

        {values.dateMode === 'exact' && (
          <div className={styles.row}>
            <Field label={t('flights.form.departureDate')} htmlFor={`${id}-departure`}>
              <input
                id={`${id}-departure`}
                type="date"
                min={today}
                value={values.departureDate}
                onChange={(event) => update('departureDate', event.target.value)}
                required
              />
            </Field>
            {showReturnDate && (
              <Field label={t('flights.form.returnDate')} htmlFor={`${id}-return`}>
                <input
                  id={`${id}-return`}
                  type="date"
                  min={values.departureDate || today}
                  value={values.returnDate}
                  onChange={(event) => update('returnDate', event.target.value)}
                  required
                />
              </Field>
            )}
          </div>
        )}

        {values.dateMode === 'range' && (
          <div className={styles.row}>
            <Field label={t('flights.form.rangeFrom')} htmlFor={`${id}-range-from`}>
              <input
                id={`${id}-range-from`}
                type="date"
                min={today}
                value={values.rangeFrom}
                onChange={(event) => update('rangeFrom', event.target.value)}
                required
              />
            </Field>
            <Field label={t('flights.form.rangeTo')} htmlFor={`${id}-range-to`}>
              <input
                id={`${id}-range-to`}
                type="date"
                min={values.rangeFrom || today}
                value={values.rangeTo}
                onChange={(event) => update('rangeTo', event.target.value)}
                required
              />
            </Field>
          </div>
        )}

        {values.dateMode === 'flexible' && (
          <div className={styles.row}>
            <Field label={t('flights.form.flexDate')} htmlFor={`${id}-flex-date`}>
              <input
                id={`${id}-flex-date`}
                type="date"
                min={today}
                value={values.flexDate}
                onChange={(event) => update('flexDate', event.target.value)}
                required
              />
            </Field>
            <Field label={t('flights.form.flexDays')} htmlFor={`${id}-flex-days`}>
              <select
                id={`${id}-flex-days`}
                value={values.flexDays}
                onChange={(event) => {
                  const selected = FLEX_DAYS_OPTIONS.find(
                    (days) => String(days) === event.target.value,
                  );
                  if (selected) update('flexDays', selected);
                }}
              >
                {FLEX_DAYS_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    {t('flights.form.flexDaysOption', { count: days })}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {values.dateMode === 'months' && (
          <FieldSet legend={t('flights.form.monthsLabel')}>
            <ChipSelect
              compact
              values={values.months}
              options={UPCOMING_MONTHS.map((month) => ({
                value: month,
                label: formatYearMonth(month, intlLocale),
              }))}
              onChange={(months) => update('months', months)}
            />
          </FieldSet>
        )}

        {values.dateMode === 'cheapest' && (
          <FieldSet legend={t('flights.form.cheapestWithin')}>
            <SegmentedControl
              name={`${id}-cheapest`}
              value={values.cheapestWithin}
              options={CHEAPEST_WITHIN_MONTHS.map((months) => ({
                value: months,
                label: t('common.months', { count: months }),
              }))}
              onChange={(months) => update('cheapestWithin', months)}
            />
          </FieldSet>
        )}
      </FieldSet>

      {needsDuration(values) && (
        <FieldSet legend={t('flights.form.durationLabel')}>
          <SegmentedControl
            name={`${id}-duration`}
            value={values.durationPreset}
            options={[
              ...DURATION_PRESETS.map((days) => ({
                value: days,
                label: t('common.days', { count: days }),
              })),
              { value: 'custom' as const, label: t('flights.form.customDuration') },
            ]}
            onChange={(preset) => update('durationPreset', preset)}
          />
          {values.durationPreset === 'custom' && (
            <div className={cx(styles.row, styles.compactRow)}>
              <Field label={t('flights.form.minDays')} htmlFor={`${id}-min-days`}>
                <input
                  id={`${id}-min-days`}
                  type="number"
                  min={1}
                  max={MAX_TRIP_DAYS}
                  value={values.customMinDays}
                  onChange={(event) =>
                    update('customMinDays', clampInt(event.target.value, 1, MAX_TRIP_DAYS))
                  }
                />
              </Field>
              <Field label={t('flights.form.maxDays')} htmlFor={`${id}-max-days`}>
                <input
                  id={`${id}-max-days`}
                  type="number"
                  min={values.customMinDays}
                  max={MAX_TRIP_DAYS}
                  value={values.customMaxDays}
                  onChange={(event) =>
                    update(
                      'customMaxDays',
                      clampInt(event.target.value, values.customMinDays, MAX_TRIP_DAYS),
                    )
                  }
                />
              </Field>
            </div>
          )}
        </FieldSet>
      )}

      <FieldSet legend={t('flights.form.passengersLabel')}>
        <div className={styles.passengerGrid}>
          <PassengerStepper
            id={`${id}-adults`}
            label={t('flights.form.adults')}
            value={values.adults}
            min={1}
            max={MAX_PASSENGERS}
            decreaseLabel={t('flights.form.decrease', { label: t('flights.form.adults') })}
            increaseLabel={t('flights.form.increase', { label: t('flights.form.adults') })}
            onChange={(adults) =>
              setValues((previous) => ({
                ...previous,
                adults,
                infants: Math.min(previous.infants, adults),
              }))
            }
          />
          <PassengerStepper
            id={`${id}-children`}
            label={t('flights.form.children')}
            value={values.children}
            min={0}
            max={MAX_PASSENGERS}
            decreaseLabel={t('flights.form.decrease', { label: t('flights.form.children') })}
            increaseLabel={t('flights.form.increase', { label: t('flights.form.children') })}
            onChange={(children) => update('children', children)}
          />
          <PassengerStepper
            id={`${id}-infants`}
            label={t('flights.form.infants')}
            value={values.infants}
            min={0}
            max={values.adults}
            decreaseLabel={t('flights.form.decrease', { label: t('flights.form.infants') })}
            increaseLabel={t('flights.form.increase', { label: t('flights.form.infants') })}
            onChange={(infants) => update('infants', infants)}
          />
        </div>
        <p className={styles.passengerTotal}>
          {t('flights.form.passengersTotal')}: {t('common.travellers', { count: totalTravellers })}
        </p>
      </FieldSet>

      <FilterBar>
        <FilterRow>
          <FilterToggle
            open={filtersOpen}
            onToggle={() => setFiltersOpen((open) => !open)}
            showLabel={t('filters.show')}
            hideLabel={t('filters.hide')}
            activeCount={flightPreferenceCount(values, showCabin)}
          />
        </FilterRow>

        <FilterMore open={filtersOpen}>
          {showCabin && (
            <FieldSet legend={t('flights.form.cabinClassLabel')} size="compact">
              <SegmentedControl
                name={`${id}-cabin`}
                compact
                value={values.cabinClass}
                options={CABIN_CLASSES.map((cabin) => ({
                  value: cabin,
                  label: t(`flights.form.cabinClass.${cabin}`),
                }))}
                onChange={(cabinClass) => update('cabinClass', cabinClass)}
              />
            </FieldSet>
          )}

          <FieldSet legend={t('flights.form.stopsLabel')} size="compact">
            <SegmentedControl
              name={`${id}-stops`}
              compact
              value={values.stops}
              options={STOPS_PREFERENCES.map((stops) => ({
                value: stops,
                label: t(`flights.form.stops.${stops}`),
              }))}
              onChange={(stops) => update('stops', stops)}
            />
          </FieldSet>

          <FieldSet legend={t('flights.form.baggageLabel')} size="compact">
            <SegmentedControl
              name={`${id}-baggage`}
              compact
              value={values.baggage}
              options={BAGGAGE_PREFERENCES.map((baggage) => ({
                value: baggage,
                label: t(`flights.form.baggage.${baggage}`),
              }))}
              onChange={(baggage) => update('baggage', baggage)}
            />
          </FieldSet>

          <FieldSet legend={t('flights.form.departureTimeLabel')} size="compact">
            <SegmentedControl
              name={`${id}-departure-time`}
              compact
              value={values.departureTime}
              options={DEPARTURE_TIME_WINDOWS.map((window) => ({
                value: window,
                label: t(`flights.form.departureTime.${window}`),
              }))}
              onChange={(departureTime) => update('departureTime', departureTime)}
            />
          </FieldSet>

          <FieldSet legend={t('flights.form.overnightLabel')} size="compact">
            <SegmentedControl
              name={`${id}-overnight`}
              compact
              value={values.overnight}
              options={OVERNIGHT_PREFERENCES.map((overnight) => ({
                value: overnight,
                label: t(`flights.form.overnight.${overnight}`),
              }))}
              onChange={(overnight) => update('overnight', overnight)}
            />
          </FieldSet>

          <FieldSet
            legend={t('flights.form.preferenceLabel')}
            hint={t('flights.form.preferenceHint')}
            size="compact"
          >
            <SegmentedControl
              name={`${id}-preference`}
              compact
              value={values.preference}
              options={JOURNEY_PREFERENCES.map((preference) => ({
                value: preference,
                label: t(`flights.form.preference.${preference}`),
              }))}
              onChange={(preference) => update('preference', preference)}
            />
          </FieldSet>

          {showCabin && (
            <FieldSet
              legend={t('flights.form.sourcesLabel')}
              hint={t('flights.form.sourcesHint')}
              size="compact"
            >
              <ChipSelect
                compact
                values={values.sources}
                options={OFFER_SOURCE_TYPES.map((source) => ({
                  value: source,
                  label: t(`flights.form.sources.${source}`),
                }))}
                onChange={(sources) => update('sources', sources)}
              />
            </FieldSet>
          )}
        </FilterMore>

        <ActiveFilterChips
          chips={flightPreferenceChips(values, showCabin, t, (next) => setValues(next))}
          onClearAll={
            flightPreferenceCount(values, showCabin) > 0
              ? () => setValues((current) => resetFlightPreferences(current))
              : undefined
          }
        />
      </FilterBar>

      <div className={styles.submitRow}>
        <Button type="submit" size="lg" disabled={isSearching || !canSubmit}>
          {isSearching ? t('flights.form.searching') : t('flights.form.submit')}
        </Button>
      </div>
    </form>
  );
}

const ALL_SOURCES = ['airline', 'ota', 'tour_operator', 'charter', 'package'] as const;

function flightPreferenceCount(values: FlightSearchFormValues, showCabin: boolean): number {
  let count = 0;
  if (showCabin && values.cabinClass !== 'economy') count += 1;
  if (values.stops !== 'any') count += 1;
  if (values.baggage !== 'none') count += 1;
  if (values.departureTime !== 'any') count += 1;
  if (values.overnight !== 'any') count += 1;
  if (values.preference !== 'cheapest') count += 1;
  if (showCabin && values.sources.length !== ALL_SOURCES.length) count += 1;
  return count;
}

function flightPreferenceChips(
  values: FlightSearchFormValues,
  showCabin: boolean,
  t: TFunction,
  setValues: (values: FlightSearchFormValues) => void,
): Array<{ id: string; label: string; onRemove: () => void }> {
  const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];

  if (showCabin && values.cabinClass !== 'economy') {
    chips.push({
      id: 'cabin',
      label: t(`flights.form.cabinClass.${values.cabinClass}`),
      onRemove: () => setValues({ ...values, cabinClass: 'economy' }),
    });
  }
  if (values.stops !== 'any') {
    chips.push({
      id: 'stops',
      label: t(`flights.form.stops.${values.stops}`),
      onRemove: () => setValues({ ...values, stops: 'any' }),
    });
  }
  if (values.baggage !== 'none') {
    chips.push({
      id: 'baggage',
      label: t(`flights.form.baggage.${values.baggage}`),
      onRemove: () => setValues({ ...values, baggage: 'none' }),
    });
  }
  if (values.departureTime !== 'any') {
    chips.push({
      id: 'departureTime',
      label: t(`flights.form.departureTime.${values.departureTime}`),
      onRemove: () => setValues({ ...values, departureTime: 'any' }),
    });
  }
  if (values.overnight !== 'any') {
    chips.push({
      id: 'overnight',
      label: t(`flights.form.overnight.${values.overnight}`),
      onRemove: () => setValues({ ...values, overnight: 'any' }),
    });
  }
  if (values.preference !== 'cheapest') {
    chips.push({
      id: 'preference',
      label: t(`flights.form.preference.${values.preference}`),
      onRemove: () => setValues({ ...values, preference: 'cheapest' }),
    });
  }
  if (showCabin && values.sources.length !== ALL_SOURCES.length) {
    values.sources.forEach((source) => {
      chips.push({
        id: `source-${source}`,
        label: t(`flights.form.sources.${source}`),
        onRemove: () =>
          setValues({ ...values, sources: values.sources.filter((item) => item !== source) }),
      });
    });
  }

  return chips;
}

function legTitle(
  tripKind: TripKind,
  index: number,
  total: number,
  t: (
    key: 'flights.form.legOutbound' | 'flights.form.legReturn' | 'flights.form.legNumber',
    options?: { number: number },
  ) => string,
): string {
  if (tripKind === 'round_trip' || tripKind === 'open_jaw') {
    return index === 0 ? t('flights.form.legOutbound') : t('flights.form.legReturn');
  }
  if (tripKind === 'multi_city') {
    return t('flights.form.legNumber', { number: index + 1 });
  }
  return total > 1
    ? t('flights.form.legNumber', { number: index + 1 })
    : t('flights.form.legOutbound');
}

interface PassengerStepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
}

function PassengerStepper({
  id,
  label,
  value,
  min,
  max,
  decreaseLabel,
  increaseLabel,
  onChange,
}: PassengerStepperProps) {
  return (
    <div className={styles.stepperField}>
      <label className={styles.stepperLabel} htmlFor={id}>
        {label}
      </label>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={decreaseLabel}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
        </button>
        <input
          id={id}
          className={styles.stepperInput}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(clampInt(event.target.value, min, max))}
        />
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={increaseLabel}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
