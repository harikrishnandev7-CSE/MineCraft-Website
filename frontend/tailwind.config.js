/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        cyber: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          neon: '#38bdf8',
          accent: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace', 'Consolas'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
