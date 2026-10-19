import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { loadCurrentTrip, saveCurrentTrip } from '@/services/trips/tripStorage';
import { CurrentTripContext, type CurrentTripContextValue } from './tripContext';
import {
  addAccommodationToTrip,
  addTransportToTrip,
  applyPlannerRequestToTrip,
  applyTripPlanToTrip,
  mapPlannerDataToTrip,
  removeAccommodationFromTrip,
  removeTransportFromTrip,
} from './tripModel';
import type { Trip } from './types';

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(() => loadCurrentTrip());
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    saveCurrentTrip(trip);
  }, [trip]);

  const value = useMemo<CurrentTripContextValue>(
    () => ({
      trip,
      isOpen,
      statusMessage,
      addTransport(offer, extras) {
        const already = Boolean(trip?.transport.some((item) => item.id === offer.id));
        if (already) return false;
        setTrip((current) => addTransportToTrip(current, offer, extras));
        setStatusMessage('added');
        return true;
      },
      addAccommodation(stay, extras) {
        const already = trip?.accommodation?.id === stay.id;
        if (already) return false;
        setTrip((current) => addAccommodationToTrip(current, stay, extras));
        setStatusMessage('added');
        return true;
      },
      removeTransport(offerId) {
        setTrip((current) => (current ? removeTransportFromTrip(current, offerId) : current));
        setStatusMessage('removed');
      },
      removeAccommodation() {
        setTrip((current) => (current ? removeAccommodationFromTrip(current) : current));
        setStatusMessage('removed');
      },
      applyPlanner(request) {
        setTrip((current) => applyPlannerRequestToTrip(current, request));
      },
      applyPlannerSelection(input) {
        setTrip((current) => mapPlannerDataToTrip(current, input));
      },
      applyTripPlan(plan) {
        setTrip((current) => applyTripPlanToTrip(current, plan));
      },
      clearTrip() {
        setTrip(null);
        setStatusMessage('cleared');
      },
      hasTransport(offerId) {
        return Boolean(trip?.transport.some((item) => item.id === offerId));
      },
      hasAccommodation(stayId) {
        return trip?.accommodation?.id === stayId;
      },
      openSummary() {
        setIsOpen(true);
      },
      closeSummary() {
        setIsOpen(false);
      },
      toggleSummary() {
        setIsOpen((open) => !open);
      },
    }),
    [isOpen, statusMessage, trip],
  );

  return <CurrentTripContext.Provider value={value}>{children}</CurrentTripContext.Provider>;
}
