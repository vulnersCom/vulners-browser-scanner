import { VulnersClient } from '../src/api';

function jsonResponse(body: unknown): Response {
  return { ok: true, status: 200, statusText: 'OK', json: async () => body } as Response;
}

describe('VulnersClient', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('compiles fingerprint rule regexes', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        data: { rules: { nginx: { alias: 'nginx', type: 'software', regex: 'nginx/([0-9.]+)' } } },
      })
    );
    const rules = await new VulnersClient().getRules();
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe('nginx');
    expect(rules[0].jsRegex).toBeInstanceOf(RegExp);
  });

  it('caches software lookups within the TTL', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: { search: [] } }));
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
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: { search: [] } }));
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
