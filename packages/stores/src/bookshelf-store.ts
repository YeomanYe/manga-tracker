import type { StorageAdapter } from '@manga/storage-adapter';
import type { BookshelfEntry, ReadingProgress } from '@manga/types';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

/**
 * BookshelfStore — MobX object pattern (no decorators).
 * All observable state + actions are declared via makeObservable + annotations.
 */
export class BookshelfStore {
  entries: BookshelfEntry[] = [];
  status: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  error: Error | null = null;

  private storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    makeObservable(this, {
      entries: observable,
      status: observable,
      error: observable,
      total: computed,
      sourceCount: computed,
      hydrate: action,
      add: action,
      remove: action,
      updateProgress: action,
      _setEntries: action,
      _setStatus: action,
      _setError: action,
    });
  }

  get total(): number {
    return this.entries.length;
  }

  get sourceCount(): number {
    return new Set(this.entries.map((e) => e.manga.sourceId)).size;
  }

  async hydrate(): Promise<void> {
    this._setStatus('loading');
    try {
      const list = await this.storage.bookshelf.list();
      runInAction(() => {
        this._setEntries(list);
        this._setStatus('ready');
      });
    } catch (e) {
      runInAction(() => {
        this._setError(e instanceof Error ? e : new Error(String(e)));
        this._setStatus('error');
      });
    }
  }

  async add(entry: BookshelfEntry): Promise<void> {
    await this.storage.bookshelf.put(entry);
    runInAction(() => {
      const idx = this.entries.findIndex((e) => e.manga.id === entry.manga.id);
      if (idx >= 0) this.entries[idx] = entry;
      else this.entries.unshift(entry);
    });
  }

  async remove(mangaId: string): Promise<void> {
    await this.storage.bookshelf.remove(mangaId);
    runInAction(() => {
      this.entries = this.entries.filter((e) => e.manga.id !== mangaId);
    });
  }

  async updateProgress(progress: ReadingProgress): Promise<void> {
    await this.storage.progress.put(progress);
    runInAction(() => {
      const entry = this.entries.find((e) => e.manga.id === progress.mangaId);
      if (entry) {
        entry.lastReadAt = progress.updatedAt;
        entry.lastChapter = progress.chapter;
      }
    });
  }

  has(mangaId: string): boolean {
    return this.entries.some((e) => e.manga.id === mangaId);
  }

  // Internal mutators kept as actions so MobX can track them.
  _setEntries(list: BookshelfEntry[]): void {
    this.entries = list;
  }
  _setStatus(s: BookshelfStore['status']): void {
    this.status = s;
  }
  _setError(e: Error | null): void {
    this.error = e;
  }
}
