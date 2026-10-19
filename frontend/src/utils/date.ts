import type { ISODate, ISODateTime, YearMonth } from '@/types/common';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISODate(): ISODate {
  return toISODate(new Date());
}

/** The next `count` months starting from the current one, e.g. ["2026-09", "2026-10", …]. */
export function getUpcomingMonths(count: number, from: Date = new Date()): YearMonth[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(from.getFullYear(), from.getMonth() + index, 1);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  });
}

export function formatISODate(value: ISODate, locale: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

/** Localized "Sun, October 5" style label for trip option dates. */
export function formatISODateLong(value: ISODate, locale: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatYearMonth(value: YearMonth, locale: string): string {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
}

export function formatTime(value: ISODateTime, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  );
}

/** Whole calendar days between two date-times (used for "+1" next-day arrival markers). */
export function calendarDaysBetween(start: ISODateTime, end: ISODateTime): number {
  const startDay = new Date(start.slice(0, 10));
  const endDay = new Date(end.slice(0, 10));
  return Math.round((endDay.getTime() - startDay.getTime()) / 86_400_000);
}

export function splitMinutes(totalMinutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}
