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
        sand: {
          50: '#FAF3E1',
          100: '#F5E7C6',
          200: '#E8D7B3',
        },
        ink: '#222222',
        'ink-muted': '#5C544C',
        primary: {
          50: '#fff4ec',
          100: '#ffe8d6',
          200: '#ffd0ad',
          300: '#ffb37d',
          400: '#ff8d4a',
          500: '#FF6D1F',
          600: '#f05e12',
          700: '#d94f0f',
          800: '#b83f0a',
          900: '#8f3006',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
