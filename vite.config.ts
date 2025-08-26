import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SUMMARY: Vite configuration for React + TS app. Enables React plugin and sets
// base defaults. Consider customizing server/proxy later for APIs.

export default defineConfig({
  plugins: [react()],
});


