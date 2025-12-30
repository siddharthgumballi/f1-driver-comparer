import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: {
          600: '#dc2626'
        }
      }
    },
  },
  plugins: [],
} satisfies Config
