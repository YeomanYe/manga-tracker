import { type SelectorContext, regexTest, runSelector, runSelectorAll } from '@manga/source-rules';
import type { Chapter, Manga, SourceRule } from '@manga/types';

export type Detection =
  | { kind: 'manga'; manga: Manga }
  | { kind: 'chapter'; manga: Manga; chapter: Chapter }
  | { kind: 'unknown' }
  | { kind: 'error'; error: Error };

export function detect(rule: SourceRule, ctx: SelectorContext): Detection {
  try {
    const isChapterPage = regexTest(extractRegex(rule.selectors.currentUrl.isChapterPage), ctx.url);
    const isMangaPage = regexTest(extractRegex(rule.selectors.currentUrl.isMangaPage), ctx.url);
    if (!isMangaPage && !isChapterPage) return { kind: 'unknown' };

    const manga = extractManga(rule, ctx);
    if (!manga) return { kind: 'unknown' };

    if (isChapterPage) {
      const chapter = extractChapter(rule, ctx);
      if (chapter) return { kind: 'chapter', manga, chapter };
    }
    return { kind: 'manga', manga };
  } catch (e) {
    return { kind: 'error', error: e instanceof Error ? e : new Error(String(e)) };
  }
}

function extractRegex(s: string): string {
  return s.startsWith('regex:') ? s.slice(6) : s;
}

function extractManga(rule: SourceRule, ctx: SelectorContext): Manga | null {
  const title = runSelector(rule.selectors.manga.title, ctx);
  if (!title) return null;
  const id = mangaIdFromUrl(rule, ctx);
  const cover = rule.selectors.manga.cover
    ? (runSelector(rule.selectors.manga.cover, ctx) ?? undefined)
    : undefined;
  const author = rule.selectors.manga.author
    ? (runSelector(rule.selectors.manga.author, ctx) ?? undefined)
    : undefined;
  const summary = rule.selectors.manga.summary
    ? (runSelector(rule.selectors.manga.summary, ctx) ?? undefined)
    : undefined;
  return {
    id: `${rule.id}:${id}`,
    title,
    author,
    cover,
    summary,
    sourceUrl: ctx.url,
    sourceId: rule.id,
  };
}

function mangaIdFromUrl(rule: SourceRule, ctx: SelectorContext): string {
  if (rule.selectors.manga.idFromUrl) {
    const v = runSelector(rule.selectors.manga.idFromUrl, ctx);
    if (v) return v;
  }
  // Fallback: last non-empty path segment.
  try {
    const u = new URL(ctx.url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? u.host;
  } catch {
    return ctx.url;
  }
}

function extractChapter(rule: SourceRule, ctx: SelectorContext): Chapter | null {
  const numberStr = runSelector(rule.selectors.chapter.number, ctx);
  const number = numberStr ? Number(numberStr) : Number.NaN;
  if (!Number.isFinite(number)) return null;
  const title = rule.selectors.chapter.title
    ? (runSelector(rule.selectors.chapter.title, ctx) ?? undefined)
    : undefined;
  return {
    id: `${rule.id}:ch:${number}`,
    number,
    title,
    url: ctx.url,
  };
}

export function listChapters(rule: SourceRule, ctx: SelectorContext): Chapter[] {
  if (!rule.selectors.chapter.list || !rule.selectors.chapter.url) return [];
  const urls = runSelectorAll(
    `${rule.selectors.chapter.list}@${rule.selectors.chapter.url.replace(/^.*@/, '')}`,
    ctx,
  );
  return urls.map((url, i) => ({
    id: `${rule.id}:list:${i}`,
    number: i + 1,
    url,
  }));
}
