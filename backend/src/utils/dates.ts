export function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export function toIsoDateTime(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function requiredIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
