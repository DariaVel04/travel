import { type FormEvent, type ReactNode, useId, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { LocationSelector } from '@/components/LocationSelector/LocationSelector';
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips';
import { FilterBar, FilterRow } from '@/components/filters/FilterBar';
import { FilterMore, FilterToggle } from '@/components/filters/FilterPanel';
import { Button } from '@/components/ui/Button';
import card from '@/components/ui/Card.module.css';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Field, FieldSet } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ACCOMMODATION_TYPE_FILTERS } from '@/features/hotels/options';
import { TransportModeSelector } from '@/features/transportation/components/TransportModeSelector';
import { useLocale } from '@/hooks/useLocale';
import { cx } from '@/utils/classNames';
import { formatYearMonth, getUpcomingMonths } from '@/utils/date';
import { clampInt } from '@/utils/number';
import {
  CLIMATE_PREFERENCES,
  COMFORT_LEVELS,
  FOOD_PREFERENCES,
  INTERESTS,
  TRAVEL_PACES,
  TRIP_TYPES,
} from '../options';
import {
  PLANNER_CURRENCIES,
  PLANNER_LOCATION_TYPES,
  type PlannerFormValues,
  resetPlannerPreferences,
  resizeChildrenAges,
  toPlannerRequest,
} from '../plannerForm';
import type { PlannerRequest, TravelGroup } from '../types';
import styles from './PlannerForm.module.css';

interface PlannerFormProps {
  initialValues: PlannerFormValues;
  isGenerating: boolean;
  onSubmit: (request: PlannerRequest) => void;
}

const UPCOMING_MONTHS = getUpcomingMonths(12);
const MAX_GROUP_MEMBERS = 12;
const MAX_CHILD_AGE = 17;
const MAX_ROOMS = 8;
type StayExtra = 'breakfastIncluded' | 'freeCancellation';
const GROUP_FIELDS = ['adults', 'children', 'seniors', 'pets'] as const satisfies ReadonlyArray<
  keyof TravelGroup
>;

export function PlannerForm({ initialValues, isGenerating, onSubmit }: PlannerFormProps) {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const id = useId();
  const [values, setValues] = useState(initialValues);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function update<K extends keyof PlannerFormValues>(key: K, value: PlannerFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  function updateGroupCount(field: (typeof GROUP_FIELDS)[number], rawValue: string) {
    const min = field === 'adults' ? 1 : 0;
    const count = clampInt(rawValue, min, MAX_GROUP_MEMBERS);
    setValues((previous) => ({
      ...previous,
      group: {
        ...previous.group,
        [field]: count,
        childrenAges:
          field === 'children'
            ? resizeChildrenAges(previous.group.childrenAges, count)
            : previous.group.childrenAges,
      },
    }));
  }

  function updateChildAge(index: number, rawValue: string) {
    setValues((previous) => ({
      ...previous,
      group: {
        ...previous.group,
        childrenAges: previous.group.childrenAges.map((age, i) =>
          i === index ? clampInt(rawValue, 0, MAX_CHILD_AGE) : age,
        ),
      },
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(toPlannerRequest(values));
  }

  return (
    <form id="planner-form" className={styles.form} onSubmit={handleSubmit}>
      {/* ---------- Destination & dates ---------- */}
      <FormSection title={t('planner.destination.title')}>
        <div className={styles.row}>
          <Field
            label={t('planner.destination.originLabel')}
            htmlFor={`${id}-origin`}
            hint={t('planner.destination.originHint')}
          >
            <LocationSelector
              id={`${id}-origin`}
              value={values.origins}
              placeholder={t('planner.destination.originPlaceholder')}
              allowedTypes={PLANNER_LOCATION_TYPES}
              onChange={(origins) => update('origins', origins)}
            />
          </Field>
          <Field
            label={t('planner.destination.destinationLabel')}
            htmlFor={`${id}-destination`}
            hint={t('planner.destination.destinationHint')}
          >
            <LocationSelector
              id={`${id}-destination`}
              value={values.destinations}
              placeholder={t('planner.destination.destinationPlaceholder')}
              allowedTypes={PLANNER_LOCATION_TYPES}
              onChange={(destinations) => update('destinations', destinations)}
            />
          </Field>
        </div>
        <div className={styles.row}>
          <Field label={t('planner.destination.monthLabel')} htmlFor={`${id}-month`}>
            <select
              id={`${id}-month`}
              value={values.departureMonth}
              onChange={(event) => update('departureMonth', event.target.value)}
            >
              <option value="">—</option>
              {UPCOMING_MONTHS.map((month) => (
                <option key={month} value={month}>
                  {formatYearMonth(month, intlLocale)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('planner.destination.durationLabel')} htmlFor={`${id}-duration`}>
            <input
              id={`${id}-duration`}
              type="number"
              min={1}
              max={60}
              value={values.durationDays}
              onChange={(event) => update('durationDays', clampInt(event.target.value, 1, 60))}
            />
          </Field>
        </div>
      </FormSection>

      {/* ---------- Group ---------- */}
      <FormSection title={t('planner.group.title')}>
        <div className={cx(styles.row, styles.compactRow)}>
          {GROUP_FIELDS.map((field) => (
            <Field key={field} label={t(`planner.group.${field}`)} htmlFor={`${id}-${field}`}>
              <input
                id={`${id}-${field}`}
                type="number"
                min={field === 'adults' ? 1 : 0}
                max={MAX_GROUP_MEMBERS}
                value={values.group[field]}
                onChange={(event) => updateGroupCount(field, event.target.value)}
              />
            </Field>
          ))}
        </div>
        {values.group.childrenAges.length > 0 && (
          <div className={cx(styles.row, styles.compactRow)}>
            {values.group.childrenAges.map((age, index) => (
              <Field
                key={index}
                label={t('planner.group.childAge', { number: index + 1 })}
                htmlFor={`${id}-child-${index}`}
              >
                <input
                  id={`${id}-child-${index}`}
                  type="number"
                  min={0}
                  max={MAX_CHILD_AGE}
                  value={age}
                  onChange={(event) => updateChildAge(index, event.target.value)}
                />
              </Field>
            ))}
          </div>
        )}
      </FormSection>

      <FilterBar>
        <FilterRow>
          <FilterToggle
            open={filtersOpen}
            onToggle={() => setFiltersOpen((open) => !open)}
            showLabel={t('filters.show')}
            hideLabel={t('filters.hide')}
            activeCount={plannerFilterCount(values)}
          />
        </FilterRow>

        <FilterMore open={filtersOpen}>
          <FieldSet
            legend={t('planner.tripTypes.title')}
            hint={t('planner.tripTypes.hint')}
            size="compact"
            className={styles.filterWide}
          >
            <ChipSelect
              compact
              values={values.tripTypes}
              options={TRIP_TYPES.map((type) => ({
                value: type,
                label: t(`planner.tripTypes.options.${type}`),
              }))}
              onChange={(tripTypes) => update('tripTypes', tripTypes)}
            />
          </FieldSet>

          <Field label={t('planner.preferences.budgetLabel')} htmlFor={`${id}-budget`} size="compact">
            <input
              id={`${id}-budget`}
              type="number"
              min={0}
              step={50}
              inputMode="numeric"
              value={values.budget}
              placeholder={t('planner.preferences.budgetPlaceholder')}
              onChange={(event) => update('budget', event.target.value)}
            />
          </Field>
          <Field label={t('planner.preferences.currencyLabel')} htmlFor={`${id}-currency`} size="compact">
            <select
              id={`${id}-currency`}
              value={values.currency}
              onChange={(event) => {
                const selected = PLANNER_CURRENCIES.find((code) => code === event.target.value);
                if (selected) update('currency', selected);
              }}
            >
              {PLANNER_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {t(`hotels.filters.currencies.${code}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('planner.preferences.climateLabel')} htmlFor={`${id}-climate`} size="compact">
            <select
              id={`${id}-climate`}
              value={values.climate}
              onChange={(event) => {
                const climate = CLIMATE_PREFERENCES.find((c) => c === event.target.value);
                if (climate) update('climate', climate);
              }}
            >
              {CLIMATE_PREFERENCES.map((climate) => (
                <option key={climate} value={climate}>
                  {t(`planner.preferences.climate.${climate}`)}
                </option>
              ))}
            </select>
          </Field>

          <FieldSet legend={t('planner.preferences.paceLabel')} size="compact">
            <SegmentedControl
              name={`${id}-pace`}
              compact
              value={values.pace}
              options={TRAVEL_PACES.map((pace) => ({
                value: pace,
                label: t(`planner.preferences.pace.${pace}`),
              }))}
              onChange={(pace) => update('pace', pace)}
            />
          </FieldSet>
          <FieldSet legend={t('planner.preferences.comfortLabel')} size="compact">
            <SegmentedControl
              name={`${id}-comfort`}
              compact
              value={values.comfort}
              options={COMFORT_LEVELS.map((comfort) => ({
                value: comfort,
                label: t(`planner.preferences.comfort.${comfort}`),
              }))}
              onChange={(comfort) => update('comfort', comfort)}
            />
          </FieldSet>

          <FieldSet
            legend={t('planner.preferences.interestsLabel')}
            size="compact"
            className={styles.filterWide}
          >
            <ChipSelect
              compact
              values={values.interests}
              options={INTERESTS.map((interest) => ({
                value: interest,
                label: t(`planner.preferences.interests.${interest}`),
              }))}
              onChange={(interests) => update('interests', interests)}
            />
          </FieldSet>

          <FieldSet
            legend={t('planner.preferences.foodLabel')}
            size="compact"
            className={styles.filterWide}
          >
            <ChipSelect
              compact
              values={values.food}
              options={FOOD_PREFERENCES.map((food) => ({
                value: food,
                label: t(`planner.preferences.food.${food}`),
              }))}
              onChange={(food) => update('food', food)}
            />
          </FieldSet>

          <FieldSet
            legend={t('planner.stays.title')}
            hint={values.group.pets > 0 ? t('planner.stays.petsHint') : t('planner.stays.hint')}
            size="compact"
            className={styles.filterWide}
          >
            <div className={styles.filterStayRow}>
              <Field label={t('planner.stays.typeLabel')} htmlFor={`${id}-stay-type`} size="compact">
                <select
                  id={`${id}-stay-type`}
                  value={values.stayType}
                  onChange={(event) => {
                    const stayType = ACCOMMODATION_TYPE_FILTERS.find(
                      (type) => type === event.target.value,
                    );
                    if (stayType) update('stayType', stayType);
                  }}
                >
                  {ACCOMMODATION_TYPE_FILTERS.map((type) => (
                    <option key={type} value={type}>
                      {t(`hotels.types.${type}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('planner.stays.roomsLabel')} htmlFor={`${id}-rooms`} size="compact">
                <input
                  id={`${id}-rooms`}
                  type="number"
                  min={1}
                  max={MAX_ROOMS}
                  value={values.rooms}
                  onChange={(event) => update('rooms', clampInt(event.target.value, 1, MAX_ROOMS))}
                />
              </Field>
            </div>
            <FieldSet legend={t('planner.stays.extrasLabel')} size="compact">
              <ChipSelect
                compact
                values={stayExtras(values)}
                options={[
                  { value: 'breakfastIncluded', label: t('planner.stays.breakfastIncluded') },
                  { value: 'freeCancellation', label: t('planner.stays.freeCancellation') },
                ]}
                onChange={(extras) =>
                  setValues((previous) => ({
                    ...previous,
                    breakfastIncluded: extras.includes('breakfastIncluded'),
                    freeCancellation: extras.includes('freeCancellation'),
                  }))
                }
              />
            </FieldSet>
          </FieldSet>

          <div className={styles.filterWide}>
            <TransportModeSelector
              compact
              name={`${id}-transport`}
              value={values.transportMode}
              onChange={(mode) => update('transportMode', mode)}
            />
          </div>
        </FilterMore>

        <ActiveFilterChips
          chips={plannerFilterChips(values, t, setValues)}
          onClearAll={
            plannerFilterCount(values) > 0
              ? () => setValues((current) => resetPlannerPreferences(current))
              : undefined
          }
        />
      </FilterBar>

      <div className={styles.submitRow}>
        <Button type="submit" size="lg" disabled={isGenerating}>
          {isGenerating ? t('planner.generating') : t('planner.submit')}
        </Button>
      </div>
    </form>
  );
}

function stayExtras(values: PlannerFormValues): StayExtra[] {
  const extras: StayExtra[] = [];
  if (values.breakfastIncluded) extras.push('breakfastIncluded');
  if (values.freeCancellation) extras.push('freeCancellation');
  return extras;
}

function plannerFilterCount(values: PlannerFormValues): number {
  return (
    values.tripTypes.length +
    (values.budget.trim() ? 1 : 0) +
    (values.currency !== 'EUR' ? 1 : 0) +
    (values.climate !== 'any' ? 1 : 0) +
    (values.pace !== 'moderate' ? 1 : 0) +
    (values.comfort !== 'standard' ? 1 : 0) +
    values.interests.length +
    values.food.length +
    (values.stayType !== 'any' ? 1 : 0) +
    (values.rooms !== 1 ? 1 : 0) +
    (values.breakfastIncluded ? 1 : 0) +
    (values.freeCancellation ? 1 : 0) +
    (values.transportMode ? 1 : 0)
  );
}

function plannerFilterChips(
  values: PlannerFormValues,
  t: TFunction,
  setValues: (next: PlannerFormValues) => void,
): Array<{ id: string; label: string; onRemove: () => void }> {
  const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];

  values.tripTypes.forEach((type) => {
    chips.push({
      id: `tripType-${type}`,
      label: t(`planner.tripTypes.options.${type}`),
      onRemove: () =>
        setValues({ ...values, tripTypes: values.tripTypes.filter((item) => item !== type) }),
    });
  });

  if (values.budget.trim()) {
    chips.push({
      id: 'budget',
      label: `${t('planner.preferences.budgetLabel')} ${values.budget}`,
      onRemove: () => setValues({ ...values, budget: '' }),
    });
  }

  if (values.currency !== 'EUR') {
    chips.push({
      id: 'currency',
      label: t(`hotels.filters.currencies.${values.currency}`),
      onRemove: () => setValues({ ...values, currency: 'EUR' }),
    });
  }

  if (values.climate !== 'any') {
    chips.push({
      id: 'climate',
      label: t(`planner.preferences.climate.${values.climate}`),
      onRemove: () => setValues({ ...values, climate: 'any' }),
    });
  }

  if (values.pace !== 'moderate') {
    chips.push({
      id: 'pace',
      label: t(`planner.preferences.pace.${values.pace}`),
      onRemove: () => setValues({ ...values, pace: 'moderate' }),
    });
  }

  if (values.comfort !== 'standard') {
    chips.push({
      id: 'comfort',
      label: t(`planner.preferences.comfort.${values.comfort}`),
      onRemove: () => setValues({ ...values, comfort: 'standard' }),
    });
  }

  values.interests.forEach((interest) => {
    chips.push({
      id: `interest-${interest}`,
      label: t(`planner.preferences.interests.${interest}`),
      onRemove: () =>
        setValues({ ...values, interests: values.interests.filter((item) => item !== interest) }),
    });
  });

  values.food.forEach((food) => {
    chips.push({
      id: `food-${food}`,
      label: t(`planner.preferences.food.${food}`),
      onRemove: () => setValues({ ...values, food: values.food.filter((item) => item !== food) }),
    });
  });

  if (values.stayType !== 'any') {
    chips.push({
      id: 'stayType',
      label: t(`hotels.types.${values.stayType}`),
      onRemove: () => setValues({ ...values, stayType: 'any' }),
    });
  }

  if (values.rooms !== 1) {
    chips.push({
      id: 'rooms',
      label: `${t('planner.stays.roomsLabel')} ${values.rooms}`,
      onRemove: () => setValues({ ...values, rooms: 1 }),
    });
  }

  if (values.breakfastIncluded) {
    chips.push({
      id: 'breakfastIncluded',
      label: t('planner.stays.breakfastIncluded'),
      onRemove: () => setValues({ ...values, breakfastIncluded: false }),
    });
  }

  if (values.freeCancellation) {
    chips.push({
      id: 'freeCancellation',
      label: t('planner.stays.freeCancellation'),
      onRemove: () => setValues({ ...values, freeCancellation: false }),
    });
  }

  if (values.transportMode) {
    chips.push({
      id: 'transportMode',
      label: t(`transportation.modes.${values.transportMode}.title`),
      onRemove: () => setValues({ ...values, transportMode: null }),
    });
  }

  return chips;
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className={cx(card.card, styles.section)}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {hint && <p className={styles.sectionHint}>{hint}</p>}
      </div>
      {children}
    </section>
  );
}
