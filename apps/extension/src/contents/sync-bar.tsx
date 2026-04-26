import kitCss from 'data-text:@manga/ui-kit/src/styles.css';
// Plasmo / Parcel: data-text: imports return file contents as a string.
import tokensCss from 'data-text:@manga/ui-kit/src/tokens/inkmono.css';
import { startInjector } from '@manga/injector';
import type { PlasmoCSConfig } from 'plasmo';
import { getStore } from '../storage-bridge';

/**
 * Plasmo content script entry — runs on all URLs and decides at runtime
 * whether the current page matches a loaded source rule. If yes, mounts
 * the SyncBar via @manga/injector.
 *
 * V1 caveat: rule matching happens client-side per page. With many rules
 * subscribed this could be slow; V2 caches a domain → rule lookup.
 */

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  run_at: 'document_idle',
};

void main();

async function main() {
  const store = await getStore();
  const rule = store.sources.pickForUrl(location.href);
  if (!rule) return;

  startInjector({
    rule,
    host: {
      styleText: `${tokensCss}\n${kitCss}`,
      isInBookshelf: async (id) => store.bookshelf.has(id),
      onAddBook: async (manga) => {
        await store.bookshelf.add({
          manga,
          addedAt: Date.now(),
          lastReadAt: null,
          lastChapter: null,
          totalChapters: null,
          unread: 0,
          alternateSources: [],
        });
      },
      onUpdateProgress: async (mangaId, sourceId, chapter) => {
        await store.bookshelf.updateProgress({
          mangaId,
          sourceId,
          chapter,
          updatedAt: Date.now(),
        });
      },
    },
  });
}
