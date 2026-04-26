import { useStore } from '@manga/stores';
import {
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

  return (
    <Routes>
      <Route path="/" element={<BookshelfPage shelf={shelf} state={state} />} />
      {/* TODO(mobile): wire DetailPage / ReaderShellPage to real selected manga */}
      <Route path="/manga/:id" element={<DetailPage manga={currentManga} />} />
      <Route path="/read/:id/:chapter" element={<ReaderShellPage manga={currentManga} />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
});
