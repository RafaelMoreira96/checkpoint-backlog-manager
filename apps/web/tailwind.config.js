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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      aspectRatio: {
        'poster': '3 / 4',
      },
    },
  },
  plugins: [],
}
