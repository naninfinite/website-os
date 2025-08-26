import type { Config } from 'tailwindcss';

// SUMMARY: Tailwind configuration. Uses default preset; design tokens come via
// CSS variables. No raw hex in components. Content scan set to src + index.

export default {
  content: ['index.html', 'src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Example tokens mapped to CSS variables; themes will set these.
        foreground: 'rgb(var(--fg) / <alpha-value>)',
        background: 'rgb(var(--bg) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config;


