/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nude: {
          50: '#fdf8f6',
          100: '#f9ede8',
          200: '#f2d9d0',
          300: '#e8c0b0',
          400: '#d99e88',
          500: '#c97e62',
          600: '#b5634a',
          700: '#96503c',
          800: '#7a4234',
          900: '#64372c',
        },
        mocha: {
          50: '#f9f5f0',
          100: '#f0e6d6',
          200: '#e1ccac',
          300: '#ccaa7c',
          400: '#b8884c',
          500: '#a46e34',
          600: '#8a5a2b',
          700: '#6e4722',
          800: '#57381c',
          900: '#3d2812',
        },
        cream: '#fdf8f4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
