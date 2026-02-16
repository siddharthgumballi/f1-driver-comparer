import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          darkRed: '#B30500',
          black: '#0D0D0D',
          carbon: '#1A1A1A',
          steel: '#2D2D2D',
          silver: '#6B6B6B',
          white: '#F1F1F1',
        },
        accent: {
          cyan: '#00D4FF',
          cyanDark: '#00A8CC',
          neon: '#39FF14',
          gold: '#FFD700',
        },
        red: {
          600: '#dc2626',
        },
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(225, 6, 0, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'f1-carbon':
          'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(13, 13, 13, 0.98) 100%)',
        'glass-light':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        'glass-dark':
          'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(13, 13, 13, 0.95) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      fontFamily: {
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.02em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
