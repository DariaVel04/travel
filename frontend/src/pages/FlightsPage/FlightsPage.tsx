import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { parseListParam, searchParamKeys } from '@/app/paths';
import { PageHeader } from '@/components/ui/PageHeader';
import { FlightResults, type SearchStatus } from '@/features/flights/components/FlightResults';
import { FlightSearchForm } from '@/features/flights/components/FlightSearchForm';
import {
  createInitialFormValues,
  type FlightSearchFormValues,
} from '@/features/flights/searchForm';
import type { FlightSearchParams, JourneyOffer, PassengerCounts } from '@/features/flights/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { searchJourneys } from '@/services/transport/transportSearchService';
import { resolveLocations } from '@/services/locations/locationService';

export function FlightsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.flights'));

  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get(searchParamKeys.from) ?? '';
  const toParam = searchParams.get(searchParamKeys.to) ?? '';
  const hasPrefill = Boolean(fromParam || toParam);

  // With locations in the URL, the form waits until they are resolved into full location objects.
  const [initialValues, setInitialValues] = useState<FlightSearchFormValues | null>(() =>
    hasPrefill ? null : createInitialFormValues(),
  );

  useEffect(() => {
    if (!hasPrefill) return;
    let cancelled = false;
    void Promise.all([
      resolveLocations(parseListParam(fromParam)),
      resolveLocations(parseListParam(toParam)),
    ]).then(([origins, destinations]) => {
      if (!cancelled) setInitialValues(createInitialFormValues({ origins, destinations }));
    });
    return () => {
      cancelled = true;
    };
  }, [hasPrefill, fromParam, toParam]);

  const [status, setStatus] = useState<SearchStatus>('idle');
  const [offers, setOffers] = useState<JourneyOffer[]>([]);
  const [travelers, setTravelers] = useState<PassengerCounts | undefined>();

  async function handleSearch(params: FlightSearchParams) {
    setTravelers(params.passengers);
    setStatus('loading');
    const results = await searchJourneys(params);
    setOffers(results);
    setStatus('done');
  }

  return (
    <div className="container">
      <PageHeader title={t('flights.pageTitle')} subtitle={t('flights.pageSubtitle')} />
      {initialValues && (
        <FlightSearchForm
          key={`${fromParam}|${toParam}`}
          initialValues={initialValues}
          isSearching={status === 'loading'}
          onSearch={(params) => void handleSearch(params)}
        />
      )}
      <FlightResults status={status} offers={offers} travelers={travelers} />
    </div>
  );
}
