import { z } from 'zod';

export const chapterSchema = z.object({
  id: z.string().min(1),
  number: z.number().nonnegative(),
  title: z.string().optional(),
  url: z.string().url(),
});

export type Chapter = z.infer<typeof chapterSchema>;

export const readingProgressSchema = z.object({
  mangaId: z.string().min(1),
  sourceId: z.string().min(1),
  chapter: z.number().nonnegative(),
  page: z.number().nonnegative().optional(),
  updatedAt: z.number().int(),
});

export type ReadingProgress = z.infer<typeof readingProgressSchema>;
