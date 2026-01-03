import { LocalStorageAdapter } from './LocalStorageAdapter';
import { PostgresApiAdapter } from './PostgresApiAdapter';
import { StorageAdapter } from './StorageAdapter';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const storage: StorageAdapter = apiBaseUrl
  ? new PostgresApiAdapter(apiBaseUrl)
  : new LocalStorageAdapter();

export type { StorageAdapter } from './StorageAdapter';
