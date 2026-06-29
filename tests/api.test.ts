import { VulnersClient } from '../src/api';

function jsonResponse(body: unknown): Response {
  return { ok: true, status: 200, statusText: 'OK', json: async () => body } as Response;
}

describe('VulnersClient', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('compiles fingerprint rule regexes and sends the API key header', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({
        data: { rules: { nginx: { alias: 'nginx', type: 'software', regex: 'nginx/([0-9.]+)' } } },
      })
    );
    global.fetch = fetchMock;
    const rules = await new VulnersClient().getRules('rules-key');
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe('nginx');
    expect(rules[0].jsRegex).toBeInstanceOf(RegExp);

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('rules-key');
  });

  it('sends the API key in the X-Api-Key header when validating', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: { valid: true } }));
    global.fetch = fetchMock;
    await new VulnersClient().validateKey('validate-key');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('validate-key');
  });

  it('caches software lookups within the TTL', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ result: [] }));
    global.fetch = fetchMock;
    const client = new VulnersClient();
    const params = { software: 'nginx', version: '1.0.0', type: 'software', apiKey: 'k' };

    await client.scanSoftware(params);
    await client.scanSoftware(params);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    client.clearCache();
    await client.scanSoftware(params);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not cache error responses', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ result: 'error', data: { errorCode: 157 } }));
    global.fetch = fetchMock;
    const client = new VulnersClient();
    const params = { software: 'nginx', version: '1.0.0', type: 'software', apiKey: 'k' };

    await client.scanSoftware(params);
    await client.scanSoftware(params);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends the API key in the X-Api-Key header, not the request body', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ result: [] }));
    global.fetch = fetchMock;

    await new VulnersClient().scanSoftware({
      software: 'nginx',
      version: '1.0.0',
      type: 'software',
      apiKey: 'secret-key',
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('secret-key');
    expect(init.body).not.toContain('secret-key');
    expect(init.body).not.toContain('apiKey');
  });

  it('uses the v4 software audit endpoint and payload for plain software', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ result: [] }));
    global.fetch = fetchMock;

    await new VulnersClient().scanSoftware({
      software: 'nginx',
      version: '1.24.0',
      type: 'software',
      apiKey: 'key',
    });

    expect(fetchMock.mock.calls[0][0]).toContain('/api/v4/audit/software/');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.software).toEqual([{ product: 'nginx', version: '1.24.0' }]);
    expect(body.fields).toEqual(
      expect.arrayContaining(['id', 'title', 'type', 'description', 'enchantments', 'metrics'])
    );
  });

  it('maps cpe and cpe3 rule aliases into v4 audit software objects', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ result: [] }));
    global.fetch = fetchMock;
    const client = new VulnersClient();

    await client.scanSoftware({
      software: 'cpe:/a:nginx:nginx',
      version: '1.24.0',
      type: 'cpe',
      apiKey: 'key',
    });
    await client.scanSoftware({
      software: 'cpe:2.3:a:ivanti:connect_secure:*:*',
      version: '22.7',
      type: 'cpe3',
      apiKey: 'key',
    });

    const cpeBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const cpe3Body = JSON.parse(fetchMock.mock.calls[1][1].body as string);

    expect(cpeBody.software).toEqual([
      { part: 'a', vendor: 'nginx', product: 'nginx', version: '1.24.0' },
    ]);
    expect(cpe3Body.software).toEqual([
      { part: 'a', vendor: 'ivanti', product: 'connect_secure', version: '22.7' },
    ]);
  });

  it('normalizes v4 audit vulnerabilities into the existing search shape and dedupes ids', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({
        result: [
          {
            vulnerabilities: [
              {
                id: 'CVE-1',
                type: 'cve',
                title: 'first',
                description: 'desc',
                metrics: { cvss: { score: 7.5 } },
              },
            ],
          },
          {
            vulnerabilities: [
              {
                id: 'CVE-1',
                type: 'cve',
                title: 'duplicate',
                description: 'duplicate desc',
                metrics: { cvss: { score: 8 } },
              },
              {
                id: 'CVE-2',
                type: 'cve',
                title: 'second',
                description: 'desc',
                metrics: { cvss: { score: 4 } },
              },
            ],
          },
        ],
      })
    );
    global.fetch = fetchMock;

    const result = await new VulnersClient().scanSoftware({
      software: 'nginx',
      version: '1.24.0',
      type: 'software',
      apiKey: 'key',
    });

    expect(result.data.search?.map((item) => item._source.id)).toEqual(['CVE-1', 'CVE-2']);
    expect(result.data.search?.[0]._source.title).toBe('duplicate');
  });

  it('retries with backoff then succeeds', async () => {
    jest.useFakeTimers();
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(jsonResponse({ data: { valid: true } }));
    global.fetch = fetchMock;

    const promise = new VulnersClient({ retries: 3 }).validateKey('key');
    await jest.advanceTimersByTimeAsync(1000);
    await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting retries', async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn().mockRejectedValue(new Error('network'));
    global.fetch = fetchMock;

    const promise = new VulnersClient({ retries: 2 }).validateKey('key');
    const assertion = expect(promise).rejects.toThrow('network');
    await jest.advanceTimersByTimeAsync(1000 + 2000);
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('throws on non-ok HTTP responses', async () => {
    jest.useFakeTimers();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' } as Response);

    const promise = new VulnersClient({ retries: 0 }).validateKey('key');
    const assertion = expect(promise).rejects.toThrow(/500/);
    await jest.advanceTimersByTimeAsync(0);
    await assertion;
  });
});
