import { z } from 'zod';

/**
 * Internal SourceRule (manga-tracker-v1 native format).
 * Other wire formats (legado-v3, mihon-port) get converted to this by adapters.
 */

export const selectorSchema = z.string().min(1);

export const sourceRuleSchema = z.object({
  format: z.literal('manga-tracker-v1'),
  $schema: z.string().optional(),
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'lowercase + hyphen'),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'semver'),
  matcher: z.object({
    domains: z.array(z.string().min(1)).min(1),
  }),
  selectors: z.object({
    manga: z.object({
      title: selectorSchema,
      cover: selectorSchema.optional(),
      author: selectorSchema.optional(),
      summary: selectorSchema.optional(),
      idFromUrl: selectorSchema.optional(),
    }),
    chapter: z.object({
      list: selectorSchema.optional(),
      item: selectorSchema.optional(),
      title: selectorSchema.optional(),
      url: selectorSchema.optional(),
      number: selectorSchema,
    }),
    currentUrl: z.object({
      isMangaPage: selectorSchema,
      isChapterPage: selectorSchema,
    }),
  }),
});

export type SourceRule = z.infer<typeof sourceRuleSchema>;

/**
 * Wire formats accepted by the loader. The discriminator is `format`.
 */
export const wireFormatSchema = z.enum(['manga-tracker-v1', 'legado-v3', 'mihon-port']);
export type WireFormat = z.infer<typeof wireFormatSchema>;
