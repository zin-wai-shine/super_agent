/** @type {import('tailwindcss').Config} */
// Force rebuild
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'sm': '3px',
        DEFAULT: '3px',
        'md': '3px',
        'lg': '3px',
        'xl': '3px',
        '2xl': '3px',
        '3xl': '0.75rem', // 12px
        'full': '9999px',
      },
      colors: {
        primary: {
          50: 'color-mix(in srgb, var(--primary-color), white 95%)',
          100: 'color-mix(in srgb, var(--primary-color), white 90%)',
          200: 'color-mix(in srgb, var(--primary-color), white 80%)',
          300: 'color-mix(in srgb, var(--primary-color), white 60%)',
          400: 'color-mix(in srgb, var(--primary-color), white 40%)',
          500: 'color-mix(in srgb, var(--primary-color), white 20%)',
          600: 'var(--primary-color)',
          700: 'color-mix(in srgb, var(--primary-color), black 20%)',
          800: 'color-mix(in srgb, var(--primary-color), black 40%)',
          900: 'color-mix(in srgb, var(--primary-color), black 60%)',
          DEFAULT: 'var(--primary-color)',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        'dashboard-dark': '#0D0F11',
        'dashboard-card': '#191D24',
        'dashboard-hover': '#2A3241',
        'dashboard-input': '#111318',
        'dashboard-border': '#272E3B',
        'dashboard-text': '#A6ADBB',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
