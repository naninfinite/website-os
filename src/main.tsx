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
import { App } from './App';
import AppOG from './og/AppOG';

console.log('[env]', import.meta.env.VITE_FORCE_ERA, 'OG_ONLY=', import.meta.env.VITE_OG_ONLY);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const useOg = String(import.meta.env.VITE_OG_ONLY ?? 'true').toLowerCase() !== 'false';

createRoot(rootElement).render(
  <React.StrictMode>
    {useOg ? <AppOG /> : <App />}
  </React.StrictMode>
);


