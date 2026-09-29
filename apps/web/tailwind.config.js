/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#090d12',
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#282e38',
        },
        violet: {
          neon: '#8b5cf6',
          glow: 'rgba(139, 92, 246, 0.35)',
        },
        emerald: {
          neon: '#10b981',
          glow: 'rgba(16, 185, 129, 0.35)',
        },
        cyan: {
          neon: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.35)',
        },
        backloggd: {
          dark: '#0c0e12',
          bg: '#12151b',
          surface: '#181c24',
          'surface-hover': '#212632',
          card: '#181c24',
          border: '#262d3d',
          'border-subtle': 'rgba(255, 255, 255, 0.08)',
          purple: '#6c52ee',
          'purple-hover': '#5b40e2',
          'purple-light': 'rgba(108, 82, 238, 0.15)',
          green: '#10b981',
          'green-light': 'rgba(16, 185, 129, 0.15)',
          amber: '#f59e0b',
          'amber-light': 'rgba(245, 158, 11, 0.15)',
          blue: '#0ea5e9',
          'blue-light': 'rgba(14, 165, 233, 0.15)',
          red: '#ef4444',
        },
      },
      boxShadow: {
        'backloggd': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'backloggd-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.6), 0 0 16px 2px rgba(108, 82, 238, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      aspectRatio: {
        'poster': '2 / 3',
        'poster-wide': '3 / 4',
      },
    },
  },
  plugins: [],
}
