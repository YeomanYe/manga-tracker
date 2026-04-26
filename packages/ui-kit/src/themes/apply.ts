import { TOKEN_VAR_MAP, type Theme } from '@manga/types';

/**
 * Apply a theme to a root element by setting CSS variables.
 * Default root = document.documentElement; pass a Shadow DOM host element
 * for the SyncBar so the host page's theme isn't affected.
 *
 * Also writes `data-theme` so existing dark/light selectors keep working.
 */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme.mode;
  for (const [key, varName] of Object.entries(TOKEN_VAR_MAP) as [
    keyof typeof TOKEN_VAR_MAP,
    string,
  ][]) {
    const value = theme.tokens[key];
    if (value) root.style.setProperty(varName, value);
  }
}

/**
 * Build a CSS string with `:root { --ink-*: ... }` for theme injection
 * into a Shadow DOM (where document-level cascading doesn't reach).
 * Used by the SyncBar host to keep the bar consistent with the user's
 * picked theme.
 */
export function themeToCss(theme: Theme): string {
  const lines: string[] = [`:root, [data-theme="${theme.mode}"] {`];
  for (const [key, varName] of Object.entries(TOKEN_VAR_MAP) as [
    keyof typeof TOKEN_VAR_MAP,
    string,
  ][]) {
    const value = theme.tokens[key];
    if (value) lines.push(`  ${varName}: ${value};`);
  }
  lines.push('}');
  return lines.join('\n');
}
