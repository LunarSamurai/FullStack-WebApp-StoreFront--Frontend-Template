/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FEFDFB',
          100: '#FDF9F3',
          200: '#FAF3E8',
          300: '#F5EBDA',
          400: '#EEE0C8',
          500: '#E5D3B3'
        },
        coffee: {
          50: '#F9F6F3',
          100: '#EDE5DC',
          200: '#D9C7B5',
          300: '#C4A98D',
          400: '#A68763',
          500: '#8B6F4E',
          600: '#70593E',
          700: '#5A4832',
          800: '#3D3022',
          900: '#2A2118'
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4A854',
          600: '#B8942F',
          700: '#92751D',
          800: '#6B5A1A',
          900: '#4A3F12'
        }
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'serif'],
        'body': ['"DM Sans"', 'sans-serif'],
        'accent': ['"Italiana"', 'serif']
      },
      boxShadow: {
        'gold': '0 8px 32px -8px rgba(212, 168, 84, 0.4)',
        'gold-lg': '0 16px 48px -12px rgba(212, 168, 84, 0.5)',
        'card': '0 4px 24px -4px rgba(42, 33, 24, 0.08)',
        'card-hover': '0 12px 40px -8px rgba(42, 33, 24, 0.15)'
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 168, 84, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 168, 84, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
