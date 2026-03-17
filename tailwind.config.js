/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        night: '#0a0a0f',
        surface: '#111118',
        card: '#16161f',
        border: '#1e1e2e',
        amber: {
          glow: '#f59e0b',
          soft: '#fbbf24',
          dim: '#92400e',
        },
        teal: {
          glow: '#14b8a6',
          soft: '#2dd4bf',
        },
        muted: '#4a4a6a',
        subtle: '#2a2a3e',
      },
      boxShadow: {
        glow: '0 0 20px rgba(245,158,11,0.15)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.15)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
