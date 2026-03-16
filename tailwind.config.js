/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f0',
          100: '#f9eddb',
          200: '#f2d8b6',
          300: '#e9bc87',
          400: '#df9856',
          500: '#d77d34',
          600: '#c96529',
          700: '#a74d24',
          800: '#863e23',
          900: '#6d341f',
        },
        warm: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e8e0d4',
          300: '#d4c7b5',
          400: '#bda890',
          500: '#ab9074',
          600: '#9e7f67',
          700: '#846857',
          800: '#6c564a',
          900: '#59483f',
        },
        blush: {
          50: '#fdf5f4',
          100: '#fbeae8',
          200: '#f8d8d4',
          300: '#f1bab4',
          400: '#e6938b',
          500: '#d87068',
          600: '#c3524b',
          700: '#a3413c',
          800: '#883935',
          900: '#723432',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
