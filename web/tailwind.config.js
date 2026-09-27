/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          bg: 'var(--hs-bg)',
          panel: 'var(--hs-panel)',
          'panel-raised': 'var(--hs-panel-raised)',
          border: 'var(--hs-border)',
          text: 'var(--hs-text)',
          muted: 'var(--hs-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--hs-accent)',
          secondary: 'var(--hs-accent-secondary)',
        },
        status: {
          online: 'var(--hs-status-online)',
          warn: 'var(--hs-status-warn)',
          critical: 'var(--hs-status-critical)',
        },
      },
      fontFamily: {
        // "Inter"/"JetBrains Mono" are used only if a server owner drops the
        // font files into web/public/fonts and adds @font-face rules (see
        // docs/configuration.md#fonts). No webfont is fetched by default -
        // ServerHub ships zero runtime font dependency and falls back to the
        // player's OS UI font.
        sans: ['"Inter"', '-apple-system', '"Segoe UI"', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        hs: '8px',
      },
    },
  },
  plugins: [],
};
