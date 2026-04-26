/**
 * Service Worker — message router + write coordinator.
 * V1: just keeps SW alive on storage events; popups/options/content each
 * own their own IndexedDB connection. V2 should funnel writes here to
 * avoid races.
 */
import browser from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(() => {
  console.info('[manga-tracker] background ready');
});

// Placeholder message handler for future cross-surface coordination.
browser.runtime.onMessage.addListener((message: unknown) => {
  // V1: just log + ignore. Real handler comes in V2.
  console.debug('[manga-tracker] msg', message);
  return Promise.resolve({ ok: true });
});
