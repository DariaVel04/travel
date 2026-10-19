import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { parseListParam, searchParamKeys } from '@/app/paths';
import { PageHeader } from '@/components/ui/PageHeader';
import { HotelFilters } from '@/features/hotels/components/HotelFilters';
import { HotelResults } from '@/features/hotels/components/HotelResults';
import { HotelSearchForm } from '@/features/hotels/components/HotelSearchForm';
import {
  createInitialHotelFormValues,
  type HotelSearchFormValues,
  toAccommodationSearchParams,
} from '@/features/hotels/searchForm';
import type {
  AccommodationSearchParams,
  AccommodationSearchResult,
  AccommodationSearchStatus,
} from '@/features/hotels/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  refineAccommodations,
  searchAccommodations,
} from '@/services/accommodation/accommodationService';
import { resolveLocations } from '@/services/locations/locationService';
import styles from './HotelsPage.module.css';

export function HotelsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.hotels'));

  const [searchParams] = useSearchParams();
  const destinationParam = searchParams.get(searchParamKeys.destination) ?? '';
  const hasPrefill = Boolean(destinationParam);

  const [values, setValues] = useState<HotelSearchFormValues | null>(() =>
    hasPrefill ? null : createInitialHotelFormValues(),
  );
  const [status, setStatus] = useState<AccommodationSearchStatus>('idle');
  const [matches, setMatches] = useState<AccommodationSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!hasPrefill) return;
    let cancelled = false;
    void resolveLocations(parseListParam(destinationParam)).then((destinations) => {
      if (!cancelled) setValues(createInitialHotelFormValues({ destinations }));
    });
    return () => {
      cancelled = true;
    };
  }, [hasPrefill, destinationParam]);

  async function runSearch(params: AccommodationSearchParams) {
    setStatus('loading');
    try {
      const results = await searchAccommodations(params);
      setMatches(results);
      setStatus('done');
      setHasSearched(true);
    } catch {
      setStatus('error');
    }
  }

  if (!values) return <div className="container" />;

  const offers = hasSearched
    ? refineAccommodations(matches, toAccommodationSearchParams(values))
    : [];

  return (
    <div className="container">
      <PageHeader title={t('hotels.pageTitle')} subtitle={t('hotels.pageSubtitle')} />
      <HotelSearchForm
        values={values}
        onChange={setValues}
        isSearching={status === 'loading'}
        onSearch={(params) => void runSearch(params)}
      />

      <div className={styles.layout}>
        <HotelFilters values={values} onChange={setValues} />

        <HotelResults
          status={status}
          offers={offers}
          sort={values.sort}
          onSortChange={(sort) => setValues({ ...values, sort })}
          stayDates={{ startDate: values.checkIn, endDate: values.checkOut }}
          travelers={{
            adults: values.adults,
            children: values.children,
            infants: 0,
          }}
        />
      </div>
    </div>
  );
}
