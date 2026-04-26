import type { SourceRule } from '@manga/types';
import { fromLegadoV3 } from './adapters/legado-v3';
import { fromMangaTrackerV1 } from './adapters/manga-tracker-v1';
import { fromMihonPort } from './adapters/mihon-port';

/**
 * Detect wire format and route to the right adapter.
 * All input must declare `format`. Missing/unknown format → error,
 * never guess.
 */
export function loadRule(input: unknown): SourceRule {
  if (typeof input !== 'object' || input === null) {
    throw new Error('source rule must be an object');
  }
  const format = (input as { format?: unknown }).format;
  switch (format) {
    case 'manga-tracker-v1':
      return fromMangaTrackerV1(input);
    case 'legado-v3':
      return fromLegadoV3(input);
    case 'mihon-port':
      return fromMihonPort(input);
    default:
      throw new Error(
        `unknown source rule format: ${JSON.stringify(format)}. Expected one of: manga-tracker-v1 | legado-v3 | mihon-port`,
      );
  }
}

export function loadRulePack(input: unknown): { rules: SourceRule[]; errors: Error[] } {
  if (!Array.isArray(input)) {
    return { rules: [], errors: [new Error('rule pack must be an array')] };
  }
  const rules: SourceRule[] = [];
  const errors: Error[] = [];
  for (const [i, raw] of input.entries()) {
    try {
      rules.push(loadRule(raw));
    } catch (e) {
      errors.push(new Error(`rule[${i}]: ${e instanceof Error ? e.message : String(e)}`));
    }
  }
  return { rules, errors };
}

/** Find the first rule whose matcher.domains contains the URL's host. */
export function pickRuleForUrl(rules: SourceRule[], url: string): SourceRule | null {
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    return null;
  }
  return (
    rules.find((r) => r.matcher.domains.some((d) => host === d || host.endsWith(`.${d}`))) ?? null
  );
}
