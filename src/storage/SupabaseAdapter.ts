import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageAdapter } from './StorageAdapter';
import { Settings, PTOEntry, AppState, DEFAULT_SETTINGS } from '../types';

export class SupabaseAdapter implements StorageAdapter {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async loadSettings(): Promise<Settings | null> {
    const { data, error } = await this.supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      periodStart: data.period_start_month && data.period_start_year
        ? { month: data.period_start_month, year: data.period_start_year }
        : null,
      periodEnd: data.period_end_month && data.period_end_year
        ? { month: data.period_end_month, year: data.period_end_year }
        : null,
      annualAllotment: data.annual_allotment || 0,
      theme: data.theme || 'system',
    };
  }

  async saveSettings(settings: Settings): Promise<void> {
    // Get existing settings row ID
    const { data: existing } = await this.supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    const settingsData = {
      period_start_month: settings.periodStart?.month || null,
      period_start_year: settings.periodStart?.year || null,
      period_end_month: settings.periodEnd?.month || null,
      period_end_year: settings.periodEnd?.year || null,
      annual_allotment: settings.annualAllotment,
      theme: settings.theme,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      await this.supabase
        .from('settings')
        .update(settingsData)
        .eq('id', existing.id);
    } else {
      await this.supabase
        .from('settings')
        .insert(settingsData);
    }
  }

  async loadEntries(): Promise<PTOEntry[]> {
    const { data, error } = await this.supabase
      .from('pto_entries')
      .select('*')
      .order('start_date', { ascending: false });

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      type: row.type as 'used' | 'planned',
      startDate: row.start_date,
      endDate: row.end_date,
      notes: row.notes || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async addEntry(entry: PTOEntry): Promise<void> {
    const { error } = await this.supabase
      .from('pto_entries')
      .insert({
        id: entry.id,
        type: entry.type,
        start_date: entry.startDate,
        end_date: entry.endDate,
        notes: entry.notes,
        created_at: entry.createdAt,
        updated_at: entry.updatedAt,
      });

    if (error) {
      console.error('Supabase addEntry error:', error);
      throw error;
    }
  }

  async updateEntry(entry: PTOEntry): Promise<void> {
    const { error } = await this.supabase
      .from('pto_entries')
      .update({
        type: entry.type,
        start_date: entry.startDate,
        end_date: entry.endDate,
        notes: entry.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id);

    if (error) {
      console.error('Supabase updateEntry error:', error);
      throw error;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pto_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteEntry error:', error);
      throw error;
    }
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

    // Delete all existing entries
    await this.supabase.from('pto_entries').delete().neq('id', '');

    // Insert new entries
    if (state.entries.length > 0) {
      const entries = state.entries.map(entry => ({
        id: entry.id,
        type: entry.type,
        start_date: entry.startDate,
        end_date: entry.endDate,
        notes: entry.notes,
        created_at: entry.createdAt,
        updated_at: entry.updatedAt,
      }));
      await this.supabase.from('pto_entries').insert(entries);
    }
  }
}
