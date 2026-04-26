import type { SourceRule } from '@manga/types';

/**
 * legado v3 漫画书源 → manga-tracker-v1 internal model.
 *
 * legado source format (manga subset, simplified):
 *   {
 *     "format": "legado-v3",
 *     "bookSourceUrl": "https://example.com",
 *     "bookSourceName": "示例源",
 *     "bookSourceType": 2,           // 2 = manga
 *     "ruleManga": { name, author, intro, coverUrl, ... },
 *     "ruleChapter": { chapterList, name, chapterNum, chapterUrl, ... },
 *     "ruleSearch": { ... }
 *   }
 *
 * Adapter scope (V1):
 *   - Translate selector strings (legado supports CSS / @JSON / @XPath / @JS).
 *     Only CSS is supported; other prefixes throw with a clear message so
 *     the user can decide whether to skip or wait for V2.
 *   - URL pattern detection is heuristic: bookSourceUrl host is the matcher.
 *
 * Anything we can't translate is rejected — silent partial conversion
 * causes worse UX than a loud "unsupported, edit manually" error.
 */

type LegadoV3Input = {
  format: 'legado-v3';
  bookSourceUrl: string;
  bookSourceName?: string;
  bookSourceType?: number;
  ruleManga?: { name?: string; author?: string; intro?: string; coverUrl?: string };
  ruleChapter?: { chapterList?: string; name?: string; chapterNum?: string; chapterUrl?: string };
  // Other fields ignored.
};

export function fromLegadoV3(input: unknown): SourceRule {
  const x = input as LegadoV3Input;
  if (!x || x.format !== 'legado-v3') {
    throw new Error('not a legado-v3 source');
  }
  if (!x.bookSourceUrl) throw new Error('legado-v3: missing bookSourceUrl');
  if (x.bookSourceType !== 2) {
    throw new Error('legado-v3: only bookSourceType=2 (漫画) is supported');
  }

  const host = new URL(x.bookSourceUrl).host;
  const id = host.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const titleSel = expectCss('ruleManga.name', x.ruleManga?.name);
  const numberSel = expectCss('ruleChapter.chapterNum', x.ruleChapter?.chapterNum);

  const result: SourceRule = {
    format: 'manga-tracker-v1',
    id,
    name: x.bookSourceName ?? host,
    version: '1.0.0',
    matcher: { domains: [host] },
    selectors: {
      manga: {
        title: titleSel,
        author: maybeCss(x.ruleManga?.author),
        cover: maybeCss(x.ruleManga?.coverUrl),
        summary: maybeCss(x.ruleManga?.intro),
      },
      chapter: {
        list: maybeCss(x.ruleChapter?.chapterList),
        title: maybeCss(x.ruleChapter?.name),
        url: maybeCss(x.ruleChapter?.chapterUrl),
        number: numberSel,
      },
      currentUrl: {
        // legado doesn't carry URL discriminators; users should edit after import.
        // Default to permissive matchers; loader's matcher.domains still gates.
        isMangaPage: 'regex:.*',
        isChapterPage: 'regex:.*',
      },
    },
  };
  // strip optional undefined fields for cleanliness
  return JSON.parse(JSON.stringify(result));
}

function maybeCss(s: string | undefined): string | undefined {
  if (!s) return undefined;
  return expectCss('selector', s);
}

function expectCss(field: string, s: string | undefined): string {
  if (!s) throw new Error(`legado-v3: ${field} is required`);
  if (s.startsWith('@JS:') || s.startsWith('@JSON:') || s.startsWith('@XPath:')) {
    throw new Error(`legado-v3: ${field} uses ${s.split(':')[0]} prefix, V1 supports CSS only`);
  }
  return s;
}
