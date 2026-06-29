import { createRoot } from 'react-dom/client';

import './scss/index.scss';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('body');
  if (container) {
    createRoot(container).render(<App />);
  }
});
