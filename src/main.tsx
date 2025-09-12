/**
 * SUMMARY
 * Entry point for the React application. Mounts the root component and applies
 * global styles (Tailwind + token CSS variables). Keep this minimal.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import './themes/tokens.css';
import './themes/eraThemes.css';
import './styles/index.css';

console.log('[env]', import.meta.env.VITE_FORCE_ERA, 'OG_ONLY=', import.meta.env.VITE_OG_ONLY);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const useOg = String(import.meta.env.VITE_OG_ONLY ?? 'true').toLowerCase() !== 'false';
const root = createRoot(rootElement);

(async () => {
  if (useOg) {
    const mod = await import('./og/AppOG');
    root.render(
      <React.StrictMode>
        <mod.default />
      </React.StrictMode>
    );
  } else {
    const mod = await import('./App');
    root.render(
      <React.StrictMode>
        <mod.App />
      </React.StrictMode>
    );
  }
})();


