import type { StorageAdapter } from '@manga/storage-adapter';
import { BookshelfStore } from './bookshelf-store';
import { SettingsStore } from './settings-store';
import { SourceStore } from './source-store';
import { ThemeStore } from './theme-store';

export class RootStore {
  bookshelf: BookshelfStore;
  sources: SourceStore;
  settings: SettingsStore;
  theme: ThemeStore;
  storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    this.bookshelf = new BookshelfStore(storage);
    this.sources = new SourceStore(storage);
    this.settings = new SettingsStore(storage);
    this.theme = new ThemeStore(storage);
  }

  async hydrate(): Promise<void> {
    await this.storage.ready();
    await Promise.all([
      this.bookshelf.hydrate(),
      this.sources.hydrate(),
      this.settings.hydrate(),
      this.theme.hydrate(),
    ]);
  }
}
