/**
 * Selector executor. Supports CSS, attribute extraction, and regex.
 * Syntax:
 *   "h1.title"            → text content of element
 *   "img.cover@src"       → 'src' attribute of element
 *   "regex:第(\\d+)话"    → first capture group from input string (URL or text)
 *
 * @JS prefix support is intentionally V2 (sandboxed eval needed).
 */

export type SelectorContext = {
  doc: Document;
  url: string;
};

export function runSelector(selector: string, ctx: SelectorContext): string | null {
  if (selector.startsWith('regex:')) {
    return runRegex(selector.slice(6), ctx.url);
  }
  return runCss(selector, ctx.doc);
}

export function runSelectorAll(selector: string, ctx: SelectorContext): string[] {
  if (selector.startsWith('regex:')) {
    const single = runRegex(selector.slice(6), ctx.url);
    return single == null ? [] : [single];
  }
  const [css, attr] = parseAttr(selector);
  const nodes = ctx.doc.querySelectorAll(css);
  const out: string[] = [];
  for (const n of nodes) {
    const v = readNode(n, attr);
    if (v != null) out.push(v);
  }
  return out;
}

function runCss(selector: string, doc: Document): string | null {
  const [css, attr] = parseAttr(selector);
  const el = doc.querySelector(css);
  if (!el) return null;
  return readNode(el, attr);
}

function parseAttr(selector: string): [string, string | null] {
  const at = selector.lastIndexOf('@');
  if (at < 0) return [selector, null];
  return [selector.slice(0, at), selector.slice(at + 1)];
}

function readNode(node: Element, attr: string | null): string | null {
  if (attr == null) return node.textContent?.trim() ?? null;
  return node.getAttribute(attr);
}

function runRegex(pattern: string, input: string): string | null {
  try {
    const re = new RegExp(pattern);
    const m = re.exec(input);
    if (!m) return null;
    return m[1] ?? m[0];
  } catch {
    return null;
  }
}

export function regexTest(pattern: string, input: string): boolean {
  try {
    return new RegExp(pattern).test(input);
  } catch {
    return false;
  }
}
