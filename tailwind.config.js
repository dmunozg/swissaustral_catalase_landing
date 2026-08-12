/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18252b',
        paper: '#fbfaf7',
        'ice-mist': '#e5f1f3',
        'ice-blue': '#a4d4da',
        signal: '#e6282f',
        'deep-ice': '#0c202b',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(12, 32, 43, 0.09)',
        float: '0 24px 70px rgba(12, 32, 43, 0.18)',
      },
    },
  },
  plugins: [],
};
