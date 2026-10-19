import type { ISODate } from '@/types/common';
import { todayISODate, toISODate } from '@/utils/date';
import type { PlannerRequest } from './types';

export function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function shiftISODate(value: ISODate, days: number): ISODate {
  return toISODate(addCalendarDays(new Date(`${value}T00:00:00`), days));
}

/** Start/end dates from the planner month + length, used by both TripPlan and Trip Assembly. */
export function resolvePlannerDates(request: PlannerRequest): { startDate: ISODate; endDate: ISODate } {
  const duration = Math.max(1, request.durationDays);
  const fromMonth = request.departureMonth
    ? new Date(`${request.departureMonth}-10T00:00:00`)
    : addCalendarDays(new Date(`${todayISODate()}T00:00:00`), 21);
  const start = Number.isNaN(fromMonth.getTime())
    ? addCalendarDays(new Date(`${todayISODate()}T00:00:00`), 21)
    : fromMonth;
  return {
    startDate: toISODate(start),
    endDate: toISODate(addCalendarDays(start, duration - 1)),
  };
}

export function travellerCount(group: PlannerRequest['group']): number {
  return group.adults + group.children + group.seniors;
}
