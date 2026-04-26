import { type SourceRule, sourceRuleSchema } from '@manga/types';

/** Native format passes through after validation. */
export function fromMangaTrackerV1(input: unknown): SourceRule {
  return sourceRuleSchema.parse(input);
}
