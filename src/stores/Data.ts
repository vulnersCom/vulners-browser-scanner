import { create } from 'zustand';
import { sendMessage } from '../Browser';
import { useSettingsStore } from './Settings';
import type {
  HostData,
  ScanStat,
  Settings,
  VulnerabilitiesResponse,
  WorkerMessage,
} from '../types';

export interface DataState {
  url: string;
  data: HostData[];
  stat: ScanStat;
  settings: Partial<Settings>;
  landingSeen: boolean;
  loaded: boolean;

  loadData: () => void;
  setLoading: () => void;
  clearData: () => void;
  setLandingSeen: () => void;
}

export function applyVulnerabilitiesResponse(data: VulnerabilitiesResponse): void {
  // Never log settings — they contain the user-supplied API key (secret).
  console.log('[VULNERS]', {
    type: 'SCAN_DATA_RECEIVED',
    hosts: data.data?.length ?? 0,
    stat: data.stat,
    url: data.url,
  });
  useDataStore.setState({
    url: data.url,
    data: data.data,
    stat: data.stat,
    settings: data.settings,
    landingSeen: data.landingSeen,
    loaded: true,
  });
  useSettingsStore.getState().updateSettings(data.settings);
}

export const useDataStore = create<DataState>((set) => ({
  url: '',
  data: [],
  stat: { vulnerable: 0, scanned: 0 },
  settings: {},
  landingSeen: false,
  loaded: false,

  loadData: () => {
    sendMessage<VulnerabilitiesResponse>({ action: 'show_vulnerabilities' }, (data) => {
      applyVulnerabilitiesResponse(data);
    });
  },

  setLoading: () => set({ loaded: false }),

  clearData: () => {
    sendMessage({ action: 'clear_data' });
    set({ url: '', data: [], stat: { vulnerable: 0, scanned: 0 } });
  },

  setLandingSeen: () => {
    set({ landingSeen: true });
    sendMessage({ action: 'landing_seen' });
  },
}));

try {
  chrome.runtime.onMessage.addListener((message: WorkerMessage) => {
    if (message.action === 'scan_update') {
      applyVulnerabilitiesResponse(message.response);
    }
  });
} catch (e) {
  console.error('[Data]', e);
}
