import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { parseListParam, searchParamKeys } from '@/app/paths';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { AccommodationPicker } from '@/features/planner/components/AccommodationPicker';
import { PlannerForm } from '@/features/planner/components/PlannerForm';
import { TripComparison } from '@/features/planner/components/TripComparison';
import { TripOptionList } from '@/features/planner/components/TripOptionList';
import { TripOverview } from '@/features/planner/components/TripOverview';
import { TripPlanResult } from '@/features/planner/components/TripPlanResult';
import { TRIP_TYPES } from '@/features/planner/options';
import {
  createInitialPlannerValues,
  PLANNER_LOCATION_TYPES,
  type PlannerFormValues,
} from '@/features/planner/plannerForm';
import { withOptionStay } from '@/features/planner/tripOption';
import type { TripOptionDetails, TripPlan } from '@/features/planner/tripPlan';
import type { PlannerRequest } from '@/features/planner/types';
import type { AccommodationSearchResult } from '@/features/hotels/types';
import { useCurrentTrip } from '@/features/trips/tripContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { resolveLocations } from '@/services/locations/locationService';
import { tripPlanningService } from '@/services/planner/plannerService';
import type { LocationType, TravelLocation } from '@/types/location';

const PLANNER_PLACE_TYPES = new Set<LocationType>(PLANNER_LOCATION_TYPES);

type PlannerStage = 'form' | 'options' | 'compare' | 'overview' | 'stays' | 'itinerary';

export function PlannerPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.planner'));

  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get(searchParamKeys.from) ?? '';
  const destinationParam = searchParams.get(searchParamKeys.destination) ?? '';
  const tripTypeParam = searchParams.get(searchParamKeys.tripType);
  const tripType = TRIP_TYPES.find((type) => type === tripTypeParam);
  const hasPrefill = Boolean(fromParam || destinationParam);

  const [initialValues, setInitialValues] = useState<PlannerFormValues | null>(() =>
    hasPrefill ? null : createInitialPlannerValues({ tripType }),
  );
  const { applyPlanner, applyPlannerSelection, trip } = useCurrentTrip();
  const [lastRequest, setLastRequest] = useState<PlannerRequest | null>(null);
  const [variant, setVariant] = useState(0);
  const [error, setError] = useState(false);
  const [stage, setStage] = useState<PlannerStage>('form');
  const [options, setOptions] = useState<TripOptionDetails[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [opened, setOpened] = useState<TripOptionDetails | null>(null);
  const [itinerary, setItinerary] = useState<TripPlan | null>(null);
  const [stayChoices, setStayChoices] = useState<AccommodationSearchResult[]>([]);
  const [loading, setLoading] = useState<'options' | 'itinerary' | 'stays' | null>(null);

  useEffect(() => {
    if (!hasPrefill) return;
    let cancelled = false;
    void Promise.all([
      resolveLocations(parseListParam(fromParam)),
      resolveLocations(parseListParam(destinationParam)),
    ]).then(([origins, destinations]) => {
      if (cancelled) return;
      setInitialValues(
        createInitialPlannerValues({
          origins: plannerPlaces(origins, true),
          destinations: plannerPlaces(destinations, true),
          tripType,
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [hasPrefill, fromParam, destinationParam, tripType]);

  async function generateOptions(request: PlannerRequest, nextVariant = 0) {
    setLastRequest(request);
    setError(false);
    setLoading('options');
    try {
      const next = await tripPlanningService.generateTripOptions({
        request,
        selectedTransport: trip?.transport,
        selectedAccommodation: trip?.accommodation,
        variant: nextVariant,
      });
      setOptions(next);
      setSelectedIds([]);
      setOpened(null);
      setItinerary(null);
      setVariant(nextVariant);
      applyPlanner(request);
      setStage('options');
    } catch {
      setError(true);
    } finally {
      setLoading(null);
    }
  }

  function openTrip(details: TripOptionDetails) {
    setOpened(details);
    setItinerary(null);
    setStage('overview');
    if (lastRequest) applyPlannerSelection({ request: lastRequest, option: details });
  }

  async function showItinerary() {
    if (!opened || !lastRequest) return;
    setError(false);
    setLoading('itinerary');
    try {
      const plan = await tripPlanningService.generateItinerary({
        request: lastRequest,
        details: opened,
        selectedTransport: trip?.transport,
        variant,
      });
      setItinerary(plan);
      applyPlannerSelection({ request: lastRequest, option: opened, plan });
      setStage('itinerary');
    } catch {
      setError(true);
    } finally {
      setLoading(null);
    }
  }

  async function openStayPicker() {
    if (!opened || !lastRequest) return;
    setError(false);
    setLoading('stays');
    setStage('stays');
    try {
      const stays = await tripPlanningService.generateAccommodationAlternatives({
        request: lastRequest,
        details: opened,
      });
      setStayChoices(stays);
    } catch {
      setError(true);
      setStage('overview');
    } finally {
      setLoading(null);
    }
  }

  function chooseStay(stay: AccommodationSearchResult) {
    if (!opened || !lastRequest) return;
    const updated = withOptionStay(opened, stay, lastRequest.group);
    setOpened(updated);
    setOptions((current) => current.map((item) => (item.option.id === updated.option.id ? updated : item)));
    setItinerary(null);
    applyPlannerSelection({ request: lastRequest, option: updated });
    setStage('overview');
  }

  if (!initialValues) return <div className="container" />;

  return (
    <div className="container">
      <PageHeader title={t('planner.pageTitle')} subtitle={t('planner.pageSubtitle')} />
      <div hidden={stage !== 'form'}>
        <PlannerForm
          initialValues={initialValues}
          isGenerating={loading === 'options'}
          onSubmit={(request) => void generateOptions(request, 0)}
        />
      </div>

      {loading === 'options' && <Notice>{t('planner.options.finding')}</Notice>}
      {loading === 'itinerary' && <Notice>{t('planner.plan.creating')}</Notice>}

      {error && (
        <div>
          <Notice tone="warning">{t('planner.plan.error')}</Notice>
          {lastRequest && (
            <Button
              type="button"
              onClick={() => void generateOptions(lastRequest, variant)}
              disabled={loading !== null}
            >
              {t('planner.plan.retry')}
            </Button>
          )}
        </div>
      )}

      {stage === 'options' && options.length > 0 && (
        <TripOptionList
          options={options}
          selectedIds={selectedIds}
          isGenerating={loading === 'options'}
          onToggle={(id) =>
            setSelectedIds((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 5),
            )
          }
          onView={openTrip}
          onCompare={() => setStage('compare')}
          onGenerateOther={() => {
            if (lastRequest) void generateOptions(lastRequest, variant + 1);
          }}
          onEdit={() => setStage('form')}
        />
      )}

      {stage === 'compare' && (
        <TripComparison
          options={options.filter((item) => selectedIds.includes(item.option.id))}
          onView={openTrip}
          onBack={() => setStage('options')}
        />
      )}

      {stage === 'overview' && opened && (
        <TripOverview
          details={opened}
          isLoading={loading !== null}
          onChangeStay={() => void openStayPicker()}
          onShowItinerary={() => void showItinerary()}
          onBack={() => setStage('options')}
        />
      )}

      {stage === 'stays' && opened && (
        <AccommodationPicker
          stays={stayChoices}
          currentId={opened.stay.id}
          isLoading={loading === 'stays'}
          onSelect={chooseStay}
          onBack={() => setStage('overview')}
        />
      )}

      {stage === 'itinerary' && itinerary && (
        <TripPlanResult plan={itinerary} isGenerating={loading === 'itinerary'} onBack={() => setStage('overview')} />
      )}
    </div>
  );
}

function plannerPlaces(locations: TravelLocation[], allowAnywhere: boolean): TravelLocation[] {
  return locations.filter(
    (location) =>
      PLANNER_PLACE_TYPES.has(location.type) || (allowAnywhere && location.type === 'anywhere'),
  );
}
