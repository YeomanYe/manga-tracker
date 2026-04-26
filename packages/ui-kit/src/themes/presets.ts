import type { Theme } from '@manga/types';

/**
 * Built-in theme presets. Users always start with one of these and can
 * either pick a different preset or duplicate one into a custom theme to
 * tweak the 6 main tokens.
 */
export const BUILTIN_THEMES: Theme[] = [
  {
    id: 'inkmono-dark',
    name: 'Inkmono · 暗色（默认）',
    mode: 'dark',
    builtin: true,
    tokens: {
      bg: '#0f1419',
      bgElev: '#181d22',
      text: '#f0ece4',
      textSoft: '#a8a29e',
      main: '#c2410c',
      accent: '#eab308',
    },
  },
  {
    id: 'inkmono-light',
    name: 'Inkmono · 米白纸感',
    mode: 'light',
    builtin: true,
    tokens: {
      bg: '#f5f1ea',
      bgElev: '#fbf7ee',
      text: '#1a1612',
      textSoft: '#4a4540',
      main: '#b8390a',
      accent: '#b8860b',
    },
  },
  {
    id: 'tooling-mono',
    name: 'Tooling Mono · 工具党',
    mode: 'dark',
    builtin: true,
    tokens: {
      bg: '#0e0e10',
      bgElev: '#16161a',
      text: '#e8e8ea',
      textSoft: '#a8a8b0',
      main: '#6366f1',
      accent: '#f5a524',
    },
  },
  {
    id: 'hanji-reading',
    name: 'Hanji Reading · 温润中文阅读',
    mode: 'dark',
    builtin: true,
    tokens: {
      bg: '#1c1815',
      bgElev: '#26221d',
      text: '#f5f1e8',
      textSoft: '#a8a29e',
      main: '#b45309',
      accent: '#dc2626',
    },
  },
];

export function findTheme(id: string, customs: Theme[] = []): Theme | null {
  return [...BUILTIN_THEMES, ...customs].find((t) => t.id === id) ?? null;
}
