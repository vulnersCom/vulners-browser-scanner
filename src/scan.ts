/**
 * Pure scanning helpers, extracted from the background service worker so they
 * can be unit-tested without the worker's chrome listeners / network bootstrap.
 * Nothing here touches `chrome`, module state, or the network.
 */
import type { Vulnerability, VulnersSearchItem, VulnersSource } from './types';

export const DOMAIN_REGEX = /http(?:s)?:\/\/(?:[\w-]+\.)*([\w-]{1,63})(?:\.(?:\w{2,18}))(?:$|\/)/i;
export const PUNYCODE_DOMAIN_REGEX = /http(?:s)?:\/\/(([\w-]{1,63})\.([\w-]{8,15}))(?:$|\/)/i;

/** Severity color buckets, index 0 = lowest score. */
export const COLORS = [
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

export const EXPLOIT_TYPES = ['exploitdb', 'githubexploit', 'packetstorm'];

/** Extract the host from a URL. Returns null when the input isn't a web URL. */
export function extractDomain(url: string): string | null {
  const matched = url.match(DOMAIN_REGEX);
  if (matched) {
    return new URL(matched[0]).host;
  }
  // `punycode` is unavailable in MV3 service workers; return the raw matched
  // host instead of decoding it (which used to throw and abort the scan).
  const puny = url.match(PUNYCODE_DOMAIN_REGEX);
  return puny ? puny[1] : null;
}

/** Highest of the CVSS score and the Vulners enchantment score. */
export function getScore(source: VulnersSource): number {
  const cvss = source.cvss?.score ?? 0;
  const enchantment = source.enchantments?.score?.value ?? 0;
  return Math.max(cvss, enchantment);
}

/** Map a numeric score (1-10) to a severity color. */
export function getScoreColor(score: number): string {
  return COLORS[Math.round(score) - 1] ?? COLORS[0];
}

/** Safely JSON-parse a stored value, falling back when missing/invalid. */
export function parseStored<T>(raw: unknown, fallback: T): T {
  try {
    return typeof raw === 'string' ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Normalize raw Vulners search results into the UI shape, sorted by score. */
export function normalizeVulnerabilities(items: VulnersSearchItem[]): Vulnerability[] {
  return items
    .map(({ _source: s }) => {
      const score = getScore(s);
      return {
        id: s.id,
        type: s.type,
        title: s.title === s.id ? s.description : s.title,
        score,
        // Color from the same max(cvss, enchantment) score, so high-enrichment
        // items with low/missing CVSS aren't shown as low severity.
        scoreColor: getScoreColor(score),
        description: s.description,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/** Whether any vulnerability is an exploit. */
export function hasExploit(vulnerabilities: Vulnerability[]): boolean {
  return vulnerabilities.some((v) => EXPLOIT_TYPES.includes(v.type));
}

/** Highest score across a list of vulnerabilities (0 when empty). */
export function maxScore(vulnerabilities: Vulnerability[]): number {
  return vulnerabilities.reduce((max, v) => Math.max(max, v.score), 0);
}

/** Read a response body as text, bounded to `maxBytes` (skips over-large bodies). */
export async function readTextUpToLimit(response: Response, maxBytes: number): Promise<string> {
  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > maxBytes) return '';

  if (!response.body) {
    const text = await response.text();
    return text.slice(0, maxBytes);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (received < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      const remaining = maxBytes - received;
      if (value.byteLength > remaining) {
        chunks.push(value.slice(0, remaining));
        received += remaining;
        await reader.cancel();
        break;
      }
      chunks.push(value);
      received += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(buffer);
}
