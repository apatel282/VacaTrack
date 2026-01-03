import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Modal } from './Modal';
import { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 3 + i);

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [startMonth, setStartMonth] = useState(settings.periodStart?.month || 1);
  const [startYear, setStartYear] = useState(settings.periodStart?.year || currentYear);
  const [endMonth, setEndMonth] = useState(settings.periodEnd?.month || 12);
  const [endYear, setEndYear] = useState(settings.periodEnd?.year || currentYear);
  const [allotment, setAllotment] = useState(settings.annualAllotment.toString());
  const [theme, setTheme] = useState<Settings['theme']>(settings.theme);

  useEffect(() => {
    if (isOpen) {
      setStartMonth(settings.periodStart?.month || 1);
      setStartYear(settings.periodStart?.year || currentYear);
      setEndMonth(settings.periodEnd?.month || 12);
      setEndYear(settings.periodEnd?.year || currentYear);
      setAllotment(settings.annualAllotment.toString());
      setTheme(settings.theme);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    const newSettings: Settings = {
      periodStart: { month: startMonth, year: startYear },
      periodEnd: { month: endMonth, year: endYear },
      annualAllotment: parseInt(allotment) || 0,
      theme,
    };
    onSave(newSettings);
    onClose();
  };

  const isValidPeriod = () => {
    const start = new Date(startYear, startMonth - 1);
    const end = new Date(endYear, endMonth - 1);
    return start <= end;
  };

  const isValid = isValidPeriod() && parseInt(allotment) > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        {/* Tracking Period */}
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Tracking Period Start
          </label>
          <div className="flex gap-2">
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200"
            >
              {months.map((month, i) => (
                <option key={month} value={i + 1}>{month}</option>
              ))}
            </select>
            <select
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Tracking Period End
          </label>
          <div className="flex gap-2">
            <select
              value={endMonth}
              onChange={(e) => setEndMonth(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200"
            >
              {months.map((month, i) => (
                <option key={month} value={i + 1}>{month}</option>
              ))}
            </select>
            <select
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {!isValidPeriod() && (
            <p className="mt-1 text-sm text-red-500">End date must be after start date</p>
          )}
        </div>

        {/* Annual Allotment */}
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Annual PTO Allotment (days)
          </label>
          <input
            type="number"
            min="0"
            max="365"
            value={allotment}
            onChange={(e) => setAllotment(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-bg-300 dark:border-bg-300 bg-bg-100 dark:bg-bg-100 text-text-100 dark:text-text-100 focus:ring-2 focus:ring-accent-200 focus:border-accent-200"
            placeholder="e.g., 20"
          />
          {parseInt(allotment) <= 0 && (
            <p className="mt-1 text-sm text-amber-500">Please enter your PTO allotment</p>
          )}
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Theme
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${theme === 'light'
                  ? 'border-accent-200 bg-accent-200 text-white'
                  : 'border-bg-300 dark:border-bg-300 text-text-200 dark:text-text-200 hover:bg-bg-100 dark:hover:bg-bg-200'
                }`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-sm">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${theme === 'dark'
                  ? 'border-accent-200 bg-accent-200 text-white'
                  : 'border-bg-300 dark:border-bg-300 text-text-200 dark:text-text-200 hover:bg-bg-100 dark:hover:bg-bg-200'
                }`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-sm">Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${theme === 'system'
                  ? 'border-accent-200 bg-accent-200 text-white'
                  : 'border-bg-300 dark:border-bg-300 text-text-200 dark:text-text-200 hover:bg-bg-100 dark:hover:bg-bg-200'
                }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-sm">Auto</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="w-full py-3 px-4 bg-accent-200 hover:bg-accent-200/90 disabled:bg-bg-300 dark:disabled:bg-bg-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          Save Settings
        </button>
      </div>
    </Modal>
  );
}
