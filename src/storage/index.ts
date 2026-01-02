import { LocalStorageAdapter } from './LocalStorageAdapter';
import { StorageAdapter } from './StorageAdapter';

// Single instance - swap this for Supabase adapter later
export const storage: StorageAdapter = new LocalStorageAdapter();

export type { StorageAdapter } from './StorageAdapter';
