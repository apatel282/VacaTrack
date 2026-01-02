import { Settings } from 'lucide-react';
import { Settings as SettingsType } from '../types';
import { formatPeriodDisplay } from '../utils/dateUtils';

interface HeaderProps {
  settings: SettingsType;
  onOpenSettings: () => void;
}

export function Header({ settings, onOpenSettings }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              VacaTrack
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatPeriodDisplay(settings)}
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
