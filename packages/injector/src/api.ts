import type { Manga, SourceRule } from '@manga/types';
import { type Detection, detect } from './detect';
import { type SyncBarHost, type SyncBarInstance, createSyncBar } from './sync-bar/mount';
import { watchUrlChanges } from './track';

export type InjectorOptions = {
  rule: SourceRule;
  host: SyncBarHost;
  /** Override doc/url (used by tests). Default uses window. */
  ctx?: { doc: Document; url: string };
};

export type InjectorInstance = {
  destroy(): void;
};

/**
 * Mount the SyncBar and start tracking URL changes.
 * Single entry point used by both the extension content script and the
 * mobile WebView wrapper.
 */
export function startInjector(opts: InjectorOptions): InjectorInstance {
  const ui = createSyncBar(opts.host);

  const refresh = () => {
    const ctx = opts.ctx ?? { doc: document, url: location.href };
    const result = detect(opts.rule, ctx);
    handleDetection(result, opts, ui);
  };

  refresh();
  const stop = watchUrlChanges(refresh);

  return {
    destroy() {
      stop();
      ui.destroy();
    },
  };
}

function handleDetection(d: Detection, _opts: InjectorOptions, ui: SyncBarInstance) {
  if (d.kind === 'manga') ui.setManga(d.manga, null);
  else if (d.kind === 'chapter') ui.setManga(d.manga, d.chapter.number);
  else ui.setManga(null, null);
}

export type { Manga };
export type { SyncBarHost, SyncBarInstance };
