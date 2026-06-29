/**
 * Centralized shared types for the Vulners browser scanner.
 *
 * Per the modernization target (vulners-lookup), request/response and storage
 * contracts live in a single module so the popup, background service worker,
 * and content script share one source of truth.
 */

/* ------------------------------------------------------------------ *
 * Domain model
 * ------------------------------------------------------------------ */

/** Severity color buckets used to decorate the action badge and result UI. */
export type ScoreColor = string;

/** A single Vulners result, normalized for rendering. */
export interface Vulnerability {
  id: string;
  type: string;
  title: string;
  score: number;
  scoreColor: ScoreColor;
  description: string;
  exploit?: boolean;
}

/** One detected software fingerprint and its looked-up vulnerabilities. */
export interface SoftwareEntry {
  software: string;
  version: string;
  vulnerabilities: Vulnerability[];
  score?: number;
  scoreColor?: ScoreColor;
  exploit?: boolean;
}

/** Per-host scan record. */
export interface HostData {
  name: string;
  software: Record<string, SoftwareEntry>;
  vulnerable: boolean;
  exploit?: boolean;
}

/** Host-keyed scan store kept by the background worker. */
export type DataMap = Record<string, HostData>;

/** Scan counters surfaced in the popup. */
export interface ScanStat {
  scanned: number;
  vulnerable: number;
}

/** A fingerprint detection rule received from the Vulners rules endpoint. */
export interface Rule {
  name: string;
  alias: string;
  type: string;
  regex: string;
  /** Precompiled form of `regex`, attached after the rule is received. */
  jsRegex?: RegExp;
}

/** A content-script fingerprint match reported to the worker. */
export interface Match {
  url: string;
  rule: Rule;
  version: string;
}

/** User-controlled settings; the API key is user-supplied and never bundled. */
export interface Settings {
  showOnlyVulnerable: boolean;
  showAllDomains: boolean;
  doExtraScan: boolean;
  apiKey: string;
  introStep: number;
  error: string;
  theme?: string;
}

/* ------------------------------------------------------------------ *
 * Vulners API wire shapes (subset we depend on)
 * ------------------------------------------------------------------ */

export interface VulnersSource {
  id: string;
  type: string;
  title: string;
  description: string;
  cvss?: { score?: number };
  metrics?: { cvss?: { score?: number }; epss?: { epss?: number } };
  enchantments?: {
    score?: { value?: number };
    dependencies?: { references?: VulnersReference[] };
  };
}

export interface VulnersReference {
  type?: string;
  idList?: string[];
}

export interface VulnersSearchItem {
  _source: VulnersSource;
}

export interface VulnersError {
  errorCode: number;
  [key: string]: unknown;
}

export interface VulnersSoftwareResponse {
  result?: string;
  data: { search?: VulnersSearchItem[] } & Partial<VulnersError>;
}

export interface VulnersAuditResult {
  vulnerabilities?: VulnersSource[];
}

export interface VulnersAuditResponse {
  result?: VulnersAuditResult[] | string;
  data?: Partial<VulnersError>;
  errorCode?: number;
}

export interface VulnersRulesResponse {
  data: { rules: Record<string, Omit<Rule, 'name' | 'jsRegex'>> };
}

export interface VulnersKeyValidationResponse {
  data: { valid?: boolean; [key: string]: unknown };
}

/* ------------------------------------------------------------------ *
 * Message-passing protocol (popup/content <-> background worker)
 * ------------------------------------------------------------------ */

/** Every message carries the originating tab id, added by `sendMessage`. */
interface WithTabId {
  tab_id?: number;
}

export type RuntimeRequest = WithTabId &
  (
    | { action: 'show_vulnerabilities' }
    | { action: 'load_settings' }
    | { action: 'get_regexp' }
    | { action: 'open_link'; url: string }
    | { action: 'change_settings'; settings: Partial<Settings> }
    | { action: 'landing_seen' }
    | { action: 'clear_data' }
    | { action: 'match'; matches: Match[] }
    | { action: 'validate_key'; apiKey: string }
  );

export type RuntimeAction = RuntimeRequest['action'];

/** Worker -> popup payload for `show_vulnerabilities`. */
export interface VulnerabilitiesResponse {
  data: HostData[];
  stat: ScanStat;
  settings: Settings;
  landingSeen: boolean;
  url: string;
}

/** Worker -> popup push messages. */
export type WorkerMessage =
  | { action: 'settings'; settings: Settings }
  | { action: 'scan_update'; response: VulnerabilitiesResponse };

/** External message from vulners.com to set the API key. */
export interface ExternalSetKeyRequest {
  action: 'set_key';
  apiKey: string;
}
