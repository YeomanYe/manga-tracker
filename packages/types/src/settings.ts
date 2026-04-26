import { z } from 'zod';

export const syncBarPositionSchema = z.enum([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]);
export type SyncBarPosition = z.infer<typeof syncBarPositionSchema>;

export const settingsSchema = z.object({
  /** Theme id — one of the built-in presets or a user-defined custom theme. */
  themeId: z.string().default('inkmono-dark'),
  syncBar: z.object({
    position: syncBarPositionSchema.default('bottom-right'),
    defaultFolded: z.boolean().default(true),
    showToast: z.boolean().default(true),
  }),
  reader: z.object({
    adBlock: z.boolean().default(true),
    mobileCss: z.boolean().default(true),
    userAgent: z.string().optional(),
  }),
});

export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = {
  themeId: 'inkmono-dark',
  syncBar: { position: 'bottom-right', defaultFolded: true, showToast: true },
  reader: { adBlock: true, mobileCss: true },
};
