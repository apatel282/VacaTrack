export interface Settings {
  periodStart: { month: number; year: number } | null;
  periodEnd: { month: number; year: number } | null;
  annualAllotment: number;
  theme: 'light' | 'dark' | 'system';
}

export interface PTOEntry {
  id: string;
  type: 'used' | 'planned';
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  notes: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface AppState {
  settings: Settings;
  entries: PTOEntry[];
}

export const DEFAULT_SETTINGS: Settings = {
  periodStart: null,
  periodEnd: null,
  annualAllotment: 0,
  theme: 'system',
};
