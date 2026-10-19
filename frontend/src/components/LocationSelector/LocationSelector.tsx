import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import {
  ANYWHERE_LOCATION,
  TYPED_CITY_ID_PREFIX,
  type LocationSearchOptions,
  searchLocations,
} from '@/services/locations/locationService';
import type { LocationType, TravelLocation } from '@/types/location';
import { cx } from '@/utils/classNames';
import { countryCodeToFlag, getLocalizedName, getLocationContext } from '@/utils/location';
import styles from './LocationSelector.module.css';

const TYPE_ICONS: Record<LocationType, string> = {
  airport: '✈️',
  city: '🏙️',
  country: '🏳️',
  region: '🌍',
  anywhere: '🌐',
};

const SEARCH_DEBOUNCE_MS = 150;

interface LocationSelectorProps {
  /** id of the text input, so an external <label htmlFor> works. */
  id: string;
  value: TravelLocation[];
  onChange: (locations: TravelLocation[]) => void;
  placeholder?: string;
  allowAnywhere?: boolean;
  maxSelections?: number;
  /** Limit suggestions to these kinds of places, e.g. cities and countries only. */
  allowedTypes?: readonly LocationType[];
  /** Data source; defaults to the app's location service. Pass another one for tests or other APIs. */
  search?: (query: string, options?: LocationSearchOptions) => Promise<TravelLocation[]>;
}

/** Searchable multi-select for airports, cities, countries, regions and "Anywhere". */
export function LocationSelector({
  id,
  value,
  onChange,
  placeholder,
  allowAnywhere = true,
  maxSelections = 6,
  allowedTypes,
  search = searchLocations,
}: LocationSelectorProps) {
  const { t } = useTranslation();
  const { language } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<TravelLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const listboxId = `${id}-listbox`;
  const isFull = value.length >= maxSelections;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
      void search(query, allowedTypes ? { types: allowedTypes } : undefined).then((locations) => {
        if (cancelled) return;
        setResults(locations);
        setIsLoading(false);
        setActiveIndex(0);
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen, search, allowedTypes]);

  const anywhereLabel = t('locationSelector.anywhere');
  const normalizedQuery = query.trim().toLowerCase();
  const showAnywhere =
    allowAnywhere &&
    !value.some((location) => location.type === 'anywhere') &&
    (!normalizedQuery || anywhereLabel.toLowerCase().startsWith(normalizedQuery));

  const selectedIds = new Set(value.map((location) => location.id));
  const options = [
    ...(showAnywhere ? [ANYWHERE_LOCATION] : []),
    ...results.filter((location) => !selectedIds.has(location.id)),
  ];

  function displayName(location: TravelLocation): string {
    return location.type === 'anywhere' ? anywhereLabel : getLocalizedName(location, language);
  }

  function typeLabel(location: TravelLocation): string {
    if (isContinent(location)) return t('locationSelector.types.continent');
    switch (location.type) {
      case 'airport':
        return t('locationSelector.types.airport');
      case 'city':
        return t('locationSelector.types.city');
      case 'country':
        return t('locationSelector.types.country');
      case 'region':
        return t('locationSelector.types.region');
      case 'anywhere':
        return t('locationSelector.anywhere');
    }
  }

  function select(location: TravelLocation) {
    // "Anywhere" replaces all other choices, and any specific place replaces "Anywhere".
    const next =
      location.type === 'anywhere'
        ? [location]
        : [...value.filter((item) => item.type !== 'anywhere'), location];
    onChange(next.slice(0, maxSelections));
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function remove(locationId: string) {
    onChange(value.filter((location) => location.id !== locationId));
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) setIsOpen(true);
        else setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Enter': {
        const option = options[activeIndex];
        if (isOpen && option) {
          // Select instead of submitting the surrounding form.
          event.preventDefault();
          select(option);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Backspace': {
        const last = value[value.length - 1];
        if (!query && last) remove(last.id);
        break;
      }
    }
  }

  const activeOption = isOpen ? options[activeIndex] : undefined;

  return (
    <div className={styles.selector}>
      <div className={styles.control} onClick={() => inputRef.current?.focus()}>
        {value.map((location) => (
          <span key={location.id} className={cx(styles.chip, styles[location.type])}>
            <LocationIcon location={location} />
            <span className={styles.chipName}>{displayName(location)}</span>
            {location.type === 'airport' && location.code && (
              <span className={styles.chipCode}>{location.code}</span>
            )}
            <button
              type="button"
              className={styles.chipRemove}
              aria-label={t('locationSelector.remove', { name: displayName(location) })}
              onClick={(event) => {
                event.stopPropagation();
                remove(location.id);
              }}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          className={styles.input}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOption ? `${id}-option-${activeOption.id}` : undefined}
          value={query}
          disabled={isFull}
          placeholder={
            isFull
              ? t('locationSelector.maxReached')
              : value.length > 0
                ? t('locationSelector.addMore')
                : placeholder
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isOpen && (
        <ul id={listboxId} role="listbox" className={styles.listbox}>
          {options.map((location, index) => (
            <li
              key={location.id}
              id={`${id}-option-${location.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cx(styles.option, index === activeIndex && styles.activeOption)}
              // mousedown instead of click keeps focus in the input.
              onMouseDown={(event) => {
                event.preventDefault();
                select(location);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <LocationIcon location={location} className={styles.optionIcon} />
              <span className={styles.optionText}>
                <span className={styles.optionName}>
                  {displayName(location)}
                  {location.type === 'airport' && location.code && (
                    <span className={styles.optionCode}>{location.code}</span>
                  )}
                </span>
                <span className={styles.optionContext}>
                  {location.type === 'anywhere'
                    ? t('locationSelector.anywhereDescription')
                    : location.id.startsWith(TYPED_CITY_ID_PREFIX)
                      ? t('locationSelector.typedCityDescription')
                      : getLocationContext(location, language)}
                </span>
              </span>
              {location.type !== 'anywhere' && (
                <span className={styles.typeBadge}>{typeLabel(location)}</span>
              )}
            </li>
          ))}

          {options.length === 0 && (
            <li className={styles.status} role="presentation">
              {isLoading
                ? t('locationSelector.searching')
                : t('locationSelector.noResults', { query: query.trim() })}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function isContinent(location: TravelLocation): boolean {
  return location.type === 'region' && !location.parents?.length;
}

function LocationIcon({ location, className }: { location: TravelLocation; className?: string }) {
  const icon =
    location.type === 'country' && location.countryCode
      ? countryCodeToFlag(location.countryCode)
      : TYPE_ICONS[location.type];

  return (
    <span className={className} aria-hidden="true">
      {icon}
    </span>
  );
}
