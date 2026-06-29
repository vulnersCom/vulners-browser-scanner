import type SettingsStore from './Settings';
import type DataStore from './Data';

/** Stores provided through the mobx-react `<Provider>`. */
export interface Stores {
  settingsStore: SettingsStore;
  dataStore: DataStore;
}
