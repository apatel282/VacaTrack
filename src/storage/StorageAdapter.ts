import { Settings, PTOEntry, AppState } from '../types';

export interface StorageAdapter {
  // Settings
  loadSettings(): Promise<Settings | null>;
  saveSettings(settings: Settings): Promise<void>;

  // PTO Entries
  loadEntries(): Promise<PTOEntry[]>;
  addEntry(entry: PTOEntry): Promise<void>;
  updateEntry(entry: PTOEntry): Promise<void>;
  deleteEntry(id: string): Promise<void>;

  // Bulk operations for import/export
  exportAll(): Promise<AppState>;
  importAll(state: AppState): Promise<void>;
}
