import type { StorageAdapter } from '@manga/storage-adapter';
import type { Settings } from '@manga/types';
import { defaultSettings } from '@manga/types';
import { action, makeObservable, observable, runInAction } from 'mobx';

export class SettingsStore {
  settings: Settings = defaultSettings;
  status: 'idle' | 'ready' = 'idle';

  private storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    makeObservable(this, {
      settings: observable,
      status: observable,
      hydrate: action,
      patch: action,
      _set: action,
    });
  }

  async hydrate(): Promise<void> {
    const fromDisk = await this.storage.settings.get();
    runInAction(() => {
      if (fromDisk) this.settings = fromDisk;
      this.status = 'ready';
    });
  }

  async patch(patch: Partial<Settings>): Promise<void> {
    const next: Settings = { ...this.settings, ...patch };
    await this.storage.settings.set(next);
    runInAction(() => {
      this.settings = next;
    });
  }

  _set(patch: Partial<Pick<SettingsStore, 'settings' | 'status'>>): void {
    Object.assign(this, patch);
  }
}
