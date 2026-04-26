import { z } from 'zod';
import { mangaSchema } from './manga';

export const bookshelfEntrySchema = z.object({
  manga: mangaSchema,
  addedAt: z.number().int(),
  lastReadAt: z.number().int().nullable(),
  lastChapter: z.number().nonnegative().nullable(),
  totalChapters: z.number().nonnegative().nullable(),
  unread: z.number().nonnegative().default(0),
  /** Other source ids known for this manga (for 换源). */
  alternateSources: z.array(z.string()).default([]),
});

export type BookshelfEntry = z.infer<typeof bookshelfEntrySchema>;

export type SortKey = 'recent' | 'title' | 'added';
export type FilterKey = 'all' | 'reading' | 'finished' | 'unread';
