import { createRoot } from 'react-dom/client';

import './scss/index.scss';
import { Provider } from 'mobx-react';

import App from './App';
import DataStore from './stores/Data';
import SettingsStore from './stores/Settings';

const settingsStore = new SettingsStore();
const stores = {
  settingsStore,
  dataStore: new DataStore(settingsStore),
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('body');
  if (container) {
    createRoot(container).render(
      <Provider {...stores}>
        <App />
      </Provider>
    );
  }
});
