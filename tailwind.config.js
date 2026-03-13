/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ggz: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dfff',
          300: '#7cc4ff',
          400: '#36a6ff',
          500: '#0c8aff',
          600: '#006adf',
          700: '#0054b4',
          800: '#004794',
          900: '#003d7a',
          950: '#002651',
        },
      },
    },
  },
  plugins: [],
}
