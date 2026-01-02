import { StorageAdapter } from './StorageAdapter';
import { Settings, PTOEntry, AppState, DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'vacatrack_settings';
const ENTRIES_KEY = 'vacatrack_entries';

export class LocalStorageAdapter implements StorageAdapter {
  async loadSettings(): Promise<Settings | null> {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return null;
      return JSON.parse(data) as Settings;
    } catch {
      return null;
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  async loadEntries(): Promise<PTOEntry[]> {
    try {
      const data = localStorage.getItem(ENTRIES_KEY);
      if (!data) return [];
      return JSON.parse(data) as PTOEntry[];
    } catch {
      return [];
    }
  }

  private async saveEntries(entries: PTOEntry[]): Promise<void> {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  async addEntry(entry: PTOEntry): Promise<void> {
    const entries = await this.loadEntries();
    entries.push(entry);
    await this.saveEntries(entries);
  }

  async updateEntry(entry: PTOEntry): Promise<void> {
    const entries = await this.loadEntries();
    const index = entries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      entries[index] = entry;
      await this.saveEntries(entries);
    }
  }

  async deleteEntry(id: string): Promise<void> {
    const entries = await this.loadEntries();
    const filtered = entries.filter(e => e.id !== id);
    await this.saveEntries(filtered);
  }

  async exportAll(): Promise<AppState> {
    const settings = await this.loadSettings();
    const entries = await this.loadEntries();
    return {
      settings: settings || DEFAULT_SETTINGS,
      entries,
    };
  }

  async importAll(state: AppState): Promise<void> {
    await this.saveSettings(state.settings);
    await this.saveEntries(state.entries);
  }
}
