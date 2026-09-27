/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#0b1f33',
          900: '#0f2942',
          800: '#153656',
        },
        sky: {
          50: '#f0f8ff',
          100: '#e0f1fe',
          200: '#bae3fd',
          300: '#7cccfb',
          400: '#38b0f5',
          500: '#0e94e3',
          600: '#0275c1',
          700: '#035d9c',
        },
        status: {
          good: '#16a34a',
          warn: '#e69500',
          bad: '#dc2626',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 41, 66, 0.08), 0 1px 2px rgba(15, 41, 66, 0.06)',
        cardHover: '0 8px 20px rgba(15, 41, 66, 0.10)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
    },
  },
  plugins: [],
}
