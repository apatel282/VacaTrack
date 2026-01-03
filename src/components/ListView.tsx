import { Edit2, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { PTOEntry } from '../types';
import { formatDateRange, countWeekdays } from '../utils/dateUtils';

interface ListViewProps {
  entries: PTOEntry[];
  onEdit: (entry: PTOEntry) => void;
  onDelete: (entry: PTOEntry) => void;
}

export function ListView({ entries, onEdit, onDelete }: ListViewProps) {
  // Sort by start date descending
  const sortedEntries = [...entries].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  if (sortedEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-bg-300 dark:text-bg-300 mx-auto mb-3" />
        <p className="text-text-200 dark:text-text-200">No PTO entries yet</p>
        <p className="text-sm text-bg-300 dark:text-bg-300 mt-1">
          Add your first entry above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedEntries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onEdit={() => onEdit(entry)}
          onDelete={() => onDelete(entry)}
        />
      ))}
    </div>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: PTOEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const days = countWeekdays(entry.startDate, entry.endDate);
  const isUsed = entry.type === 'used';

  return (
    <div className="bg-bg-100 dark:bg-bg-100 rounded-xl p-4 shadow-sm border border-bg-300 dark:border-bg-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${isUsed
              ? 'bg-primary-100 dark:bg-primary-500/30'
              : 'bg-bg-200 dark:bg-bg-300'
              }`}
          >
            {isUsed ? (
              <CheckCircle className="w-5 h-5 text-accent-200 dark:text-accent-200" />
            ) : (
              <Calendar className="w-5 h-5 text-text-200 dark:text-text-200" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${isUsed
                  ? 'bg-accent-200 text-white dark:bg-accent-200 dark:text-white'
                  : 'bg-bg-200 text-text-200 dark:bg-bg-300 dark:text-text-100'
                  }`}
              >
                {isUsed ? 'Used' : 'Planned'}
              </span>
              <span className="text-sm font-semibold text-text-100">
                {days} day{days !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-text-200 dark:text-text-200 mt-1">
              {formatDateRange(entry.startDate, entry.endDate)}
            </p>
            {entry.notes && (
              <p className="text-sm text-text-200 dark:text-text-200 mt-1 truncate opacity-70">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-bg-200 dark:hover:bg-bg-300 transition-colors"
            aria-label="Edit entry"
          >
            <Edit2 className="w-4 h-4 text-text-200 dark:text-text-200" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            aria-label="Delete entry"
          >
            <Trash2 className="w-4 h-4 text-text-200 dark:text-text-200 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
