import { z } from 'zod';

/**
 * Theme = a map of CSS-variable tokens. Apps apply by writing each pair to
 * `document.documentElement.style.setProperty()` at runtime.
 *
 * V1 exposes a small editable subset of all tokens — the 6 visually loadest
 * vars. The rest fall through to the underlying base theme (mode-driven).
 */
export const themeTokensSchema = z.object({
  bg: z.string(),
  bgElev: z.string(),
  text: z.string(),
  textSoft: z.string(),
  main: z.string(),
  accent: z.string(),
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export const themeSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  name: z.string().min(1),
  /** Which built-in mode this theme is closest to (drives fallback for other tokens). */
  mode: z.enum(['dark', 'light']),
  /** Whether this theme is user-editable (false for built-in presets). */
  builtin: z.boolean().default(false),
  tokens: themeTokensSchema,
});

export type Theme = z.infer<typeof themeSchema>;

/** Mapping from logical token name → underlying CSS variable name. */
export const TOKEN_VAR_MAP: Record<keyof ThemeTokens, string> = {
  bg: '--ink-bg',
  bgElev: '--ink-bg-elev',
  text: '--ink-text',
  textSoft: '--ink-text-soft',
  main: '--ink-main',
  accent: '--ink-accent',
};
