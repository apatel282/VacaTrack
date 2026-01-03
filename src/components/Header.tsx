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
      className="sticky top-0 z-40 bg-bg-100/80 dark:bg-bg-100/80 backdrop-blur-md border-b border-bg-300 dark:border-bg-300"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-100 dark:text-text-100">
              VacaTrack
            </h1>
            <p className="text-sm text-text-200 dark:text-text-100/70">
              {formatPeriodDisplay(settings)}
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-bg-200 dark:hover:bg-bg-300 transition-colors"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-text-200 dark:text-text-200" />
          </button>
        </div>
      </div>
    </header>
  );
}
