/**
 * Popup-side messaging helper. Resolves the cross-browser extension API and
 * sends typed runtime messages to the background worker, tagging each with the
 * active tab id.
 */
import type { RuntimeRequest } from './types';

declare global {
  interface Window {
    browser?: typeof chrome;
  }
}

const isChrome = /google/i.test(navigator.vendor);
export const v_browser: typeof chrome = isChrome
  ? window.chrome
  : (window.browser ?? window.chrome);

export function sendMessage<R = unknown>(
  message: RuntimeRequest,
  callback?: (response: R) => void
): void {
  v_browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const tab_id = tabs[0]?.id;
    v_browser.runtime.sendMessage({ ...message, tab_id }, callback as (response: R) => void);
  });
}
