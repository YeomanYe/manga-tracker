import { type RootStore, StoreProvider, observer } from '@manga/stores';
import { PopupShell } from '@manga/ui-kit';
import { useEffect, useState } from 'react';
import '@manga/ui-kit/styles.css';
import { getStore } from './storage-bridge';

const PopupBody = observer(({ store }: { store: RootStore }) => {
  const shelf = store.bookshelf.entries.map((e) => ({
    id: e.manga.id,
    title: e.manga.title,
    initial: e.manga.title.slice(0, 1),
    chapter: e.lastChapter ?? 0,
    total: e.totalChapters ?? 0,
    source: e.manga.sourceId,
    updatedLabel: e.lastReadAt ? new Date(e.lastReadAt).toLocaleDateString() : '—',
    unread: e.unread,
  }));
  // Recent reads come from store.bookshelf via lastReadAt sort.
  const recent = [...store.bookshelf.entries]
    .filter((e) => e.lastReadAt != null)
    .sort((a, b) => (b.lastReadAt ?? 0) - (a.lastReadAt ?? 0))
    .slice(0, 7)
    .map((e) => ({
      id: e.manga.id,
      title: e.manga.title,
      initial: e.manga.title.slice(0, 1),
      chapter: e.lastChapter ?? 0,
      source: e.manga.sourceId,
      whenLabel: e.lastReadAt ? new Date(e.lastReadAt).toLocaleString() : '',
    }));

  const state =
    store.bookshelf.status === 'loading'
      ? 'loading'
      : store.bookshelf.status === 'error'
        ? 'error'
        : shelf.length === 0
          ? 'empty'
          : 'normal';

  return <PopupShell shelf={shelf} recent={recent} state={state} defaultTab="shelf" />;
});

function App() {
  const [store, setStore] = useState<RootStore | null>(null);
  useEffect(() => {
    getStore().then(setStore);
  }, []);
  if (!store) return <div style={{ padding: 24, color: '#a8a29e' }}>Loading…</div>;
  return (
    <StoreProvider store={store}>
      <div className="uk-root" style={{ width: 360, height: 500 }}>
        <PopupBody store={store} />
      </div>
    </StoreProvider>
  );
}

export default App;
