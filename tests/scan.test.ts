import {
  COLORS,
  extractDomain,
  getScore,
  getScoreColor,
  hasExploit,
  maxScore,
  normalizeVulnerabilities,
  parseStored,
  readTextUpToLimit,
} from '../src/scan';
import type { VulnersSearchItem } from '../src/types';

describe('extractDomain', () => {
  it('returns the host for http/https URLs', () => {
    expect(extractDomain('https://www.example.com/path?q=1')).toBe('www.example.com');
    expect(extractDomain('http://sub.example.co.uk/')).toBe('sub.example.co.uk');
  });

  it('returns null for non-web URLs', () => {
    expect(extractDomain('not a url')).toBeNull();
    expect(extractDomain('chrome://extensions')).toBeNull();
  });
});

describe('getScore', () => {
  it('takes the max of cvss and enchantment scores', () => {
    expect(
      getScore({ id: 'a', type: 'cve', title: '', description: '', cvss: { score: 7.5 } })
    ).toBe(7.5);
    expect(
      getScore({
        id: 'a',
        type: 'cve',
        title: '',
        description: '',
        metrics: { cvss: { score: 8 } },
      })
    ).toBe(8);
    expect(
      getScore({
        id: 'a',
        type: 'cve',
        title: '',
        description: '',
        cvss: { score: 3 },
        enchantments: { score: { value: 9 } },
      })
    ).toBe(9);
  });

  it('is 0 when neither score is present', () => {
    expect(getScore({ id: 'a', type: 'cve', title: '', description: '' })).toBe(0);
  });
});

describe('getScoreColor', () => {
  it('maps scores to the severity palette', () => {
    expect(getScoreColor(1)).toBe(COLORS[0]);
    expect(getScoreColor(10)).toBe(COLORS[9]);
  });

  it('falls back to the lowest color for out-of-range scores', () => {
    expect(getScoreColor(0)).toBe(COLORS[0]);
    expect(getScoreColor(99)).toBe(COLORS[0]);
  });
});

describe('parseStored', () => {
  it('parses valid JSON strings', () => {
    expect(parseStored('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns the fallback for non-strings and invalid JSON', () => {
    expect(parseStored(undefined, { ok: true })).toEqual({ ok: true });
    expect(parseStored({ already: 'object' }, [])).toEqual([]);
    expect(parseStored('{not json', 'fallback')).toBe('fallback');
  });
});

describe('normalizeVulnerabilities', () => {
  const items: VulnersSearchItem[] = [
    {
      _source: { id: 'CVE-LOW', type: 'cve', title: 'Low', description: 'low', cvss: { score: 2 } },
    },
    {
      _source: {
        id: 'GH-EXP',
        type: 'githubexploit',
        title: 'GH-EXP',
        description: 'exploit desc',
        cvss: { score: 1 },
        enchantments: { score: { value: 9.5 } },
      },
    },
  ];

  it('sorts by score descending and uses description when title equals id', () => {
    const out = normalizeVulnerabilities(items);
    expect(out.map((v) => v.id)).toEqual(['GH-EXP', 'CVE-LOW']);
    expect(out[0].title).toBe('exploit desc'); // title === id -> description
  });

  it('colors high-enrichment / low-CVSS items by the max score (finding #6)', () => {
    const out = normalizeVulnerabilities(items);
    const ghExp = out.find((v) => v.id === 'GH-EXP')!;
    expect(ghExp.score).toBe(9.5);
    expect(ghExp.scoreColor).toBe(getScoreColor(9.5)); // not getScoreColor(1)
  });

  it('marks v4 exploit references as exploitable without changing the bulletin type', () => {
    const out = normalizeVulnerabilities([
      {
        _source: {
          id: 'CVE-EXPLOIT',
          type: 'cve',
          title: 'Exploit',
          description: 'desc',
          metrics: { cvss: { score: 8 } },
          enchantments: {
            dependencies: {
              references: [{ type: 'githubexploit', idList: ['GH-1'] }],
            },
          },
        },
      },
    ]);

    expect(out[0].exploit).toBe(true);
    expect(hasExploit(out)).toBe(true);
  });
});

describe('hasExploit / maxScore', () => {
  const vulns = normalizeVulnerabilities([
    { _source: { id: 'a', type: 'cve', title: 'a', description: '', cvss: { score: 4 } } },
    { _source: { id: 'b', type: 'exploitdb', title: 'b', description: '', cvss: { score: 6 } } },
  ]);

  it('detects exploit types', () => {
    expect(hasExploit(vulns)).toBe(true);
  });

  it('returns the highest score (0 when empty)', () => {
    expect(maxScore(vulns)).toBe(6);
    expect(maxScore([])).toBe(0);
  });
});

describe('readTextUpToLimit', () => {
  // Minimal Response-like fake (jsdom has no Response/ReadableStream globals).
  const fakeResponse = (
    text: string,
    opts: { contentLength?: number; withBody?: boolean } = {}
  ): Response => {
    const { contentLength, withBody = true } = opts;
    const bytes = new TextEncoder().encode(text);
    let emitted = false;
    return {
      headers: {
        get: (k: string) =>
          k === 'content-length' && contentLength != null ? String(contentLength) : null,
      },
      body: withBody
        ? {
            getReader: () => ({
              read: async () =>
                emitted
                  ? { done: true, value: undefined }
                  : ((emitted = true), { done: false, value: bytes }),
              cancel: async () => undefined,
              releaseLock: () => undefined,
            }),
          }
        : null,
      text: async () => text,
    } as unknown as Response;
  };

  it('skips bodies whose content-length exceeds the limit', async () => {
    expect(await readTextUpToLimit(fakeResponse('x'.repeat(100), { contentLength: 100 }), 10)).toBe(
      ''
    );
  });

  it('truncates a streamed body to the byte limit', async () => {
    expect(await readTextUpToLimit(fakeResponse('abcdefghij'), 5)).toBe('abcde');
  });

  it('returns the whole body when under the limit', async () => {
    expect(await readTextUpToLimit(fakeResponse('abc'), 1024)).toBe('abc');
  });

  it('reads bodyless responses via text()', async () => {
    expect(await readTextUpToLimit(fakeResponse('abcdef', { withBody: false }), 3)).toBe('abc');
  });
});
