import {
  isWeekend,
  eachDayOfInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
  max,
  min,
  isAfter,
  isBefore,
  format,
  addMonths,
  isSameMonth,
  isSameYear,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { PTOEntry, Settings } from '../types';

export function countWeekdays(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isAfter(start, end)) return 0;

  const days = eachDayOfInterval({ start, end });
  return days.filter(day => !isWeekend(day)).length;
}

export function getPeriodBounds(settings: Settings): { start: Date; end: Date } | null {
  if (!settings.periodStart || !settings.periodEnd) return null;

  const start = startOfMonth(
    new Date(settings.periodStart.year, settings.periodStart.month - 1, 1)
  );
  const end = endOfMonth(
    new Date(settings.periodEnd.year, settings.periodEnd.month - 1, 1)
  );

  return { start, end };
}

export function countWeekdaysInPeriod(
  entryStart: string,
  entryEnd: string,
  periodStart: Date,
  periodEnd: Date
): number {
  const eStart = parseISO(entryStart);
  const eEnd = parseISO(entryEnd);

  // Find overlap
  const overlapStart = max([eStart, periodStart]);
  const overlapEnd = min([eEnd, periodEnd]);

  if (isAfter(overlapStart, overlapEnd)) return 0;

  const days = eachDayOfInterval({ start: overlapStart, end: overlapEnd });
  return days.filter(day => !isWeekend(day)).length;
}

export function calculatePTOSummary(
  entries: PTOEntry[],
  settings: Settings
): {
  allotted: number;
  used: number;
  planned: number;
  remaining: number;
  projectedRemaining: number;
} {
  const bounds = getPeriodBounds(settings);

  if (!bounds) {
    return {
      allotted: settings.annualAllotment,
      used: 0,
      planned: 0,
      remaining: settings.annualAllotment,
      projectedRemaining: settings.annualAllotment,
    };
  }

  let used = 0;
  let planned = 0;

  for (const entry of entries) {
    const days = countWeekdaysInPeriod(
      entry.startDate,
      entry.endDate,
      bounds.start,
      bounds.end
    );

    if (entry.type === 'used') {
      used += days;
    } else {
      planned += days;
    }
  }

  const remaining = settings.annualAllotment - used;
  const projectedRemaining = settings.annualAllotment - used - planned;

  return {
    allotted: settings.annualAllotment,
    used,
    planned,
    remaining,
    projectedRemaining,
  };
}

export function normalizeEntryTypeByDate(entry: PTOEntry, now: Date = new Date()): PTOEntry {
  if (entry.type !== 'planned') return entry;

  const end = endOfDay(parseISO(entry.endDate));
  if (!isAfter(now, end)) return entry;

  return {
    ...entry,
    type: 'used',
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeEntriesByDate(
  entries: PTOEntry[],
  now: Date = new Date()
): { entries: PTOEntry[]; updated: PTOEntry[] } {
  const updated: PTOEntry[] = [];

  const normalized = entries.map(entry => {
    const next = normalizeEntryTypeByDate(entry, now);
    if (next !== entry) updated.push(next);
    return next;
  });

  return { entries: normalized, updated };
}

export function detectOverlaps(
  entry: { startDate: string; endDate: string; id?: string },
  existingEntries: PTOEntry[]
): PTOEntry[] {
  const newStart = parseISO(entry.startDate);
  const newEnd = parseISO(entry.endDate);

  return existingEntries.filter(existing => {
    if (entry.id && existing.id === entry.id) return false;

    const existingStart = parseISO(existing.startDate);
    const existingEnd = parseISO(existing.endDate);

    // Check for overlap: entries overlap if one starts before the other ends
    return (
      (isBefore(newStart, existingEnd) || newStart.getTime() === existingEnd.getTime()) &&
      (isAfter(newEnd, existingStart) || newEnd.getTime() === existingStart.getTime())
    );
  });
}

export function formatPeriodDisplay(settings: Settings): string {
  if (!settings.periodStart || !settings.periodEnd) {
    return 'No period set';
  }

  const startDate = new Date(settings.periodStart.year, settings.periodStart.month - 1, 1);
  const endDate = new Date(settings.periodEnd.year, settings.periodEnd.month - 1, 1);

  const startStr = format(startDate, 'MMM yyyy');
  const endStr = format(endDate, 'MMM yyyy');

  return `${startStr} – ${endStr}`;
}

export function getMonthsInPeriod(settings: Settings): Date[] {
  const bounds = getPeriodBounds(settings);
  if (!bounds) return [];

  const months: Date[] = [];
  let current = bounds.start;

  while (isBefore(current, bounds.end) || isSameMonth(current, bounds.end)) {
    months.push(startOfMonth(current));
    current = addMonths(current, 1);
  }

  return months;
}

export function isDateInPeriod(date: Date, settings: Settings): boolean {
  const bounds = getPeriodBounds(settings);
  if (!bounds) return false;

  const d = startOfDay(date);
  return (
    (isAfter(d, bounds.start) || d.getTime() === bounds.start.getTime()) &&
    (isBefore(d, bounds.end) || d.getTime() === bounds.end.getTime())
  );
}

export function formatDateForDisplay(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (startDate === endDate) {
    return format(start, 'MMM d, yyyy');
  }

  if (isSameMonth(start, end) && isSameYear(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }

  if (isSameYear(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
