import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#0071E3',
          hover:   '#005BB5',
          light:   'rgba(0, 113, 227, 0.08)',
        },
        sidebar: {
          bg:     'rgba(255, 255, 255, 0.65)',
          border: 'rgba(0, 0, 0, 0.05)',
          text:   '#475569',
          active: '#0071E3',
        },
        app: {
          bg:     '#F5F5F7',
          card:   '#FFFFFF',
          border: 'rgba(0, 0, 0, 0.05)',
          input:  'rgba(0, 0, 0, 0.05)',
        },
        ja: {
          red:    '#FF3B30',
          'red-hover': '#D70015',
        },
      },
      boxShadow: {
        card:    '0 8px 30px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.08)',
        modal:   '0 20px 60px rgba(0,0,0,0.15)',
        toast:   '0 8px 24px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'apple': '32px',
      },
      animation: {
        'toast-in': 'toast-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'modal-in': 'modal-in 200ms cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
        'bar-grow': 'bar-grow 600ms cubic-bezier(0.34, 1.1, 0.64, 1) forwards',
        'fade-in':  'fade-in 150ms ease forwards',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'bar-grow': {
          from: { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          to:   { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [],
}
export default config
