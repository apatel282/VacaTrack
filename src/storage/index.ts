import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SupabaseAdapter } from './SupabaseAdapter';
import { StorageAdapter } from './StorageAdapter';

// Check for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use Supabase if configured, otherwise fall back to localStorage
export const storage: StorageAdapter =
  supabaseUrl && supabaseAnonKey
    ? new SupabaseAdapter(supabaseUrl, supabaseAnonKey)
    : new LocalStorageAdapter();

export type { StorageAdapter } from './StorageAdapter';
