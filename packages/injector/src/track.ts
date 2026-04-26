/**
 * URL-change tracker for SPA-style manga sites that don't reload on
 * chapter navigation. Wraps history.pushState/replaceState and listens
 * to popstate.
 */
export type UrlChangeListener = (url: string) => void;

export function watchUrlChanges(listener: UrlChangeListener): () => void {
  let last = location.href;

  const fire = () => {
    if (location.href !== last) {
      last = location.href;
      listener(last);
    }
  };

  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function (...args) {
    const r = origPush.apply(this, args);
    fire();
    return r;
  };
  history.replaceState = function (...args) {
    const r = origReplace.apply(this, args);
    fire();
    return r;
  };
  window.addEventListener('popstate', fire);

  // Also poll once a second as belt-and-suspenders for sites that bypass
  // history APIs (some manga sites use location.hash or weird tricks).
  const interval = window.setInterval(fire, 1000);

  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener('popstate', fire);
    window.clearInterval(interval);
  };
}
