import type { BookshelfEntry, ReadingProgress, Settings, SourceRule } from '@manga/types';
import Dexie, { type Table } from 'dexie';
import type {
  BookshelfStore,
  ProgressStore,
  SettingsStore,
  SourceRuleStore,
  StorageAdapter,
} from '../adapter';

const SETTINGS_KEY = 'singleton';

class MangaTrackerDB extends Dexie {
  bookshelf!: Table<BookshelfEntry, string>;
  progress!: Table<ReadingProgress & { _id: string }, string>;
  rules!: Table<SourceRule, string>;
  settings!: Table<Settings & { _id: string }, string>;

  constructor() {
    super('manga-tracker');
    this.version(1).stores({
      bookshelf: '&manga.id, lastReadAt, addedAt',
      progress: '&_id, mangaId, updatedAt',
      rules: '&id',
      settings: '&_id',
    });
  }
}

export class IndexedDBAdapter implements StorageAdapter {
  private db = new MangaTrackerDB();
  bookshelf: BookshelfStore;
  progress: ProgressStore;
  rules: SourceRuleStore;
  settings: SettingsStore;

  constructor() {
    const db = this.db;
    this.bookshelf = {
      list: () => db.bookshelf.orderBy('lastReadAt').reverse().toArray(),
      get: async (id) => (await db.bookshelf.get(id)) ?? null,
      put: (e) => db.bookshelf.put(e).then(() => undefined),
      remove: (id) => db.bookshelf.delete(id),
    };
    this.progress = {
      get: async (mangaId, sourceId) => {
        const row = await db.progress.get(progressId(mangaId, sourceId));
        if (!row) return null;
        const { _id, ...rest } = row;
        return rest;
      },
      put: (p) =>
        db.progress.put({ ...p, _id: progressId(p.mangaId, p.sourceId) }).then(() => undefined),
      recent: async (limit) => {
        const rows = await db.progress.orderBy('updatedAt').reverse().limit(limit).toArray();
        return rows.map(({ _id: _, ...rest }) => rest);
      },
    };
    this.rules = {
      list: () => db.rules.toArray(),
      put: (r) => db.rules.put(r).then(() => undefined),
      remove: (id) => db.rules.delete(id),
      clear: () => db.rules.clear(),
    };
    this.settings = {
      get: async () => {
        const row = await db.settings.get(SETTINGS_KEY);
        if (!row) return null;
        const { _id, ...rest } = row;
        return rest;
      },
      set: (s) => db.settings.put({ ...s, _id: SETTINGS_KEY }).then(() => undefined),
    };
  }

  async ready(): Promise<void> {
    await this.db.open();
  }
}

function progressId(mangaId: string, sourceId: string): string {
  return `${mangaId}::${sourceId}`;
}
