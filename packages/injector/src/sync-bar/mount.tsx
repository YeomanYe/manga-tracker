import type { Manga } from '@manga/types';
import { SyncBarExpanded, SyncBarFolded } from '@manga/ui-kit';
import { useEffect, useState } from 'react';
import { type Root, createRoot } from 'react-dom/client';

export type SyncBarHost = {
  isInBookshelf(mangaId: string): Promise<boolean>;
  onAddBook(manga: Manga): Promise<void>;
  onUpdateProgress(mangaId: string, sourceId: string, chapter: number): Promise<void>;
  /**
   * Concatenated CSS text injected into the Shadow DOM root so styles stay
   * isolated from the host page. Apps bundle ui-kit styles + tokens and
   * pass them in (Plasmo via `data-text:` import, Vite via `?inline`).
   */
  styleText: string;
};

export type SyncBarInstance = {
  setManga(manga: Manga | null, chapter: number | null): void;
  destroy(): void;
};

export function createSyncBar(host: SyncBarHost): SyncBarInstance {
  const wrapper = document.createElement('div');
  wrapper.id = 'manga-tracker-sync-bar';
  wrapper.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483640;all:initial;';
  const shadow = wrapper.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = host.styleText;
  shadow.appendChild(styleEl);

  const reactRoot = document.createElement('div');
  reactRoot.className = 'uk-root';
  shadow.appendChild(reactRoot);

  document.documentElement.appendChild(wrapper);

  const root: Root = createRoot(reactRoot);
  let current: { manga: Manga | null; chapter: number | null } = { manga: null, chapter: null };

  const render = () => {
    root.render(<SyncBarApp host={host} state={current} />);
  };
  render();

  return {
    setManga(manga, chapter) {
      current = { manga, chapter };
      render();
    },
    destroy() {
      root.unmount();
      wrapper.remove();
    },
  };
}

type AppProps = {
  host: SyncBarHost;
  state: { manga: Manga | null; chapter: number | null };
};

function SyncBarApp({ host, state }: AppProps) {
  const [folded, setFolded] = useState(true);
  const [inShelf, setInShelf] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!state.manga) return;
    host.isInBookshelf(state.manga.id).then(setInShelf);
  }, [state.manga, host]);

  useEffect(() => {
    if (!state.manga || !state.chapter || !inShelf) return;
    void host.onUpdateProgress(state.manga.id, state.manga.sourceId, state.chapter);
    setToast(`已记录 第 ${state.chapter} 话`);
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [state.manga, state.chapter, inShelf, host]);

  if (!state.manga) return null;

  if (folded) {
    return (
      <button
        type="button"
        onClick={() => setFolded(false)}
        style={{ all: 'unset', cursor: 'pointer' }}
      >
        <SyncBarFolded status={inShelf ? 'in-shelf' : 'detected'} />
      </button>
    );
  }

  return (
    <SyncBarExpanded
      manga={{
        title: state.manga.title,
        initial: state.manga.title.slice(0, 1),
        chapter: state.chapter ?? 0,
      }}
      inShelf={inShelf}
      toast={toast}
      onAdd={async () => {
        if (!state.manga) return;
        await host.onAddBook(state.manga);
        setInShelf(true);
        setToast('已加入书架');
        window.setTimeout(() => setToast(null), 2000);
      }}
    />
  );
}
