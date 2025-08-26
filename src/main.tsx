/**
 * SUMMARY
 * Entry point for the React application. Mounts the root component and applies
 * global styles (Tailwind + token CSS variables). Keep this minimal.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import './themes/tokens.css';
import './styles/index.css';
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


