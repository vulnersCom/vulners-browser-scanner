import { action, observable, makeObservable } from 'mobx';
import { sendMessage } from '../Browser';
import type { Settings } from '../types';

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

type Theme = (typeof THEMES)[keyof typeof THEMES];

export default class SettingsStore {
  THEMES = THEMES;

  open = false;
  showOnlyVulnerable = false;
  showAllDomains = false;
  doExtraScan = false;
  apiKey = '';
  theme: Theme = THEMES.LIGHT;
  introStep = 0;
  error = '';

  constructor() {
    makeObservable(this, {
      open: observable,
      showOnlyVulnerable: observable,
      showAllDomains: observable,
      doExtraScan: observable,
      introStep: observable,
      apiKey: observable,
      theme: observable,
      error: observable,

      setShowNotVulnerable: action,
      setShowAllDomains: action,
      setDoExtraScan: action,
      setApiKey: action,
      openSettings: action,
      closeSettings: action,
    });
    try {
      chrome.runtime.onMessage.addListener((message: { action?: string; settings?: Settings }) => {
        if (message.action === 'settings' && message.settings) {
          Object.assign(this, message.settings);
        }
      });
    } catch (e) {
      console.error('[Settings]', e);
    }
  }

  updateSettings = (settings: Partial<Settings>): void => {
    Object.assign(this, settings);
  };

  closeSettings = (): boolean => (this.open = false);

  openSettings = (): boolean => (this.open = true);

  setShowNotVulnerable = (): void => {
    this.showOnlyVulnerable = !this.showOnlyVulnerable;
    this.saveSettings();
  };

  setShowAllDomains = (): void => {
    this.showAllDomains = !this.showAllDomains;
    this.saveSettings();
  };

  setDoExtraScan = (): void => {
    this.doExtraScan = !this.doExtraScan;
    this.saveSettings();
  };

  setApiKey = (apiKey: string): void => {
    this.apiKey = apiKey;
    this.saveSettings();
  };

  changeTheme = (): void => {
    this.theme = this.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.saveSettings();
  };

  setIntroStep = (step: number): void => {
    this.introStep = step;
    this.saveSettings();
  };

  validateAPIKey = (apiKey: string, cb: (response: { valid?: boolean }) => void): void => {
    sendMessage<{ valid?: boolean }>({ action: 'validate_key', apiKey }, (response) =>
      cb(response)
    );
  };

  saveSettings = (cb?: (response: unknown) => void): void => {
    sendMessage(
      {
        action: 'change_settings',
        settings: {
          showOnlyVulnerable: this.showOnlyVulnerable,
          showAllDomains: this.showAllDomains,
          doExtraScan: this.doExtraScan,
          introStep: this.introStep,
          apiKey: this.apiKey,
          theme: this.theme,
          error: this.error,
        },
      },
      cb
    );
  };
}
