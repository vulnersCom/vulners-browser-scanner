import { sendMessage } from '../src/Browser';
import { useSettingsStore } from '../src/stores/Settings';
import { useDataStore } from '../src/stores/Data';
import type { VulnerabilitiesResponse } from '../src/types';

jest.mock('../src/Browser', () => ({ sendMessage: jest.fn() }));

const send = sendMessage as jest.Mock;

beforeEach(() => {
  send.mockReset();
  useSettingsStore.setState({
    open: false,
    showOnlyVulnerable: false,
    showAllDomains: false,
    doExtraScan: false,
    apiKey: '',
    theme: 'light',
    introStep: 0,
    error: '',
  });
  useDataStore.setState({
    url: '',
    data: [],
    stat: { vulnerable: 0, scanned: 0 },
    settings: {},
    landingSeen: false,
    loaded: false,
  });
});

describe('useSettingsStore', () => {
  it('setApiKey updates state and persists via change_settings', () => {
    useSettingsStore.getState().setApiKey('abc');
    expect(useSettingsStore.getState().apiKey).toBe('abc');
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'change_settings',
        settings: expect.objectContaining({ apiKey: 'abc' }),
      }),
      undefined
    );
  });

  it('toggles flip and persist', () => {
    useSettingsStore.getState().setShowAllDomains();
    expect(useSettingsStore.getState().showAllDomains).toBe(true);
    useSettingsStore.getState().setShowNotVulnerable();
    expect(useSettingsStore.getState().showOnlyVulnerable).toBe(true);
    useSettingsStore.getState().setDoExtraScan();
    expect(useSettingsStore.getState().doExtraScan).toBe(true);
    expect(send).toHaveBeenCalledTimes(3);
  });

  it('changeTheme toggles light/dark', () => {
    useSettingsStore.getState().changeTheme();
    expect(useSettingsStore.getState().theme).toBe('dark');
    useSettingsStore.getState().changeTheme();
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('setIntroStep, openSettings, closeSettings, updateSettings', () => {
    useSettingsStore.getState().setIntroStep(2);
    expect(useSettingsStore.getState().introStep).toBe(2);
    useSettingsStore.getState().openSettings();
    expect(useSettingsStore.getState().open).toBe(true);
    useSettingsStore.getState().closeSettings();
    expect(useSettingsStore.getState().open).toBe(false);
    useSettingsStore.getState().updateSettings({ error: 'boom' });
    expect(useSettingsStore.getState().error).toBe('boom');
  });

  it('validateAPIKey sends validate_key and forwards the response', () => {
    send.mockImplementation((_msg, cb) => cb?.({ valid: true }));
    const cb = jest.fn();
    useSettingsStore.getState().validateAPIKey('key', cb);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'validate_key', apiKey: 'key' }),
      expect.any(Function)
    );
    expect(cb).toHaveBeenCalledWith({ valid: true });
  });
});

describe('useDataStore', () => {
  it('loadData stores the response and mirrors settings', () => {
    const response: VulnerabilitiesResponse = {
      data: [{ name: 'example.com', software: {}, vulnerable: false }],
      stat: { vulnerable: 0, scanned: 1 },
      settings: {
        showOnlyVulnerable: true,
        showAllDomains: false,
        doExtraScan: true,
        apiKey: 'k',
        introStep: 0,
        error: '',
      },
      landingSeen: true,
      url: 'example.com',
    };
    send.mockImplementation((_msg, cb) => cb?.(response));

    useDataStore.getState().loadData();

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'show_vulnerabilities' }),
      expect.any(Function)
    );
    expect(useDataStore.getState().data).toHaveLength(1);
    expect(useDataStore.getState().loaded).toBe(true);
    expect(useDataStore.getState().url).toBe('example.com');
    // settings were mirrored into the settings store
    expect(useSettingsStore.getState().showOnlyVulnerable).toBe(true);
    expect(useSettingsStore.getState().apiKey).toBe('k');
  });

  it('clearData resets state and notifies the worker', () => {
    useDataStore.setState({ url: 'x', data: [{ name: 'x', software: {}, vulnerable: true }] });
    useDataStore.getState().clearData();
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ action: 'clear_data' }));
    expect(useDataStore.getState().url).toBe('');
    expect(useDataStore.getState().data).toEqual([]);
  });

  it('setLandingSeen and setLoading', () => {
    useDataStore.getState().setLandingSeen();
    expect(useDataStore.getState().landingSeen).toBe(true);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ action: 'landing_seen' }));
    useDataStore.setState({ loaded: true });
    useDataStore.getState().setLoading();
    expect(useDataStore.getState().loaded).toBe(false);
  });
});
