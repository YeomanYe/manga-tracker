import type { BookshelfEntry, ReadingProgress, Settings, SourceRule } from '@manga/types';

export type BookshelfStore = {
  list(): Promise<BookshelfEntry[]>;
  get(mangaId: string): Promise<BookshelfEntry | null>;
  put(entry: BookshelfEntry): Promise<void>;
  remove(mangaId: string): Promise<void>;
};

export type ProgressStore = {
  get(mangaId: string, sourceId: string): Promise<ReadingProgress | null>;
  put(progress: ReadingProgress): Promise<void>;
  recent(limit: number): Promise<ReadingProgress[]>;
};

export type SourceRuleStore = {
  list(): Promise<SourceRule[]>;
  put(rule: SourceRule): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
};

export type SettingsStore = {
  get(): Promise<Settings | null>;
  set(settings: Settings): Promise<void>;
};

export type StorageAdapter = {
  bookshelf: BookshelfStore;
  progress: ProgressStore;
  rules: SourceRuleStore;
  settings: SettingsStore;
  /** Hydrate caches from disk on app start. No-op for impls that don't cache. */
  ready(): Promise<void>;
};
