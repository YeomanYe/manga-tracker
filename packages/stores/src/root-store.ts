import type { StorageAdapter } from '@manga/storage-adapter';
import { BookshelfStore } from './bookshelf-store';
import { SettingsStore } from './settings-store';
import { SourceStore } from './source-store';

/**
 * RootStore wires per-domain stores against a single StorageAdapter.
 * Apps construct one RootStore per process (extension SW, popup, options
 * each get their own; mobile gets one).
 *
 * Note: in the extension, only the background SW should *write* state.
 * Popup/options/content read via messaging, but for V1 we stub each surface
 * with its own store hydrated from local storage. Cross-process consistency
 * comes in V2 with proper messaging-backed observable bridges.
 */
export class RootStore {
  bookshelf: BookshelfStore;
  sources: SourceStore;
  settings: SettingsStore;
  storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    this.bookshelf = new BookshelfStore(storage);
    this.sources = new SourceStore(storage);
    this.settings = new SettingsStore(storage);
  }

  async hydrate(): Promise<void> {
    await this.storage.ready();
    await Promise.all([this.bookshelf.hydrate(), this.sources.hydrate(), this.settings.hydrate()]);
  }
}
