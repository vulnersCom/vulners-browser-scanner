/**
 * Background service worker.
 *
 * Owns all Vulners network access (via the typed `VulnersClient`) and the
 * scan state. Content scripts and the popup talk to it only through messages.
 */
import { vulners } from './api';
import { clampLength } from './sanitize';
import type {
  DataMap,
  ExternalSetKeyRequest,
  Match,
  Rule,
  RuntimeRequest,
  ScanStat,
  Settings,
  VulnerabilitiesResponse,
  VulnersError,
  VulnersSearchItem,
  VulnersSource,
} from './types';

const storage = chrome.storage.local;
const LS_KEY_DATA = 'vulners-chrome-scanner';
const LS_KEY_STAT = 'vulners-chrome-scanner-stat';
const LS_KEY_EXTRA_DATA = 'vulners-chrome-scanner-extra-data';
const LS_KEY_SETTINGS = 'vulners-chrome-scanner-settings';

const DEFAULT_SETTINGS: Settings = {
  showOnlyVulnerable: true,
  showAllDomains: false,
  doExtraScan: true,
  apiKey: '',
  introStep: 0,
  error: '',
};

const DOMAIN_REGEX = /http(?:s)?:\/\/(?:[\w-]+\.)*([\w-]{1,63})(?:\.(?:\w{2,18}))(?:$|\/)/i;
const PUNYCODE_DOMAIN_REGEX = /http(?:s)?:\/\/(([\w-]{1,63})\.([\w-]{8,15}))(?:$|\/)/i;

const COLORS = [
  '#00c400',
  '#00e020',
  '#00f000',
  '#d1ff00',
  '#ffe000',
  '#ffcc00',
  '#ffbc10',
  '#ff9c20',
  '#ff8000',
  '#ff0000',
];

const STATIC_RESPONSE_TYPES = ['script', 'font', 'stylesheet', 'other'];
const REQUEST_TIMEOUT = 300;

let data: DataMap = {};
let stat: ScanStat = { vulnerable: 0, scanned: 0 };
let extraData: string[] = [];
let settings: Settings = { ...DEFAULT_SETTINGS };
let rules: Rule[] = [];
let landingSeen = false;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Serialize tasks and space them by at least `minIntervalMs`. */
function createThrottle(minIntervalMs: number) {
  let last = 0;
  let chain: Promise<unknown> = Promise.resolve();
  return function schedule<T>(task: () => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const wait = Math.max(0, last + minIntervalMs - Date.now());
      if (wait) await sleep(wait);
      last = Date.now();
      return task();
    };
    const result = chain.then(run);
    chain = result.catch(() => undefined);
    return result;
  };
}

const throttle = createThrottle(REQUEST_TIMEOUT);

function parseStored<T>(raw: unknown, fallback: T): T {
  try {
    return typeof raw === 'string' ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function loadState(): Promise<void> {
  const stored = await storage.get([LS_KEY_DATA, LS_KEY_STAT, LS_KEY_EXTRA_DATA, LS_KEY_SETTINGS]);
  data = parseStored<DataMap>(stored[LS_KEY_DATA], {});
  stat = parseStored<ScanStat>(stored[LS_KEY_STAT], { vulnerable: 0, scanned: 0 });
  extraData = parseStored<string[]>(stored[LS_KEY_EXTRA_DATA], []);
  settings = parseStored<Settings>(stored[LS_KEY_SETTINGS], { ...DEFAULT_SETTINGS });
}

function getCurrentTab(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({ active: true, currentWindow: true });
}

function extractDomain(url: string): string | null {
  const matched = url.match(DOMAIN_REGEX);
  if (matched) {
    return new URL(matched[0]).host;
  }
  // `punycode` is unavailable in MV3 service workers; return the raw matched
  // host instead of decoding it (which used to throw and abort the scan).
  const puny = url.match(PUNYCODE_DOMAIN_REGEX);
  return puny ? puny[1] : null;
}

function getScore(source: VulnersSource): number {
  const cvss = source.cvss?.score ?? 0;
  const enchantment = source.enchantments?.score?.value ?? 0;
  return Math.max(cvss, enchantment);
}

function getScoreColor(score: number): string {
  return COLORS[Math.round(score) - 1] ?? COLORS[0];
}

/* ------------------------------------------------------------------ *
 * Badge
 * ------------------------------------------------------------------ */

function decorateBadge(tab: chrome.tabs.Tab): void {
  if (!tab.url) return;
  const url = new URL(tab.url);
  const host = data[url.host] || data[url.hostname];
  if (!host) return;

  const software = Object.keys(host.software);
  const sLength = software.length;
  const vLength = software.filter((s) => host.software[s].vulnerabilities.length > 0).length;

  if (sLength || vLength) {
    chrome.action.setBadgeText({ text: String(vLength || sLength), tabId: tab.id });
  }
  chrome.action.setBadgeBackgroundColor({ color: host.vulnerable ? '#d35400' : '#00c400' });
  chrome.action.setTitle({
    title: host.vulnerable
      ? `Host has ${vLength} vulnerabilities`
      : sLength
        ? `Found ${sLength} software fingerprints`
        : 'Host not vulnerable',
  });
}

/* ------------------------------------------------------------------ *
 * Fingerprinting + lookup
 * ------------------------------------------------------------------ */

function findFingerprintsInHeaders(response: chrome.webRequest.WebResponseCacheDetails): void {
  const url = extractDomain(response.url);
  if (!url) return;

  if (
    settings.doExtraScan &&
    !extraData.includes(response.url) &&
    STATIC_RESPONSE_TYPES.includes(response.type)
  ) {
    extraData.push(response.url);
    void storage.set({ [LS_KEY_EXTRA_DATA]: JSON.stringify(extraData) });
    findFingerprintsInStatic(url, response.url);
  }

  const headers = (response.responseHeaders ?? []).map((r) => `${r.name}: ${r.value}`).join('\n');
  findFingerprints(url, headers);
}

function findFingerprintsInStatic(url: string, checkUrl: string): void {
  fetch(checkUrl)
    .then((r) => r.text())
    .then((body) => findFingerprints(url, checkUrl + body))
    .catch((e) => console.warn('[VULNERS] static scan failed', e));
}

function findFingerprints(url: string, content: string): void {
  for (const rule of rules) {
    if (!rule.jsRegex) continue;
    const matched = content.match(rule.jsRegex);
    const soft = data[url]?.software;
    if (!matched) continue;
    if (soft && (soft[rule.name] || soft[rule.alias])) continue;
    addMatchedFingerprint(url, rule, matched[1]);
  }
}

function addMatchedFingerprint(url: string, rule: Rule, rawVersion: string): void {
  // `rawVersion` is captured from page content; bound it before storing/sending.
  const version = clampLength(rawVersion ?? '', 64);
  if (!data[url]) {
    data[url] = { name: url, software: {}, vulnerable: false };
  }
  data[url].software[rule.name] = { software: rule.name, version, vulnerabilities: [] };
  void scanAndRecord(url, rule, version);
}

async function scanAndRecord(host: string, rule: Rule, version: string): Promise<void> {
  if (!version) {
    return addVulnerabilities(host, rule, []);
  }
  try {
    const result = await throttle(() =>
      vulners.scanSoftware({
        software: rule.alias,
        version,
        type: rule.type,
        apiKey: settings.apiKey,
      })
    );
    settings.error = '';
    if (result.result === 'error') {
      processError(result.data as VulnersError);
    } else {
      addVulnerabilities(host, rule, result.data.search ?? []);
    }
  } catch (e) {
    console.error('[VULNERS] lookup failed', e);
  }
}

function processError(error: VulnersError): void {
  if (error.errorCode === 157) {
    settings.error = 'ERROR: Check your Api Key. Follow vulners.com/license to update it';
  } else {
    console.error('[ERROR]', error);
  }
}

const EXPLOIT_TYPES = ['exploitdb', 'githubexploit', 'packetstorm'];

function addVulnerabilities(host: string, rule: Rule, items: VulnersSearchItem[]): void {
  const vulnerabilities = items
    .map(({ _source: s }) => ({
      id: s.id,
      type: s.type,
      title: s.title === s.id ? s.description : s.title,
      score: getScore(s),
      scoreColor: getScoreColor(s.cvss?.score ?? 0),
      description: s.description,
    }))
    .sort((a, b) => b.score - a.score);

  const exploit = vulnerabilities.some((v) => EXPLOIT_TYPES.includes(v.type));
  const score = vulnerabilities.reduce((max, v) => Math.max(max, v.score), 0);
  const current = data[host];
  const vulnerable = vulnerabilities.length > 0 || current.vulnerable;

  current.software[rule.name] = {
    ...current.software[rule.name],
    score,
    scoreColor: getScoreColor(score),
    vulnerabilities,
    exploit,
  };
  current.vulnerable = vulnerable;
  current.exploit = exploit;

  const domainNames = Object.keys(data);
  stat = {
    scanned: domainNames.length,
    vulnerable: domainNames.filter((name) =>
      Object.keys(data[name].software).some((soft) => data[name].software[soft].score)
    ).length,
  };

  void storage.set({
    [LS_KEY_DATA]: JSON.stringify(data),
    [LS_KEY_STAT]: JSON.stringify(stat),
  });

  void getCurrentTab().then((tabs) => {
    const tab = tabs[0];
    if (tab?.url && host === extractDomain(tab.url)) {
      decorateBadge(tab);
    }
  });
}

/* ------------------------------------------------------------------ *
 * Message handlers
 * ------------------------------------------------------------------ */

chrome.runtime.onMessage.addListener(
  (request: RuntimeRequest, sender, sendResponse: (response?: unknown) => void) => {
    switch (request.action) {
      case 'show_vulnerabilities':
        if (sender.id === chrome.runtime.id) {
          void getCurrentTab().then((tabs) => {
            const response: VulnerabilitiesResponse = {
              data: Object.values(data),
              stat,
              settings,
              landingSeen,
              url: extractDomain(tabs[0]?.url ?? '') ?? '',
            };
            sendResponse(response);
          });
        }
        return true;
      case 'load_settings':
        if (sender.id === chrome.runtime.id) {
          void getCurrentTab().then(() => sendResponse({ settings }));
        }
        return true;
      case 'get_regexp':
        sendResponse(rules);
        return true;
      case 'open_link':
        void chrome.tabs.create({ active: true, url: request.url });
        return true;
      case 'change_settings':
        Object.assign(settings, request.settings);
        void storage.set({ [LS_KEY_SETTINGS]: JSON.stringify(settings) });
        sendResponse({ settings });
        return true;
      case 'landing_seen':
        landingSeen = true;
        sendResponse(landingSeen);
        return true;
      case 'clear_data':
        data = {};
        extraData = [];
        landingSeen = false;
        stat = { vulnerable: 0, scanned: 0 };
        settings.error = '';
        void storage.set({
          [LS_KEY_DATA]: JSON.stringify(data),
          [LS_KEY_STAT]: JSON.stringify(stat),
          [LS_KEY_EXTRA_DATA]: JSON.stringify(extraData),
          [LS_KEY_SETTINGS]: JSON.stringify(settings),
        });
        void getCurrentTab().then((tabs) => sendResponse({ tab: tabs[0], data, stat }));
        return true;
      case 'match':
        request.matches.forEach((m: Match) => addMatchedFingerprint(m.url, m.rule, m.version));
        return true;
      case 'validate_key':
        vulners
          .validateKey(request.apiKey)
          .then((r) => sendResponse({ ...r.data }))
          .catch((e) => {
            console.error('[VULNERS] validate key failed', e);
            sendResponse({ valid: false });
          });
        return true;
    }
    return true;
  }
);

chrome.runtime.onMessageExternal.addListener(
  (request: ExternalSetKeyRequest, sender, sendResponse: (response?: unknown) => void) => {
    if (sender.origin !== 'https://vulners.com') {
      console.error('[EXTERNAL MESSAGE] forbidden sender', sender);
      return true;
    }
    if (request.action === 'set_key') {
      if (!request.apiKey) {
        console.error('[SET API KEY] key can not be null', request);
        return true;
      }
      settings.apiKey = request.apiKey;
      void storage.set({ [LS_KEY_SETTINGS]: JSON.stringify(settings) });
      sendResponse({ success: true });
    }
    return true;
  }
);

/* ------------------------------------------------------------------ *
 * Bootstrap
 * ------------------------------------------------------------------ */

chrome.webRequest.onCompleted.addListener(
  findFingerprintsInHeaders,
  { urls: ['http://*/*', 'https://*/*'] },
  ['responseHeaders']
);

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === 'complete') {
    chrome.action.enable(tabId);
    decorateBadge(tab);
  } else if (info.status === 'loading') {
    chrome.action.disable(tabId);
  }
});

chrome.tabs.onActivated.addListener((info) => {
  void chrome.tabs.get(info.tabId).then((tab) => decorateBadge(tab));
});

chrome.action.setBadgeBackgroundColor({ color: '#d35400' });

void (async () => {
  await loadState();
  try {
    rules = await vulners.getRules();
  } catch (e) {
    console.error('[VULNERS] failed to load rules', e);
  }
})();
