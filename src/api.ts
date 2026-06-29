/**
 * Typed Vulners API client for the background service worker.
 *
 * All Vulners network access lives here (single trust boundary for the
 * user-supplied API key). Adds the resilience the modernization target
 * (vulners-lookup) has and the legacy worker lacked:
 *   - exponential backoff (3 retries: 1s / 2s / 4s) on transient failures,
 *   - a short-TTL in-memory cache for software lookups,
 *   - typed responses so callers can degrade gracefully.
 */
import type {
  Rule,
  VulnersKeyValidationResponse,
  VulnersRulesResponse,
  VulnersSoftwareResponse,
} from './types';

const UTM = 'utm_source=scanner&utm_medium=chromePlugin&utm_campaign=scan';
const RULES_URL = `https://vulners.com/api/v3/burp/rules/?${UTM}`;
const SCAN_URL = `https://vulners.com/api/v3/burp/software/?${UTM}`;
const VALIDATE_URL = 'https://vulners.com/api/v3/apiKey/valid/';

const DEFAULT_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface ScanParams {
  software: string;
  version: string;
  type: string;
  apiKey: string;
}

interface CacheEntry {
  expires: number;
  value: VulnersSoftwareResponse;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export class VulnersClient {
  private readonly retries: number;
  private readonly cacheTtlMs: number;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(options: { retries?: number; cacheTtlMs?: number } = {}) {
    this.retries = options.retries ?? DEFAULT_RETRIES;
    this.cacheTtlMs = options.cacheTtlMs ?? CACHE_TTL_MS;
  }

  /** Fetch JSON with bounded exponential-backoff retries on transient errors. */
  private async fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(input, init);
        if (!response.ok) {
          throw new Error(`Vulners request failed: ${response.status} ${response.statusText}`);
        }
        return (await response.json()) as T;
      } catch (error) {
        lastError = error;
        if (attempt < this.retries) {
          await sleep(BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]);
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Vulners request failed');
  }

  /** Fetch and precompile the fingerprint detection rules. */
  async getRules(): Promise<Rule[]> {
    const body = await this.fetchJson<VulnersRulesResponse>(RULES_URL);
    const rules: Rule[] = [];
    for (const [name, rule] of Object.entries(body.data.rules)) {
      try {
        rules.push({ ...rule, name, jsRegex: new RegExp(rule.regex) });
      } catch (error) {
        console.warn('[VULNERS] invalid rule regex', name, error);
      }
    }
    return rules;
  }

  /** Look up vulnerabilities for a software/version, cached for a short TTL. */
  async scanSoftware(params: ScanParams): Promise<VulnersSoftwareResponse> {
    const key = `${params.software}|${params.version}|${params.type}`;
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    const value = await this.fetchJson<VulnersSoftwareResponse>(SCAN_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vulners-Web-Extension/3.0',
      },
      body: JSON.stringify(params),
    });

    // Only cache successful lookups; let errors retry next time.
    if (value.result !== 'error') {
      this.cache.set(key, { expires: Date.now() + this.cacheTtlMs, value });
    }
    return value;
  }

  /** Validate a user-supplied API key. */
  async validateKey(apiKey: string): Promise<VulnersKeyValidationResponse> {
    return this.fetchJson<VulnersKeyValidationResponse>(VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyID: apiKey }),
    });
  }

  /** Clear the in-memory software-lookup cache. */
  clearCache(): void {
    this.cache.clear();
  }
}

/** Shared client instance used by the background worker. */
export const vulners = new VulnersClient();
