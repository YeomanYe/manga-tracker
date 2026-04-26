import { type RootStore, StoreProvider, observer } from '@manga/stores';
import { OptionsPage } from '@manga/ui-kit';
import { useEffect, useState } from 'react';
import '@manga/ui-kit/styles.css';
import { getStore } from './storage-bridge';

const OptionsBody = observer(({ store }: { store: RootStore }) => {
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
  const subscriptions = store.sources.subscriptions.map((s) => ({
    format: 'legado-v3' as const,
    url: s.url,
    siteCount: s.siteCount,
    enabled: s.enabled,
  }));
  return <OptionsPage shelf={shelf} subscriptions={subscriptions} />;
});

function App() {
  const [store, setStore] = useState<RootStore | null>(null);
  useEffect(() => {
    getStore().then(setStore);
  }, []);
  if (!store) return null;
  return (
    <StoreProvider store={store}>
      <div className="uk-root" style={{ padding: 32, minHeight: '100vh' }}>
        <OptionsBody store={store} />
      </div>
    </StoreProvider>
  );
}

export default App;
