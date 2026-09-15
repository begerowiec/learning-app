import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@ui/app/App.tsx';
import { registerServiceWorker } from '@ui/app/registerServiceWorker.ts';
import './styles/industry.css';
import './styles/app.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support and installability; see the module for why dev is excluded.
registerServiceWorker();
