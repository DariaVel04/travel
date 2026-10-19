import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips';
import { FilterBar, FilterRow } from '@/components/filters/FilterBar';
import { FilterMore, FilterToggle } from '@/components/filters/FilterPanel';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Field, FieldSet } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ACCOMMODATION_AMENITIES, PRICE_CURRENCIES, RATING_FILTERS } from '../options';
import { resetHotelRefinements, type HotelSearchFormValues } from '../searchForm';
import styles from './HotelFilters.module.css';

interface HotelFiltersProps {
  values: HotelSearchFormValues;
  onChange: (values: HotelSearchFormValues) => void;
}

type ExtraFilter = 'freeCancellation' | 'breakfastIncluded' | 'privateBathroom';

export function HotelFilters({ values, onChange }: HotelFiltersProps) {
  const { t } = useTranslation();
  const id = useId();
  const [moreOpen, setMoreOpen] = useState(false);

  function update<K extends keyof HotelSearchFormValues>(key: K, value: HotelSearchFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const extras = extraValues(values);
  const extraOptions = [
    { value: 'freeCancellation' as const, label: t('hotels.filters.freeCancellation') },
    { value: 'breakfastIncluded' as const, label: t('hotels.filters.breakfastIncluded') },
    { value: 'privateBathroom' as const, label: t('hotels.filters.privateBathroom') },
  ];

  const moreCount =
    (values.currency !== 'any' ? 1 : 0) + values.amenities.length + extras.length;

  const chips = [
    ...(values.type !== 'any'
      ? [
          {
            id: 'type',
            label: t(`hotels.types.${values.type}`),
            onRemove: () => update('type', 'any'),
          },
        ]
      : []),
    ...(values.minPrice.trim()
      ? [
          {
            id: 'minPrice',
            label: `${t('hotels.filters.minPrice')} ${values.minPrice}`,
            onRemove: () => update('minPrice', ''),
          },
        ]
      : []),
    ...(values.maxPrice.trim()
      ? [
          {
            id: 'maxPrice',
            label: `${t('hotels.filters.maxPrice')} ${values.maxPrice}`,
            onRemove: () => update('maxPrice', ''),
          },
        ]
      : []),
    ...(values.currency !== 'any'
      ? [
          {
            id: 'currency',
            label: t(`hotels.filters.currencies.${values.currency}`),
            onRemove: () => update('currency', 'any'),
          },
        ]
      : []),
    ...(values.minRating !== 'any'
      ? [
          {
            id: 'rating',
            label: t(`hotels.filters.rating.${values.minRating}`),
            onRemove: () => update('minRating', 'any'),
          },
        ]
      : []),
    ...values.amenities.map((amenity) => ({
      id: `amenity-${amenity}`,
      label: t(`hotels.amenities.${amenity}`),
      onRemove: () => update('amenities', values.amenities.filter((item) => item !== amenity)),
    })),
    ...extraOptions
      .filter((option) => extras.includes(option.value))
      .map((option) => ({
        id: option.value,
        label: option.label,
        onRemove: () => onChange({ ...values, [option.value]: false }),
      })),
  ];

  return (
    <FilterBar>
      <FilterRow>
        <FieldSet legend={t('hotels.filters.ratingLabel')} size="compact">
          <SegmentedControl
            name={`${id}-rating`}
            compact
            value={values.minRating}
            options={RATING_FILTERS.map((rating) => ({
              value: rating,
              label: t(`hotels.filters.rating.${rating}`),
            }))}
            onChange={(minRating) => update('minRating', minRating)}
          />
        </FieldSet>

        <div className={styles.quickPrice}>
          <Field label={t('hotels.filters.minPrice')} htmlFor={`${id}-min-price`} size="compact">
            <input
              id={`${id}-min-price`}
              type="number"
              min={0}
              inputMode="numeric"
              value={values.minPrice}
              placeholder="0"
              onChange={(event) => update('minPrice', event.target.value)}
            />
          </Field>
          <Field label={t('hotels.filters.maxPrice')} htmlFor={`${id}-max-price`} size="compact">
            <input
              id={`${id}-max-price`}
              type="number"
              min={0}
              inputMode="numeric"
              value={values.maxPrice}
              placeholder="500"
              onChange={(event) => update('maxPrice', event.target.value)}
            />
          </Field>
        </div>

        <FilterToggle
          open={moreOpen}
          onToggle={() => setMoreOpen((open) => !open)}
          showLabel={t('filters.show')}
          hideLabel={t('filters.hide')}
          activeCount={moreCount}
        />
      </FilterRow>

      <FilterMore open={moreOpen}>
        <Field label={t('hotels.filters.currency')} htmlFor={`${id}-currency`} size="compact">
          <select
            id={`${id}-currency`}
            value={values.currency}
            onChange={(event) => {
              const selected = PRICE_CURRENCIES.find((code) => code === event.target.value);
              if (selected) update('currency', selected);
            }}
          >
            {PRICE_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {t(`hotels.filters.currencies.${code}`)}
              </option>
            ))}
          </select>
        </Field>
        <FieldSet legend={t('hotels.filters.amenitiesLabel')} size="compact">
          <ChipSelect
            compact
            values={values.amenities}
            options={ACCOMMODATION_AMENITIES.map((amenity) => ({
              value: amenity,
              label: t(`hotels.amenities.${amenity}`),
            }))}
            onChange={(amenities) => update('amenities', amenities)}
          />
        </FieldSet>
        <FieldSet legend={t('hotels.filters.extrasLabel')} size="compact">
          <ChipSelect
            compact
            values={extras}
            options={extraOptions}
            onChange={(next) =>
              onChange({
                ...values,
                freeCancellation: next.includes('freeCancellation'),
                breakfastIncluded: next.includes('breakfastIncluded'),
                privateBathroom: next.includes('privateBathroom'),
              })
            }
          />
        </FieldSet>
      </FilterMore>

      <ActiveFilterChips
        chips={chips}
        onClearAll={chips.length > 0 ? () => onChange(resetHotelRefinements(values)) : undefined}
      />
    </FilterBar>
  );
}

function extraValues(values: HotelSearchFormValues): ExtraFilter[] {
  const extras: ExtraFilter[] = [];
  if (values.freeCancellation) extras.push('freeCancellation');
  if (values.breakfastIncluded) extras.push('breakfastIncluded');
  if (values.privateBathroom) extras.push('privateBathroom');
  return extras;
}
