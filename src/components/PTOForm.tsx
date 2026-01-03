import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { PTOEntry, Settings } from '../types';
import {
  countWeekdays,
  countWeekdaysInPeriod,
  detectOverlaps,
  getPeriodBounds,
  generateId,
  calculatePTOSummary,
} from '../utils/dateUtils';
import { format } from 'date-fns';

interface PTOFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: PTOEntry) => void;
  editingEntry: PTOEntry | null;
  existingEntries: PTOEntry[];
  settings: Settings;
}

export function PTOForm({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  existingEntries,
  settings,
}: PTOFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [type, setType] = useState<'used' | 'planned'>('planned');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setStartDate(editingEntry.startDate);
        setEndDate(editingEntry.endDate);
        setType(editingEntry.type);
        setNotes(editingEntry.notes);
      } else {
        setStartDate(today);
        setEndDate(today);
        setType('planned');
        setNotes('');
      }
    }
  }, [isOpen, editingEntry, today]);

  const bounds = getPeriodBounds(settings);

  const weekdayCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return countWeekdays(startDate, endDate);
  }, [startDate, endDate]);

  const periodWeekdayCount = useMemo(() => {
    if (!startDate || !endDate || !bounds) return weekdayCount;
    return countWeekdaysInPeriod(startDate, endDate, bounds.start, bounds.end);
  }, [startDate, endDate, bounds, weekdayCount]);

  const overlaps = useMemo(() => {
    if (!startDate || !endDate) return [];
    return detectOverlaps(
      { startDate, endDate, id: editingEntry?.id },
      existingEntries
    );
  }, [startDate, endDate, editingEntry, existingEntries]);

  const projectedImpact = useMemo(() => {
    // Calculate what projection would be with this entry
    const tempEntry: PTOEntry = {
      id: editingEntry?.id || 'temp',
      type,
      startDate,
      endDate,
      notes: '',
      createdAt: '',
      updatedAt: '',
    };

    const filteredEntries = editingEntry
      ? existingEntries.filter(e => e.id !== editingEntry.id)
      : existingEntries;

    const summary = calculatePTOSummary([...filteredEntries, tempEntry], settings);
    return summary.projectedRemaining;
  }, [startDate, endDate, type, editingEntry, existingEntries, settings]);

  const isNegativeProjection = projectedImpact < 0;
  const isValidDates = startDate && endDate && startDate <= endDate;
  const isValid = isValidDates && weekdayCount > 0;

  const handleSave = () => {
    if (!isValid) return;

    const now = new Date().toISOString();
    const entry: PTOEntry = {
      id: editingEntry?.id || generateId(),
      type,
      startDate,
      endDate,
      notes: notes.trim(),
      createdAt: editingEntry?.createdAt || now,
      updatedAt: now,
    };

    onSave(entry);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Edit PTO' : 'Add PTO'}
    >
      <div className="space-y-4">
        {/* Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setType('planned')}
              className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${type === 'planned'
                  ? 'border-accent-200 bg-accent-200 text-white'
                  : 'border-bg-300 dark:border-bg-300 text-text-200 dark:text-text-200 hover:bg-bg-100 dark:hover:bg-bg-200'
                }`}
            >
              Planned
            </button>
            <button
              onClick={() => setType('used')}
              className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${type === 'used'
                  ? 'border-accent-200 bg-accent-200 text-white'
                  : 'border-bg-300 dark:border-bg-300 text-text-200 dark:text-text-200 hover:bg-bg-100 dark:hover:bg-bg-200'
                }`}
            >
              Used
            </button>
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-100 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-100 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200"
            />
          </div>
        </div>

        {/* Day Count */}
        {isValidDates && (
          <div className="bg-bg-200 dark:bg-bg-200 rounded-lg p-3 text-center">
            <span className="text-2xl font-bold text-accent-200 dark:text-accent-200">
              {periodWeekdayCount}
            </span>
            <span className="text-text-200 dark:text-text-200 ml-2">
              PTO day{periodWeekdayCount !== 1 ? 's' : ''}
              {periodWeekdayCount !== weekdayCount && (
                <span className="text-xs"> ({weekdayCount} total, {periodWeekdayCount} in period)</span>
              )}
            </span>
          </div>
        )}

        {/* Warnings */}
        {overlaps.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              This overlaps with {overlaps.length} existing entr{overlaps.length === 1 ? 'y' : 'ies'}.
            </p>
          </div>
        )}

        {isNegativeProjection && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              This will exceed your allotment by {Math.abs(projectedImpact)} day{Math.abs(projectedImpact) !== 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200 resize-none"
            placeholder="e.g., Summer vacation"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="w-full py-3 px-4 bg-accent-200 hover:bg-accent-200/90 disabled:bg-bg-300 dark:disabled:bg-bg-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {editingEntry ? 'Save Changes' : 'Add PTO'}
        </button>
      </div>
    </Modal>
  );
}
