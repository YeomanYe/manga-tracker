import type { BookshelfEntry, ReadingProgress, Settings, SourceRule } from '@manga/types';
import type {
  BookshelfStore,
  ProgressStore,
  SettingsStore,
  SourceRuleStore,
  StorageAdapter,
} from '../adapter';

/**
 * Capacitor SQLite adapter for the mobile app.
 *
 * V1 status: in-memory shim. Real Capacitor wiring goes here once the
 * mobile app is running on a device — `@capacitor-community/sqlite` plus
 * one CREATE TABLE migration per store. Same StorageAdapter contract as
 * IndexedDBAdapter so swap is a one-liner.
 */
export class CapacitorSQLiteAdapter implements StorageAdapter {
  private mem = {
    bookshelf: new Map<string, BookshelfEntry>(),
    progress: new Map<string, ReadingProgress>(),
    rules: new Map<string, SourceRule>(),
    settings: null as Settings | null,
  };
  bookshelf: BookshelfStore;
  progress: ProgressStore;
  rules: SourceRuleStore;
  settings: SettingsStore;

  constructor() {
    const mem = this.mem;
    this.bookshelf = {
      list: async () =>
        [...mem.bookshelf.values()].sort((a, b) => (b.lastReadAt ?? 0) - (a.lastReadAt ?? 0)),
      get: async (id) => mem.bookshelf.get(id) ?? null,
      put: async (e) => {
        mem.bookshelf.set(e.manga.id, e);
      },
      remove: async (id) => {
        mem.bookshelf.delete(id);
      },
    };
    this.progress = {
      get: async (mangaId, sourceId) => mem.progress.get(`${mangaId}::${sourceId}`) ?? null,
      put: async (p) => {
        mem.progress.set(`${p.mangaId}::${p.sourceId}`, p);
      },
      recent: async (limit) =>
        [...mem.progress.values()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit),
    };
    this.rules = {
      list: async () => [...mem.rules.values()],
      put: async (r) => {
        mem.rules.set(r.id, r);
      },
      remove: async (id) => {
        mem.rules.delete(id);
      },
      clear: async () => {
        mem.rules.clear();
      },
    };
    this.settings = {
      get: async () => mem.settings,
      set: async (s) => {
        mem.settings = s;
      },
    };
  }

  async ready(): Promise<void> {
    // TODO(mobile): wire @capacitor-community/sqlite, create tables, migrate.
  }
}
