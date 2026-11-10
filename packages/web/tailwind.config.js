/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07090C',
        surface: '#0D1117',
        'surface-2': '#131A22',
        line: '#1F2933',
        text: '#E8EEF4',
        muted: '#9AA7B4',
        dim: '#66727F',
        accent: '#C6F24E',
        'accent-ink': '#0A0F05',
        cyan: '#4CC9F0',
        amber: '#FFB020',
        red: '#FF5D5D',
        green: '#35D07F',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '14px',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      transitionDuration: {
        120: '120ms',
        200: '200ms',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 200ms ease-out both',
        'toast-in': 'toast-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
}
