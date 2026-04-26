import type { Manga, SourceRule } from '@manga/types';
import { runSelector } from './runtime';

/**
 * Parse a fetched HTML page into a Manga via a SourceRule.
 * Used by the mobile "添加作品" flow: user pastes a URL, app fetches
 * the HTML (platform-specific), then this turns it into a Manga we can
 * write to the bookshelf.
 *
 * Returns null if title can't be extracted — that's our liveness signal
 * that the rule + URL aren't compatible.
 */
export function parseMangaFromHtml(html: string, url: string, rule: SourceRule): Manga | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const ctx = { doc, url };

  const title = runSelector(rule.selectors.manga.title, ctx);
  if (!title) return null;

  const id = mangaIdFromUrl(rule, ctx);
  return {
    id: `${rule.id}:${id}`,
    title,
    author: rule.selectors.manga.author
      ? (runSelector(rule.selectors.manga.author, ctx) ?? undefined)
      : undefined,
    cover: rule.selectors.manga.cover
      ? (runSelector(rule.selectors.manga.cover, ctx) ?? undefined)
      : undefined,
    summary: rule.selectors.manga.summary
      ? (runSelector(rule.selectors.manga.summary, ctx) ?? undefined)
      : undefined,
    sourceUrl: url,
    sourceId: rule.id,
  };
}

function mangaIdFromUrl(rule: SourceRule, ctx: { doc: Document; url: string }): string {
  if (rule.selectors.manga.idFromUrl) {
    const v = runSelector(rule.selectors.manga.idFromUrl, ctx);
    if (v) return v;
  }
  try {
    const u = new URL(ctx.url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? u.host;
  } catch {
    return ctx.url;
  }
}
