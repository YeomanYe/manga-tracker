import { IndexedDBAdapter } from '@manga/storage-adapter';
import { RootStore } from '@manga/stores';

/**
 * Each extension surface (popup / options / content / background) lazily
 * gets its own RootStore + IndexedDBAdapter. Reads from disk are cheap.
 *
 * Writes should ideally funnel through the background SW so we don't
 * race on IndexedDB. V1 is "everyone writes their own" — fine for single
 * user. Cross-surface broadcast comes in V2 via chrome.runtime messaging.
 */
let cached: Promise<RootStore> | null = null;

export function getStore(): Promise<RootStore> {
  if (!cached) {
    cached = (async () => {
      const adapter = new IndexedDBAdapter();
      const store = new RootStore(adapter);
      await store.hydrate();
      return store;
    })();
  }
  return cached;
}
