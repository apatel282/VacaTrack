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
        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No tracking period set</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Configure your period in Settings
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleNextMonth}
          disabled={!canGoForward}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
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
                ${weekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}
                ${!isInPeriod ? 'opacity-30' : ''}
                ${dayEntries.length > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                ${hasUsed ? 'bg-primary-100 dark:bg-primary-900/50' : ''}
                ${hasPlanned && !hasUsed ? 'bg-primary-50 dark:bg-primary-900/30' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {dayEntries.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasUsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                  {hasPlanned && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-300" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Used</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-300" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Planned</span>
        </div>
      </div>
    </div>
  );
}
