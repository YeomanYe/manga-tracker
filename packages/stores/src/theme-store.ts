import type { StorageAdapter } from '@manga/storage-adapter';
import type { Theme, ThemeTokens } from '@manga/types';
import { action, makeObservable, observable, runInAction } from 'mobx';

const CUSTOM_THEMES_KEY = '__custom_themes__';

/**
 * ThemeStore — current themeId + user-defined custom themes.
 * Built-in presets live in @manga/ui-kit/themes, never persisted.
 *
 * Apply behavior:
 *   1. user picks themeId → store updates → settings.themeId persists
 *   2. apps subscribe via observer + call applyTheme() on change
 *
 * V1 scope:
 *   - 4 built-in presets
 *   - unlimited user custom themes (each ID-prefixed `custom-…`)
 *   - edits 6 main tokens; other vars fall through to data-theme defaults
 */
export class ThemeStore {
  themeId = 'inkmono-dark';
  customThemes: Theme[] = [];
  status: 'idle' | 'ready' = 'idle';

  private storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    makeObservable(this, {
      themeId: observable,
      customThemes: observable,
      status: observable,
      hydrate: action,
      setThemeId: action,
      saveCustom: action,
      removeCustom: action,
      _set: action,
    });
  }

  async hydrate(): Promise<void> {
    const settings = await this.storage.settings.get();
    // Custom themes live in the rules store under a magic id (V1 hack).
    // Cleaner home is a dedicated table — refactor when we rev the schema.
    const rules = await this.storage.rules.list();
    const blob = rules.find((r) => r.id === CUSTOM_THEMES_KEY);
    const customs = (blob as unknown as { customs?: Theme[] } | undefined)?.customs ?? [];
    runInAction(() => {
      if (settings?.themeId) this.themeId = settings.themeId;
      this.customThemes = customs;
      this.status = 'ready';
    });
  }

  async setThemeId(id: string): Promise<void> {
    runInAction(() => {
      this.themeId = id;
    });
    const current = (await this.storage.settings.get()) ?? null;
    await this.storage.settings.set({
      ...(current ?? {
        syncBar: { position: 'bottom-right', defaultFolded: true, showToast: true },
        reader: { adBlock: true, mobileCss: true },
      }),
      themeId: id,
    });
  }

  async saveCustom(
    name: string,
    tokens: ThemeTokens,
    mode: 'dark' | 'light' = 'dark',
  ): Promise<Theme> {
    const id = `custom-${slugify(name)}-${Date.now().toString(36)}`;
    const theme: Theme = { id, name, mode, builtin: false, tokens };
    runInAction(() => {
      this.customThemes.push(theme);
    });
    await this.persistCustoms();
    return theme;
  }

  async removeCustom(id: string): Promise<void> {
    runInAction(() => {
      this.customThemes = this.customThemes.filter((t) => t.id !== id);
    });
    await this.persistCustoms();
  }

  private async persistCustoms(): Promise<void> {
    // V1 hack: piggyback on the rules store with a magic id to avoid
    // adding a new table. Real schema change in V2 with migrations.
    const blob = {
      id: CUSTOM_THEMES_KEY,
      customs: this.customThemes,
    } as unknown as Parameters<typeof this.storage.rules.put>[0];
    await this.storage.rules.put(blob);
  }

  _set(patch: Partial<Pick<ThemeStore, 'themeId' | 'customThemes' | 'status'>>): void {
    Object.assign(this, patch);
  }
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'theme'
  );
}
