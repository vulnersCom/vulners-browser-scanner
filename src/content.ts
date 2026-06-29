/**
 * Content script: asks the worker for fingerprint rules, matches them against
 * the page HTML, and reports detections back to the worker for lookup.
 */
import type { Match, Rule } from './types';

chrome.runtime.sendMessage({ action: 'get_regexp' }, (rules: Rule[]) => {
  const html = document.documentElement.innerHTML;
  const matches: Match[] = [];

  for (const rule of rules) {
    try {
      const match = html.match(new RegExp(rule.regex));
      if (match) {
        console.warn('[VULNERS] Match', rule.alias, match[0], match[1]);
        matches.push({ url: document.location.host, rule, version: match[1] });
      }
    } catch (e) {
      console.warn('[VULNERS]', e);
    }
  }

  if (matches.length) {
    chrome.runtime.sendMessage({ action: 'match', matches });
  }
});
