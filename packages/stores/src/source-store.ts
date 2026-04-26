import { loadRule, loadRulePack, pickRuleForUrl } from '@manga/source-rules';
import type { StorageAdapter } from '@manga/storage-adapter';
import type { SourceRule } from '@manga/types';
import { action, makeObservable, observable, runInAction } from 'mobx';

export type SubscriptionRecord = {
  url: string;
  enabled: boolean;
  siteCount: number;
  lastSyncedAt: number | null;
};

export class SourceStore {
  rules: SourceRule[] = [];
  subscriptions: SubscriptionRecord[] = [];
  status: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  importErrors: Error[] = [];

  private storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    makeObservable(this, {
      rules: observable,
      subscriptions: observable,
      status: observable,
      importErrors: observable,
      hydrate: action,
      importRule: action,
      importPack: action,
      removeRule: action,
      _set: action,
    });
  }

  async hydrate(): Promise<void> {
    this._set({ status: 'loading' });
    try {
      const list = await this.storage.rules.list();
      runInAction(() => {
        this._set({ rules: list, status: 'ready' });
      });
    } catch (e) {
      runInAction(() => {
        this._set({ status: 'error' });
        this.importErrors = [e instanceof Error ? e : new Error(String(e))];
      });
    }
  }

  async importRule(input: unknown): Promise<SourceRule> {
    const rule = loadRule(input);
    await this.storage.rules.put(rule);
    runInAction(() => {
      const idx = this.rules.findIndex((r) => r.id === rule.id);
      if (idx >= 0) this.rules[idx] = rule;
      else this.rules.push(rule);
    });
    return rule;
  }

  async importPack(input: unknown): Promise<{ ok: number; errors: Error[] }> {
    const { rules, errors } = loadRulePack(input);
    for (const r of rules) await this.storage.rules.put(r);
    runInAction(() => {
      for (const r of rules) {
        const idx = this.rules.findIndex((x) => x.id === r.id);
        if (idx >= 0) this.rules[idx] = r;
        else this.rules.push(r);
      }
      this.importErrors = errors;
    });
    return { ok: rules.length, errors };
  }

  async removeRule(id: string): Promise<void> {
    await this.storage.rules.remove(id);
    runInAction(() => {
      this.rules = this.rules.filter((r) => r.id !== id);
    });
  }

  pickForUrl(url: string): SourceRule | null {
    return pickRuleForUrl(this.rules, url);
  }

  _set(patch: Partial<Pick<SourceStore, 'rules' | 'subscriptions' | 'status'>>): void {
    Object.assign(this, patch);
  }
}
