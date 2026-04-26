import { z } from 'zod';

export const mangaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().optional(),
  cover: z.string().url().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sourceUrl: z.string().url(),
  sourceId: z.string().min(1),
});

export type Manga = z.infer<typeof mangaSchema>;
