import { type FormEvent, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationSelector } from '@/components/LocationSelector/LocationSelector';
import { Button } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { Field, FieldSet } from '@/components/ui/Field';
import { useLocale } from '@/hooks/useLocale';
import { cx } from '@/utils/classNames';
import { todayISODate } from '@/utils/date';
import { clampInt } from '@/utils/number';
import { ACCOMMODATION_TYPE_FILTERS } from '../options';
import {
  type HotelSearchFormValues,
  isHotelFormValid,
  stayNights,
  toAccommodationSearchParams,
  withChildCount,
  withValidDates,
} from '../searchForm';
import type { AccommodationSearchParams } from '../types';
import styles from './HotelSearchForm.module.css';

interface HotelSearchFormProps {
  values: HotelSearchFormValues;
  onChange: (values: HotelSearchFormValues) => void;
  isSearching: boolean;
  onSearch: (params: AccommodationSearchParams) => void;
}

const HOTEL_LOCATION_TYPES = ['city', 'country', 'region'] as const;

const MAX_ADULTS = 9;
const MAX_CHILDREN = 6;
const MAX_ROOMS = 8;
const MAX_CHILD_AGE = 17;

export function HotelSearchForm({ values, onChange, isSearching, onSearch }: HotelSearchFormProps) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const id = useId();
  const today = todayISODate();

  function update<K extends keyof HotelSearchFormValues>(key: K, value: HotelSearchFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isHotelFormValid(values)) return;
    onSearch(toAccommodationSearchParams(values));
  }

  const nights =
    values.checkIn && values.checkOut ? stayNights(values.checkIn, values.checkOut) : 0;
  const stayLabel =
    nights > 0
      ? `${formatStayDate(values.checkIn, intlLocale)} – ${formatStayDate(values.checkOut, intlLocale)} · ${t('hotels.form.nights', { count: nights })}`
      : undefined;

  return (
    <form className={cx(card.card, styles.form)} onSubmit={handleSubmit}>
      <Field
        label={t('hotels.form.destinationLabel')}
        htmlFor={`${id}-destination`}
        hint={t('hotels.form.destinationHint')}
      >
        <LocationSelector
          id={`${id}-destination`}
          value={values.destinations}
          placeholder={t('hotels.form.destinationPlaceholder')}
          allowedTypes={HOTEL_LOCATION_TYPES}
          maxSelections={4}
          onChange={(destinations) => update('destinations', destinations)}
        />
      </Field>

      <div className={styles.row}>
        <Field label={t('hotels.form.checkIn')} htmlFor={`${id}-check-in`}>
          <input
            id={`${id}-check-in`}
            type="date"
            min={today}
            value={values.checkIn}
            onChange={(event) => onChange(withValidDates(values, { checkIn: event.target.value }))}
            required
          />
        </Field>
        <Field label={t('hotels.form.checkOut')} htmlFor={`${id}-check-out`} hint={stayLabel}>
          <input
            id={`${id}-check-out`}
            type="date"
            min={values.checkIn || today}
            value={values.checkOut}
            onChange={(event) => onChange(withValidDates(values, { checkOut: event.target.value }))}
            required
          />
        </Field>
      </div>

      <FieldSet legend={t('hotels.form.guestsLabel')}>
        <div className={styles.guestGrid}>
          <GuestStepper
            id={`${id}-adults`}
            label={t('hotels.form.adults')}
            value={values.adults}
            min={1}
            max={MAX_ADULTS}
            decreaseLabel={t('hotels.form.decrease', { label: t('hotels.form.adults') })}
            increaseLabel={t('hotels.form.increase', { label: t('hotels.form.adults') })}
            onChange={(adults) => update('adults', adults)}
          />
          <GuestStepper
            id={`${id}-children`}
            label={t('hotels.form.children')}
            value={values.children}
            min={0}
            max={MAX_CHILDREN}
            decreaseLabel={t('hotels.form.decrease', { label: t('hotels.form.children') })}
            increaseLabel={t('hotels.form.increase', { label: t('hotels.form.children') })}
            onChange={(children) => onChange(withChildCount(values, children))}
          />
          <GuestStepper
            id={`${id}-rooms`}
            label={t('hotels.form.rooms')}
            value={values.rooms}
            min={1}
            max={MAX_ROOMS}
            decreaseLabel={t('hotels.form.decrease', { label: t('hotels.form.rooms') })}
            increaseLabel={t('hotels.form.increase', { label: t('hotels.form.rooms') })}
            onChange={(rooms) => update('rooms', rooms)}
          />
        </div>
        {values.children > 0 && (
          <div className={styles.ages}>
            {values.childAges.map((age, index) => (
              <Field
                key={`${id}-age-${index}`}
                label={t('hotels.form.childAge', { number: index + 1 })}
                htmlFor={`${id}-age-${index}`}
              >
                <input
                  id={`${id}-age-${index}`}
                  type="number"
                  min={0}
                  max={MAX_CHILD_AGE}
                  value={age}
                  onChange={(event) => {
                    const nextAges = values.childAges.map((current, ageIndex) =>
                      ageIndex === index ? clampInt(event.target.value, 0, MAX_CHILD_AGE) : current,
                    );
                    update('childAges', nextAges);
                  }}
                />
              </Field>
            ))}
          </div>
        )}
      </FieldSet>

      <Field label={t('hotels.form.typeLabel')} htmlFor={`${id}-type`} size="compact">
        <select
          id={`${id}-type`}
          value={values.type}
          onChange={(event) => {
            const selected = ACCOMMODATION_TYPE_FILTERS.find((type) => type === event.target.value);
            if (selected) update('type', selected);
          }}
        >
          {ACCOMMODATION_TYPE_FILTERS.map((type) => (
            <option key={type} value={type}>
              {t(`hotels.types.${type}`)}
            </option>
          ))}
        </select>
      </Field>

      <div className={styles.submitRow}>
        <Button type="submit" size="lg" disabled={isSearching || !isHotelFormValid(values)}>
          {isSearching ? t('hotels.form.searching') : t('hotels.form.submit')}
        </Button>
      </div>
    </form>
  );
}

function formatStayDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
    new Date(`${value}T00:00:00`),
  );
}

interface GuestStepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
}

function GuestStepper({
  id,
  label,
  value,
  min,
  max,
  decreaseLabel,
  increaseLabel,
  onChange,
}: GuestStepperProps) {
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
