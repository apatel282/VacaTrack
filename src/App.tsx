import { useState, useEffect } from 'react';
import { Plus, List, CalendarDays } from 'lucide-react';
import { storage } from './storage';
import { Settings, PTOEntry, DEFAULT_SETTINGS } from './types';
import {
  calculatePTOSummary,
  normalizeEntriesByDate,
  normalizeEntryTypeByDate,
} from './utils/dateUtils';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { Summary } from './components/Summary';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { PTOForm } from './components/PTOForm';
import { SettingsModal } from './components/SettingsModal';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';

type ViewMode = 'list' | 'calendar';

interface ToastState {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [entries, setEntries] = useState<PTOEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPTOFormOpen, setIsPTOFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PTOEntry | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useTheme(settings.theme);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [savedSettings, savedEntries] = await Promise.all([
          storage.loadSettings(),
          storage.loadEntries(),
        ]);
        if (savedSettings) setSettings(savedSettings);

        const { entries: normalized, updated } = normalizeEntriesByDate(savedEntries);
        if (updated.length > 0) {
          await Promise.all(updated.map(entry => storage.updateEntry(entry)));
        }
        setEntries(normalized);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      setEntries(prev => {
        const { entries: normalized, updated } = normalizeEntriesByDate(prev);
        if (updated.length > 0) {
          Promise.all(updated.map(entry => storage.updateEntry(entry))).catch(error => {
            console.error('Failed to update auto-converted entries:', error);
          });
        }
        return normalized;
      });
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const hasValidSettings = settings.periodStart && settings.periodEnd && settings.annualAllotment > 0;

  const summary = calculatePTOSummary(entries, settings);

  // Settings handlers
  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  // PTO Entry handlers
  const handleSaveEntry = async (entry: PTOEntry) => {
    const normalizedEntry = normalizeEntryTypeByDate(entry);
    const isEditing = entries.some(e => e.id === normalizedEntry.id);

    if (isEditing) {
      await storage.updateEntry(normalizedEntry);
      setEntries(prev => prev.map(e => e.id === normalizedEntry.id ? normalizedEntry : e));
    } else {
      await storage.addEntry(normalizedEntry);
      setEntries(prev => [...prev, normalizedEntry]);
    }
  };

  const handleDeleteEntry = async (entry: PTOEntry) => {
    // Optimistically remove
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    await storage.deleteEntry(entry.id);

    // Show toast with undo
    setToast({
      message: 'PTO entry deleted',
      action: {
        label: 'Undo',
        onClick: async () => {
          await storage.addEntry(entry);
          setEntries(prev => [...prev, entry]);
        },
      },
    });
  };

  const handleEditEntry = (entry: PTOEntry) => {
    setEditingEntry(entry);
    setIsPTOFormOpen(true);
  };

  const handleClosePTOForm = () => {
    setIsPTOFormOpen(false);
    setEditingEntry(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        {!hasValidSettings ? (
          <EmptyState
            hasSettings={false}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <Summary {...summary} />

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Calendar
              </button>
            </div>

            {/* Entry Views */}
            {viewMode === 'list' ? (
              <ListView
                entries={entries}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            ) : (
              <CalendarView
                entries={entries}
                settings={settings}
                onEdit={handleEditEntry}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      {hasValidSettings && (
        <button
          onClick={() => setIsPTOFormOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="Add PTO entry"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <PTOForm
        isOpen={isPTOFormOpen}
        onClose={handleClosePTOForm}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        existingEntries={entries}
        settings={settings}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
