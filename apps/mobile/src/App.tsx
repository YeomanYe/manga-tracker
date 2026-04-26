import { parseMangaFromHtml } from '@manga/source-rules';
import { useStore } from '@manga/stores';
import {
  AddMangaPage,
  type AddMangaResolver,
  BookshelfPage,
  DetailPage,
  ReaderShellPage,
  SettingsPage,
  currentManga,
} from '@manga/ui-kit';
import { observer } from 'mobx-react-lite';
import { Navigate, Route, Routes } from 'react-router-dom';

export const App = observer(() => {
  const store = useStore();

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

  const state =
    store.bookshelf.status === 'loading'
      ? 'loading'
      : store.bookshelf.status === 'error'
        ? 'error'
        : shelf.length === 0
          ? 'empty'
          : 'normal';

  const resolve: AddMangaResolver = async (url) => {
    const rule = store.sources.pickForUrl(url);
    if (!rule) {
      try {
        return { kind: 'no-rule', host: new URL(url).host };
      } catch {
        return { kind: 'no-rule', host: url };
      }
    }
    try {
      // TODO(mobile): on Android use @capacitor/http to bypass CORS;
      // dev/web fetch will likely fail on cross-origin manga sites.
      const res = await fetch(url);
      const html = await res.text();
      const manga = parseMangaFromHtml(html, url, rule);
      if (!manga) return { kind: 'parse-failed', rule };
      return { kind: 'ok', manga, rule };
    } catch (e) {
      return { kind: 'fetch-failed', error: e instanceof Error ? e : new Error(String(e)) };
    }
  };

  return (
    <Routes>
      <Route path="/" element={<BookshelfPage shelf={shelf} state={state} />} />
      <Route
        path="/add"
        element={
          <AddMangaPage
            resolve={resolve}
            onAdd={(manga) =>
              store.bookshelf.add({
                manga,
                addedAt: Date.now(),
                lastReadAt: null,
                lastChapter: null,
                totalChapters: null,
                unread: 0,
                alternateSources: [],
              })
            }
          />
        }
      />
      {/* TODO(mobile): wire DetailPage / ReaderShellPage to real selected manga */}
      <Route path="/manga/:id" element={<DetailPage manga={currentManga} />} />
      <Route path="/read/:id/:chapter" element={<ReaderShellPage manga={currentManga} />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
});
