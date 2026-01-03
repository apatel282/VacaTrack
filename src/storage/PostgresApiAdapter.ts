import { StorageAdapter } from './StorageAdapter';
import { Settings, PTOEntry, AppState, DEFAULT_SETTINGS } from '../types';

export class PostgresApiAdapter implements StorageAdapter {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  async loadSettings(): Promise<Settings | null> {
    return this.request<Settings | null>('/api/settings');
  }

  async saveSettings(settings: Settings): Promise<void> {
    await this.request<void>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async loadEntries(): Promise<PTOEntry[]> {
    return this.request<PTOEntry[]>('/api/entries');
  }

  async addEntry(entry: PTOEntry): Promise<void> {
    await this.request<void>('/api/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateEntry(entry: PTOEntry): Promise<void> {
    await this.request<void>(`/api/entries/${encodeURIComponent(entry.id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(entry),
      }
    );
  }

  async deleteEntry(id: string): Promise<void> {
    await this.request<void>(`/api/entries/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
  }

  async exportAll(): Promise<AppState> {
    const state = await this.request<AppState>('/api/state');
    return {
      settings: state.settings || DEFAULT_SETTINGS,
      entries: state.entries || [],
    };
  }

  async importAll(state: AppState): Promise<void> {
    await this.request<void>('/api/state', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }
}
