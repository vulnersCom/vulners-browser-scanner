import { action, observable, makeObservable } from 'mobx';
import { sendMessage } from '../Browser';
import type { HostData, ScanStat, Settings, VulnerabilitiesResponse } from '../types';
import type SettingsStore from './Settings';

export default class DataStore {
  url = '';
  data: HostData[] = [];
  stat: ScanStat = { vulnerable: 0, scanned: 0 };
  settings: Partial<Settings> = {};
  landingSeen = false;
  loaded = false;

  settingsStore: SettingsStore;

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;
    makeObservable(this, {
      url: observable,
      data: observable,
      stat: observable,
      landingSeen: observable,
      loaded: observable,

      loadData: action,
      clearData: action,
      setLandingSeen: action,
    });
  }

  loadData = (): void =>
    sendMessage<VulnerabilitiesResponse>({ action: 'show_vulnerabilities' }, (data) => {
      // Never log settings — they contain the user-supplied API key (secret).
      console.log('[VULNERS]', {
        type: 'LOAD_DATA_RECEIVED',
        hosts: data.data?.length ?? 0,
        stat: data.stat,
        url: data.url,
      });
      Object.assign(this, data);
      this.settingsStore.updateSettings(data.settings);
      this.loaded = true;
    });

  setLoading = (): boolean => (this.loaded = false);

  clearData = (): void => {
    sendMessage({ action: 'clear_data' });
    this.url = '';
    this.data = [];
    this.stat = { vulnerable: 0, scanned: 0 };
  };

  setLandingSeen = (): void => {
    this.landingSeen = true;
    sendMessage({ action: 'landing_seen' });
  };
}
