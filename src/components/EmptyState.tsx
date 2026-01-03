import { Settings, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  hasSettings: boolean;
  onOpenSettings: () => void;
}

export function EmptyState({ hasSettings, onOpenSettings }: EmptyStateProps) {
  if (!hasSettings) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to VacaTrack
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Set up your tracking period and PTO allotment to get started.
        </p>
        <button
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Open Settings
        </button>
      </div>
    );
  }

  return null;
}
