import { create } from 'zustand';
import { sendMessage } from '../Browser';
import type { Settings } from '../types';

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export interface SettingsState {
  THEMES: typeof THEMES;
  open: boolean;
  showOnlyVulnerable: boolean;
  showAllDomains: boolean;
  doExtraScan: boolean;
  apiKey: string;
  theme: Theme;
  introStep: number;
  error: string;

  updateSettings: (settings: Partial<Settings>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  setShowNotVulnerable: () => void;
  setShowAllDomains: () => void;
  setDoExtraScan: () => void;
  setApiKey: (apiKey: string) => void;
  changeTheme: () => void;
  setIntroStep: (step: number) => void;
  validateAPIKey: (apiKey: string, cb: (response: { valid?: boolean }) => void) => void;
  saveSettings: (cb?: (response: unknown) => void) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const saveSettings = (cb?: (response: unknown) => void): void => {
    const s = get();
    sendMessage(
      {
        action: 'change_settings',
        settings: {
          showOnlyVulnerable: s.showOnlyVulnerable,
          showAllDomains: s.showAllDomains,
          doExtraScan: s.doExtraScan,
          introStep: s.introStep,
          apiKey: s.apiKey,
          theme: s.theme,
          error: s.error,
        },
      },
      cb
    );
  };

  return {
    THEMES,
    open: false,
    showOnlyVulnerable: false,
    showAllDomains: false,
    doExtraScan: false,
    apiKey: '',
    theme: THEMES.LIGHT,
    introStep: 0,
    error: '',

    updateSettings: (settings) => set(settings as Partial<SettingsState>),
    openSettings: () => set({ open: true }),
    closeSettings: () => set({ open: false }),
    setShowNotVulnerable: () => {
      set((s) => ({ showOnlyVulnerable: !s.showOnlyVulnerable }));
      saveSettings();
    },
    setShowAllDomains: () => {
      set((s) => ({ showAllDomains: !s.showAllDomains }));
      saveSettings();
    },
    setDoExtraScan: () => {
      set((s) => ({ doExtraScan: !s.doExtraScan }));
      saveSettings();
    },
    setApiKey: (apiKey) => {
      set({ apiKey });
      saveSettings();
    },
    changeTheme: () => {
      set((s) => ({ theme: s.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT }));
      saveSettings();
    },
    setIntroStep: (step) => {
      set({ introStep: step });
      saveSettings();
    },
    validateAPIKey: (apiKey, cb) => {
      sendMessage<{ valid?: boolean }>({ action: 'validate_key', apiKey }, (response) =>
        cb(response)
      );
    },
    saveSettings,
  };
});

// The background worker pushes settings updates; mirror them into the store.
try {
  chrome.runtime.onMessage.addListener((message: { action?: string; settings?: Settings }) => {
    if (message.action === 'settings' && message.settings) {
      useSettingsStore.getState().updateSettings(message.settings);
    }
  });
} catch (e) {
  console.error('[Settings]', e);
}
