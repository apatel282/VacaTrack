import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isWeekend,
  parseISO,
  isSameDay,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
} from 'date-fns';
import { PTOEntry, Settings } from '../types';
import { getMonthsInPeriod, getPeriodBounds } from '../utils/dateUtils';

interface CalendarViewProps {
  entries: PTOEntry[];
  settings: Settings;
  onEdit: (entry: PTOEntry) => void;
}

export function CalendarView({ entries, settings, onEdit }: CalendarViewProps) {
  const monthsInPeriod = getMonthsInPeriod(settings);
  const bounds = getPeriodBounds(settings);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (monthsInPeriod.length === 0) return new Date();
    // Start at current month if in period, otherwise first month
    const now = startOfMonth(new Date());
    const inPeriod = monthsInPeriod.find(m => isSameMonth(m, now));
    return inPeriod || monthsInPeriod[0];
  });

  const canGoBack = useMemo(() => {
    if (monthsInPeriod.length === 0) return false;
    return !isSameMonth(currentMonth, monthsInPeriod[0]);
  }, [currentMonth, monthsInPeriod]);

  const canGoForward = useMemo(() => {
    if (monthsInPeriod.length === 0) return false;
    return !isSameMonth(currentMonth, monthsInPeriod[monthsInPeriod.length - 1]);
  }, [currentMonth, monthsInPeriod]);

  const handlePrevMonth = () => {
    if (canGoBack) {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const handleNextMonth = () => {
    if (canGoForward) {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startPadding = useMemo(() => {
    const firstDay = getDay(daysInMonth[0]);
    return Array(firstDay).fill(null);
  }, [daysInMonth]);

  const getEntriesForDay = (day: Date): PTOEntry[] => {
    return entries.filter(entry => {
      const start = parseISO(entry.startDate);
      const end = parseISO(entry.endDate);
      return (
        (isSameDay(day, start) || isAfter(day, start)) &&
        (isSameDay(day, end) || isBefore(day, end))
      );
    });
  };

  if (!bounds || monthsInPeriod.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-bg-300 dark:text-bg-300 mx-auto mb-3" />
        <p className="text-text-200 dark:text-text-200">No tracking period set</p>
        <p className="text-sm text-bg-300 dark:text-bg-300 mt-1">
          Configure your period in Settings
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-100 dark:bg-bg-100 rounded-2xl p-4 shadow-sm border border-bg-300 dark:border-bg-300">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoBack}
          className="p-2 rounded-lg hover:bg-bg-200 dark:hover:bg-bg-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-text-100" />
        </button>
        <h3 className="text-lg font-semibold text-text-100 dark:text-text-100">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleNextMonth}
          disabled={!canGoForward}
          className="p-2 rounded-lg hover:bg-bg-200 dark:hover:bg-bg-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-text-100" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-text-200 dark:text-text-100/70 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding for first week */}
        {startPadding.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {daysInMonth.map((day) => {
          const dayEntries = getEntriesForDay(day);
          const isInPeriod =
            (isSameDay(day, bounds.start) || isAfter(day, bounds.start)) &&
            (isSameDay(day, bounds.end) || isBefore(day, bounds.end));
          const weekend = isWeekend(day);
          const hasUsed = dayEntries.some(e => e.type === 'used');
          const hasPlanned = dayEntries.some(e => e.type === 'planned');

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                if (dayEntries.length === 1) {
                  onEdit(dayEntries[0]);
                }
              }}
              disabled={dayEntries.length === 0}
              className={`
                aspect-square rounded-lg text-sm font-medium relative
                flex flex-col items-center justify-center
                transition-colors
                ${weekend ? 'text-text-200/50 dark:text-text-100/30' : 'text-text-100 dark:text-text-100'}
                ${!isInPeriod ? 'opacity-30' : ''}
                ${dayEntries.length > 0 ? 'cursor-pointer hover:bg-bg-200 dark:hover:bg-bg-300' : ''}
                ${hasUsed ? 'bg-accent-200 text-white' : ''}
                ${hasPlanned && !hasUsed ? 'bg-accent-100 text-accent-200 dark:bg-accent-100/30 dark:text-accent-100' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {dayEntries.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasUsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white" />
                  )}
                  {hasPlanned && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-200" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-bg-300 dark:border-bg-300">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-200" />
          <span className="text-xs text-text-200 dark:text-text-100/70">Used</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-100" />
          <span className="text-xs text-text-200 dark:text-text-100/70">Planned</span>
        </div>
      </div>
    </div>
  );
}
