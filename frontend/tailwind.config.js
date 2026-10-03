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
        orange: {
          400: '#faba7b', // Lighter shade
          500: '#F28C0F', // Main color requested
          600: '#d97c0d', // Darker shade
        },
        cyber: {
          dark: '#ffffff',
          card: '#f8fafc',
          border: '#e2e8f0',
          neon: '#F28C0F',
          accent: '#F28C0F',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace', 'Consolas'],
        sans: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
