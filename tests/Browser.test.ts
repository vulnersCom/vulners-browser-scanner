import { sendMessage, v_browser } from '../src/Browser';

describe('sendMessage', () => {
  it('tags the message with the active tab id and forwards it', async () => {
    (v_browser.tabs.query as jest.Mock).mockResolvedValue([{ id: 42 }]);

    sendMessage({ action: 'landing_seen' });
    await Promise.resolve();
    await Promise.resolve();

    expect(v_browser.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'landing_seen', tab_id: 42 }),
      undefined
    );
  });

  it('passes a callback through to runtime.sendMessage', async () => {
    (v_browser.tabs.query as jest.Mock).mockResolvedValue([{ id: 7 }]);
    const cb = jest.fn();

    sendMessage({ action: 'validate_key', apiKey: 'abc' }, cb);
    await Promise.resolve();
    await Promise.resolve();

    expect(v_browser.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'validate_key', apiKey: 'abc', tab_id: 7 }),
      cb
    );
  });
});
