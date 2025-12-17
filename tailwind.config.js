/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        accent: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        // Dynamic colors using CSS variables with fallbacks
        gold: {
          50: 'rgb(var(--color-gold-50) / <alpha-value>)',
          100: 'rgb(var(--color-gold-100) / <alpha-value>)',
          200: 'rgb(var(--color-gold-200) / <alpha-value>)',
          300: 'rgb(var(--color-gold-300) / <alpha-value>)',
          400: 'rgb(var(--color-gold-400) / <alpha-value>)',
          500: 'rgb(var(--color-gold-500) / <alpha-value>)',
          600: 'rgb(var(--color-gold-600) / <alpha-value>)',
          700: 'rgb(var(--color-gold-700) / <alpha-value>)',
        },
        coffee: {
          50: 'rgb(var(--color-coffee-50) / <alpha-value>)',
          100: 'rgb(var(--color-coffee-100) / <alpha-value>)',
          200: 'rgb(var(--color-coffee-200) / <alpha-value>)',
          300: 'rgb(var(--color-coffee-300) / <alpha-value>)',
          400: 'rgb(var(--color-coffee-400) / <alpha-value>)',
          500: 'rgb(var(--color-coffee-500) / <alpha-value>)',
          600: 'rgb(var(--color-coffee-600) / <alpha-value>)',
          700: 'rgb(var(--color-coffee-700) / <alpha-value>)',
          800: 'rgb(var(--color-coffee-800) / <alpha-value>)',
          900: 'rgb(var(--color-coffee-900) / <alpha-value>)',
        },
        cream: {
          50: 'rgb(var(--color-cream-50) / <alpha-value>)',
          100: 'rgb(var(--color-cream-100) / <alpha-value>)',
          200: 'rgb(var(--color-cream-200) / <alpha-value>)',
          300: 'rgb(var(--color-cream-300) / <alpha-value>)',
          400: 'rgb(var(--color-cream-400) / <alpha-value>)',
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'gold': '0 4px 14px rgba(196, 160, 82, 0.25)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}